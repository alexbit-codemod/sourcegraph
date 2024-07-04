package resolvers

import (
	"context"
	"strings"

	"github.com/sourcegraph/log"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/cody"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/httpapi/completions"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/modelconfig"
	"github.com/sourcegraph/sourcegraph/internal/completions/client"
	"github.com/sourcegraph/sourcegraph/internal/completions/types"
	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/redispool"
	"github.com/sourcegraph/sourcegraph/internal/telemetry/telemetryrecorder"
	"github.com/sourcegraph/sourcegraph/lib/errors"

	modelconfigSDK "github.com/sourcegraph/sourcegraph/internal/modelconfig/types"
)

var _ graphqlbackend.CompletionsResolver = &completionsResolver{}

// completionsResolver provides chat completions
type completionsResolver struct {
	rl     completions.RateLimiter
	db     database.DB
	logger log.Logger
}

func NewCompletionsResolver(db database.DB, logger log.Logger) graphqlbackend.CompletionsResolver {
	rl := completions.NewRateLimiter(db, redispool.Store, types.CompletionsFeatureChat)
	return &completionsResolver{rl: rl, db: db, logger: logger}
}

func (c *completionsResolver) Completions(ctx context.Context, args graphqlbackend.CompletionsArgs) (_ string, err error) {
	if isEnabled, reason := cody.IsCodyEnabled(ctx, c.db); !isEnabled {
		return "", errors.Newf("cody is not enabled: %s", reason)
	}

	if err := cody.CheckVerifiedEmailRequirement(ctx, c.db, c.logger); err != nil {
		return "", err
	}

	// This GraphQL endpoint doesn't support picking the specific model, and just relies on the default
	// Chat/FastChat model instead.
	modelconfigSvc := modelconfig.Get()
	modelConfig, err := modelconfigSvc.Get()
	if err != nil {
		return "", errors.Wrap(err, "getting current LLM configuration")
	}

	mref := modelConfig.DefaultModels.Chat
	if args.Fast {
		mref = modelConfig.DefaultModels.FastChat
	}
	wantProviderID := mref.ProviderID()
	var gotProvider *modelconfigSDK.Provider
	for i := range modelConfig.Providers {
		provider := &modelConfig.Providers[i]
		if provider.ID == wantProviderID {
			gotProvider = provider
			break
		}
	}
	var gotModel *modelconfigSDK.Model
	for i := range modelConfig.Models {
		model := &modelConfig.Models[i]
		if model.ModelRef == mref {
			gotModel = model
			break
		}
	}
	if gotProvider == nil || gotModel == nil {
		return "", errors.Errorf("unable to locate provider or model config for mref %q", mref)
	}
	modelConfigInfo := types.ModelConfigInfo{
		Provider: *gotProvider,
		Model:    *gotModel,
	}

	ctx, done := completions.Trace(ctx, "resolver", gotModel.ModelName, int(args.Input.MaxTokensToSample)).
		WithErrorP(&err).
		Build()
	defer done()

	client, err := client.Get(c.logger, telemetryrecorder.New(c.db), modelConfigInfo)
	if err != nil {
		return "", errors.Wrap(err, "GetCompletionStreamClient")
	}

	// Check rate limit.
	if err := c.rl.TryAcquire(ctx); err != nil {
		return "", err
	}

	params := convertParams(args)
	request := types.CompletionRequest{
		Feature: types.CompletionsFeatureChat,
		// GraphQL API is considered a legacy API.
		Version:    types.CompletionsVersionLegacy,
		Parameters: params,
	}
	resp, err := client.Complete(ctx, c.logger, request)
	if err != nil {
		return "", errors.Wrap(err, "client.Complete")
	}
	return resp.Completion, nil
}

func convertParams(args graphqlbackend.CompletionsArgs) types.CompletionRequestParameters {
	return types.CompletionRequestParameters{
		Messages:          convertMessages(args.Input.Messages),
		Temperature:       float32(args.Input.Temperature),
		MaxTokensToSample: int(args.Input.MaxTokensToSample),
		TopK:              int(args.Input.TopK),
		TopP:              float32(args.Input.TopP),
	}
}

func convertMessages(messages []graphqlbackend.Message) (result []types.Message) {
	for _, message := range messages {
		result = append(result, types.Message{
			Speaker: strings.ToLower(message.Speaker),
			Text:    message.Text,
		})
	}
	return result
}
