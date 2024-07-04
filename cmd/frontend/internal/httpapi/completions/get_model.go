package completions

import (
	"context"
	"fmt"
	"strings"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/cody"
	sgactor "github.com/sourcegraph/sourcegraph/internal/actor"
	"github.com/sourcegraph/sourcegraph/internal/dotcom"
	"github.com/sourcegraph/sourcegraph/internal/modelconfig"
	"github.com/sourcegraph/sourcegraph/lib/errors"

	"github.com/sourcegraph/sourcegraph/internal/completions/client/anthropic"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/fireworks"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/google"
	"github.com/sourcegraph/sourcegraph/internal/completions/types"
	"github.com/sourcegraph/sourcegraph/internal/database"

	modelconfigSDK "github.com/sourcegraph/sourcegraph/internal/modelconfig/types"
)

// legacyModelRef is a model reference that is of the form "provider/model".
// The type is just to catch conversion errors while we roll out modelconfigSDK.ModelRef
// as the "one, true model reference" mechanism.
type legacyModelRef string

func (lmr legacyModelRef) Parse() (string, string) {
	parts := strings.SplitN(string(lmr), "/", 2)
	switch len(parts) {
	case 2:
		return parts[0], parts[1]

		// Weird or unexpected formats.
	case 0, 1:
		fallthrough
	default:
		return "", string(lmr)
	}
}

// EqualToIgnoringAPIVersion compares the legacyModelRef to the actual ModelRef,
// but ignoring the ModelRef's APIVersionID. (Because that's information the legacy
// format doesn't have.)
func (lmr legacyModelRef) EqualToIgnoringAPIVersion(mref modelconfigSDK.ModelRef) bool {
	if lmr == "" {
		return false
	}

	lmrProvider, lmrModel := lmr.Parse()
	mrefProvider := string(mref.ProviderID())
	mrefModel := string(mref.ModelID())
	return lmrProvider == mrefProvider && lmrModel == mrefModel
}

// ToModelRef returns a BEST GUESS at the actual ModelRef for the
// LLM model. We don't know the APIVersionID, and there is no guarantee
// that the configured providers match the referenced name. So there will
// be bugs if various things don't align perfectly.
func (lmr legacyModelRef) ToModelRef() modelconfigSDK.ModelRef {
	provider, model := lmr.Parse()
	converted := fmt.Sprintf("%s::unknown::%s", provider, model)
	return modelconfigSDK.ModelRef(converted)
}

// getModelFn is the thunk used to return the LLM model we should use for processing
// the supplied completion request. Depending on the incomming request, site config,
// feature used, etc. it could be any number of things.
//
// IMPORTANT: This returns a `ModelRef“, of the form "provider-id::api-verison-id::model-id",
// but for backwards compatibility currently expects to receive models in the older style
// `legacyModelRef“, of the form "provider-id/model-id".
type getModelFn func(
	ctx context.Context, requestParams types.CodyCompletionRequestParameters, c *modelconfigSDK.ModelConfiguration) (
	modelconfigSDK.ModelRef, error)

func getCodeCompletionModelFn() getModelFn {
	return func(
		_ context.Context, requestParams types.CodyCompletionRequestParameters, cfg *modelconfigSDK.ModelConfiguration) (
		modelconfigSDK.ModelRef, error) {
		if cfg == nil {
			return "", errors.New("no configuration data supplied")
		}

		// Default to model to use to the site's configuration if unspecified.
		requestedModel := requestParams.Model
		if requestParams.Model == "" {
			requestParams.Model = types.TaintedModelRef(cfg.DefaultModels.CodeCompletion)
		}

		// We want to support newer clients sending fully-qualified ModelRefs, as well as older
		// clients using the legacy format. So we check if the incomming model reference is in either
		// format.
		var (
			mref       modelconfigSDK.ModelRef = modelconfigSDK.ModelRef(requestParams.Model)
			legacyMRef legacyModelRef          = legacyModelRef(requestParams.Model)
		)

		// For Cody Pro users, we support more models than can be defined in the site
		// configuration. So we need first check against a static allow list.
		//
		// TODO: When we have the ability within the site config to rely on Sourcegraph
		// supplied models, we can remove this step and rely on the data embedded in
		// the binary.
		//
		// BUG: A side effect of this, is that Cody Pro users _cannot_ specify models
		// using the newer MRef syntax.
		if dotcom.SourcegraphDotComMode() {
			if isAllowedCodyProCompletionModel(legacyMRef) {
				return legacyMRef.ToModelRef(), nil
			}
			return "", errors.Errorf("unsupported Cody Pro completion model %q", legacyMRef)
		}

		// If the caller requested a specific model we simply lookg it up in the ModelConfiguration.
		// By construction, if it is in the ModelConfiguration, then it is allowed.
		for _, supportedModel := range cfg.Models {
			// Requested model was in the newer format.
			if supportedModel.ModelRef == mref {
				return mref, nil
			}
			// If the request is using the older format, then we are relying on the
			// assumption that the user-supplied legacyMRef's provider and model names
			// match the ProviderID and ModelID. (Likely, but may not be the case.)
			if legacyMRef.EqualToIgnoringAPIVersion(supportedModel.ModelRef) {
				return supportedModel.ModelRef, nil
			}
		}

		err := errors.Errorf(
			"unsupported code completion model %q (default %q)",
			requestedModel, cfg.DefaultModels.CodeCompletion)
		return "", err
	}
}

func getChatModelFn(db database.DB) getModelFn {
	return func(
		ctx context.Context, requestParams types.CodyCompletionRequestParameters, cfg *modelconfigSDK.ModelConfiguration) (
		modelconfigSDK.ModelRef, error) {
		// If running on dotcom, i.e. using Cody Free/Cody Pro, then a number
		// of models are available depending on the caller's subscription status.
		if dotcom.SourcegraphDotComMode() {
			actor := sgactor.FromContext(ctx)
			user, err := actor.User(ctx, db.Users())
			if err != nil {
				return "", err
			}

			subscription, err := cody.SubscriptionForUser(ctx, db, *user)
			if err != nil {
				return "", err
			}

			// Note that Cody Pro users MUST specify the model to use on all requests.
			legacyMRef := legacyModelRef(requestParams.Model)
			if isAllowedCodyProChatModel(legacyMRef, subscription.ApplyProRateLimits) {
				return legacyMRef.ToModelRef(), nil
			}
			errModelNotAllowed := errors.Errorf(
				"the requested model is not available (%q, onProTier=%b)",
				requestParams.Model, subscription.ApplyProRateLimits)
			return "", errModelNotAllowed
		}

		// If FastChat is specified, we just use whatever the designated "fast" model is.
		// Otherwise, we try to find whatever model matches based on the default.
		if requestParams.Fast {
			return cfg.DefaultModels.FastChat, nil
		}

		// We want to support newer clients sending fully-qualified ModelRefs, as well as older
		// clients using the legacy format. So we check if the incomming model reference is in either
		// format.
		requestedModel := requestParams.Model
		if requestParams.Model == "" {
			requestParams.Model = types.TaintedModelRef(cfg.DefaultModels.Chat)
		}
		var (
			mref       modelconfigSDK.ModelRef = modelconfigSDK.ModelRef(requestParams.Model)
			legacyMRef legacyModelRef          = legacyModelRef(requestParams.Model)
		)
		// If the caller requested a specific model we simply lookg it up in the ModelConfiguration.
		// By construction, if it is in the ModelConfiguration, then it is allowed.
		for _, supportedModel := range cfg.Models {
			if supportedModel.ModelRef == mref {
				return mref, nil
			}
			if legacyMRef.EqualToIgnoringAPIVersion(supportedModel.ModelRef) {
				return supportedModel.ModelRef, nil
			}
		}

		err := errors.Errorf(
			"unsupported code completion model %q (default %q)",
			requestedModel, cfg.DefaultModels.Chat)
		return "", err
	}
}

// Returns whether or not the supplied model is available to Cody Pro users.
//
// BUG: This is temporary, and will be replaced when we support the site configuration
// allowing a Sourcegraph instance to fall back to "Sourcegraph supplied" LLM models.
//
// For now, because that isn't possible, all a Sourcegraph instance can use to determine
// which models are supported are the 3x that are put into the site's "completions config".
func isAllowedCodyProChatModel(model legacyModelRef, isProUser bool) bool {
	// When updating these two lists, make sure you also update `allowedModels` in codygateway_dotcom_user.go.
	if isProUser {
		switch model {
		case
			"anthropic/" + anthropic.Claude3Haiku,
			"anthropic/" + anthropic.Claude3Sonnet,
			"anthropic/" + anthropic.Claude35Sonnet,
			"anthropic/" + anthropic.Claude3Opus,
			"fireworks/" + fireworks.Mixtral8x7bInstruct,
			"fireworks/" + fireworks.Mixtral8x22Instruct,
			"openai/gpt-3.5-turbo",
			"openai/gpt-4o",
			"openai/gpt-4-turbo",
			"openai/gpt-4-turbo-preview",
			"google/" + google.Gemini15FlashLatest,
			"google/" + google.Gemini15ProLatest,
			"google/" + google.GeminiProLatest,
			"google/" + google.Gemini15Flash001,
			"google/" + google.Gemini15Pro001,
			"google/" + google.Gemini15Flash,
			"google/" + google.Gemini15Pro,
			"google/" + google.GeminiPro,

			// Remove after the Claude 3 rollout is complete
			"anthropic/claude-2",
			"anthropic/claude-2.0",
			"anthropic/claude-2.1",
			"anthropic/claude-instant-1.2-cyan",
			"anthropic/claude-instant-1.2",
			"anthropic/claude-instant-v1",
			"anthropic/claude-instant-1":
			return true
		}
	} else {
		// Models available to Cody Free users.
		switch model {
		case
			"anthropic/" + anthropic.Claude3Haiku,
			"anthropic/" + anthropic.Claude3Sonnet,
			"anthropic/" + anthropic.Claude35Sonnet,
			"fireworks/" + fireworks.Mixtral8x7bInstruct,
			"fireworks/" + fireworks.Mixtral8x22Instruct,
			"openai/gpt-3.5-turbo",
			"google/" + google.Gemini15FlashLatest,
			"google/" + google.Gemini15ProLatest,
			"google/" + google.GeminiProLatest,
			"google/" + google.Gemini15Flash,
			"google/" + google.Gemini15Pro,
			"google/" + google.GeminiPro,
			// Remove after the Claude 3 rollout is complete
			"anthropic/claude-2",
			"anthropic/claude-2.0",
			"anthropic/claude-instant-v1",
			"anthropic/claude-instant-1":
			return true
		}
	}

	return false
}

// Returns whether or not Cody Pro users have access to the given model.
// See the comment on `isAllowedCodyProModelChatModel` why this function
// is required as we transition to using server-side LLM model configuration.
func isAllowedCodyProCompletionModel(model legacyModelRef) bool {
	switch model {
	case "fireworks/starcoder",
		"fireworks/starcoder-16b",
		"fireworks/starcoder-7b",
		"fireworks/starcoder2-15b",
		"fireworks/starcoder2-7b",
		"fireworks/" + fireworks.Starcoder16b,
		"fireworks/" + fireworks.Starcoder7b,
		"fireworks/" + fireworks.Llama27bCode,
		"fireworks/" + fireworks.Llama213bCode,
		"fireworks/" + fireworks.Llama213bCodeInstruct,
		"fireworks/" + fireworks.Llama234bCodeInstruct,
		"fireworks/" + fireworks.Mistral7bInstruct,
		"fireworks/" + fireworks.FineTunedFIMVariant1,
		"fireworks/" + fireworks.FineTunedFIMVariant2,
		"fireworks/" + fireworks.FineTunedFIMVariant3,
		"fireworks/" + fireworks.FineTunedFIMVariant4,
		"fireworks/" + fireworks.FineTunedFIMLangSpecificMixtral,
		"fireworks/" + fireworks.DeepseekCoder1p3b,
		"fireworks/" + fireworks.DeepseekCoder7b,
		"anthropic/claude-instant-1.2",
		"anthropic/claude-3-haiku-20240307",
		// Deprecated model identifiers
		"anthropic/claude-instant-v1",
		"anthropic/claude-instant-1",
		"anthropic/claude-instant-1.2-cyan",
		"google/" + google.Gemini15Flash,
		"google/" + google.Gemini15FlashLatest,
		"google/" + google.Gemini15Flash001,
		"google/" + google.GeminiPro,
		"google/" + google.GeminiProLatest,
		"fireworks/accounts/sourcegraph/models/starcoder-7b",
		"fireworks/accounts/sourcegraph/models/starcoder-16b",
		"fireworks/accounts/fireworks/models/starcoder-3b-w8a16",
		"fireworks/accounts/fireworks/models/starcoder-1b-w8a16":
		return true
	}

	return false
}

// resolveRequestedModel loads the provider and model configuration data for whatever model the user is requesting.
// Any errors returned are assumed to be user-facing, such as "you don't have access to model X", etc.
func resolveRequestedModel(
	ctx context.Context,
	cfg *modelconfigSDK.ModelConfiguration, request types.CodyCompletionRequestParameters, getModelFn getModelFn) (
	*modelconfigSDK.Provider, *modelconfigSDK.Model, error) {

	// Resolve the requested model.
	mref, err := getModelFn(ctx, request, cfg)
	if err != nil {
		return nil, nil, err
	}

	// SUPER SHADY HACK: Because right now we do NOT restrict Cody Pro models to be ONLY those defined in the
	// configuration data, it's very likely that the model and provider simply won't be found. So for the dotcom
	// case, the configuration data is kinda useless. dotcom sets the "completions.provider" to "sourcegraph",
	// and leaves the "chatModel" and related config to their defaults.
	//
	// So unfortunately we have to syntesize the Provider and Model objects dynamically. (And rely on the
	// Cody Gateway completion provider to not get fancy and look for any client-side configuration data.)
	if dotcom.SourcegraphDotComMode() {
		fauxProvider := modelconfigSDK.Provider{
			ID: mref.ProviderID(),
			// If the instance is configured to be in dotcom mode, we assume the "completions.provider"
			// is "sourcegraph", and therefore the ServerSideConfig will be set correctly.
			// See `frontend/internal/modelconfig/siteconfig_completions_test.go`.
			ServerSideConfig: cfg.Providers[0].ServerSideConfig,
		}
		fauxModel := modelconfigSDK.Model{
			ModelRef: mref,
			// Leave everything invalid, even ContextWindow.
			// Which will for the time being be set within the
			// completion provider.
		}
		return &fauxProvider, &fauxModel, nil
	}

	// Look up the provider and model config from the configuration data available.
	if err := modelconfig.ValidateModelRef(mref); err != nil {
		// This shouldn't happen in-practice outside of unit tests, and is more to
		// catch bugs on our end.
		return nil, nil, errors.Wrapf(err, "getModelFn(%q) returned invalid mref", mref)
	}

	var (
		providerConfig *modelconfigSDK.Provider
		modelConfig    *modelconfigSDK.Model
	)
	resolvedModelProviderID := mref.ProviderID()
	for i := range cfg.Providers {
		if cfg.Providers[i].ID == resolvedModelProviderID {
			providerConfig = &cfg.Providers[i]
			break
		}
	}
	if providerConfig == nil {
		return nil, nil, errors.Errorf("unable to find provider for model %q", mref)
	}

	for i := range cfg.Models {
		if cfg.Models[i].ModelRef == mref {
			modelConfig = &cfg.Models[i]
			break
		}
	}
	if modelConfig == nil {
		return nil, nil, errors.Errorf("unable to find model %q", mref)
	}

	return providerConfig, modelConfig, nil
}
