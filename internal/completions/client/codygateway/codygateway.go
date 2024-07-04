package codygateway

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/sourcegraph/log"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"

	"github.com/sourcegraph/sourcegraph/internal/actor"
	"github.com/sourcegraph/sourcegraph/internal/codygateway"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/anthropic"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/fireworks"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/google"
	"github.com/sourcegraph/sourcegraph/internal/completions/client/openai"
	"github.com/sourcegraph/sourcegraph/internal/completions/tokenusage"
	"github.com/sourcegraph/sourcegraph/internal/completions/types"
	"github.com/sourcegraph/sourcegraph/internal/conf/conftypes"
	"github.com/sourcegraph/sourcegraph/internal/httpcli"
	"github.com/sourcegraph/sourcegraph/lib/errors"
)

// NewClient instantiates a completions provider backed by Sourcegraph's managed
// Cody Gateway service.
func NewClient(cli httpcli.Doer, endpoint, accessToken string, tokenManager tokenusage.Manager) (types.CompletionsClient, error) {
	gatewayURL, err := url.Parse(endpoint)
	if err != nil {
		return nil, err
	}
	return &codyGatewayClient{
		upstream:     cli,
		gatewayURL:   gatewayURL,
		accessToken:  accessToken,
		tokenManager: tokenManager,
	}, nil
}

type codyGatewayClient struct {
	upstream     httpcli.Doer
	gatewayURL   *url.URL
	accessToken  string
	tokenManager tokenusage.Manager
}

func (c *codyGatewayClient) Stream(
	ctx context.Context, logger log.Logger, request types.CompletionRequest, sendEvent types.SendCompletionEvent) error {
	cc, err := c.clientForParams(request.Feature, &request)
	if err != nil {
		return err
	}

	err = cc.Stream(ctx, logger, request, sendEvent)
	return overwriteErrSource(err)
}

func (c *codyGatewayClient) Complete(ctx context.Context, logger log.Logger, request types.CompletionRequest) (*types.CompletionResponse, error) {
	cc, err := c.clientForParams(request.Feature, &request)
	if err != nil {
		return nil, err
	}
	resp, err := cc.Complete(ctx, logger, request)
	return resp, overwriteErrSource(err)
}

// overwriteErrSource should be used on all errors returned by an underlying
// types.CompletionsClient to avoid confusing error messages.
func overwriteErrSource(err error) error {
	if err == nil {
		return nil
	}
	if statusErr, ok := types.IsErrStatusNotOK(err); ok {
		statusErr.Source = "Sourcegraph Cody Gateway"
	}
	return err
}

func (c *codyGatewayClient) clientForParams(feature types.CompletionsFeature, request *types.CompletionRequest) (types.CompletionsClient, error) {
	// Tease out the ProviderID and ModelID from the requested model.
	model := request.ModelConfigInfo.Model
	providerID := model.ModelRef.ProviderID() // e.g. "anthropic"
	modelID := model.ModelRef.ModelID()       // e.g. "claude-1.5-instant"

	// We then return a CompletionsClient specific to the provider. Except configured in such a way
	// that the request will be sent to Cody Gateway.
	//
	// Note that we set the endpoint and access token for the API provider to "". The trick is that
	// the httpcli.Doer will route this to Cody Gateway, and use the the `codyGatewayClient`'s access token.
	switch conftypes.CompletionsProviderName(providerID) {
	case conftypes.CompletionsProviderNameAnthropic:
		doer := gatewayDoer(c.upstream, feature, c.gatewayURL, c.accessToken, "/v1/completions/anthropic-messages")
		client := anthropic.NewClient(doer, "", "", true, c.tokenManager)
		return client, nil
	case conftypes.CompletionsProviderNameOpenAI:
		doer := gatewayDoer(c.upstream, feature, c.gatewayURL, c.accessToken, "/v1/completions/openai")
		client := openai.NewClient(doer, "", "", c.tokenManager)
		return client, nil
	case conftypes.CompletionsProviderNameFireworks:
		doer := gatewayDoer(c.upstream, feature, c.gatewayURL, c.accessToken, "/v1/completions/fireworks")
		client := fireworks.NewClient(doer, "", "")
		return client, nil
	case conftypes.CompletionsProviderNameGoogle:
		doer := gatewayDoer(c.upstream, feature, c.gatewayURL, c.accessToken, "/v1/completions/google")
		return google.NewClient(doer, "", "", true)

	case "":
		return nil, errors.Newf("no provider available for modelID %q - a model in the format '$PROVIDER/$MODEL_NAME' is expected", modelID)
	default:
		return nil, errors.Newf("no client known for upstream provider %q", providerID)
	}
}

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (rt roundTripperFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return rt(req)
}

// gatewayDoer redirects requests to Cody Gateway with all prerequisite headers.
func gatewayDoer(upstream httpcli.Doer, feature types.CompletionsFeature, gatewayURL *url.URL, accessToken, path string) httpcli.Doer {
	return httpcli.DoerFunc(func(req *http.Request) (*http.Response, error) {
		req.Host = gatewayURL.Host
		req.URL = gatewayURL
		req.URL.Path = path
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
		req.Header.Set(codygateway.FeatureHeaderName, string(feature))

		// HACK: Add actor transport directly. We tried adding the actor transport
		// in https://github.com/sourcegraph/sourcegraph/commit/6b058221ca87f5558759d92c0d72436cede70dc4
		// but it doesn't seem to work.
		resp, err := (&actor.HTTPTransport{
			RoundTripper: roundTripperFunc(func(r *http.Request) (*http.Response, error) {
				return upstream.Do(r)
			}),
		}).RoundTrip(req)

		// If we get a repsonse, record Cody Gateway's x-trace response header,
		// so that we can link up to an event on our end if needed.
		if resp != nil && resp.Header != nil {
			if span := trace.SpanFromContext(req.Context()); span.SpanContext().IsValid() {
				// Would be cool if we can make an OTEL trace link instead, but
				// adding a link after a span has started is not supported yet:
				// https://github.com/open-telemetry/opentelemetry-specification/issues/454
				span.SetAttributes(attribute.String("cody-gateway.x-trace", resp.Header.Get("X-Trace")))
				span.SetAttributes(attribute.String("cody-gateway.x-trace-span", resp.Header.Get("X-Trace-Span")))
			}
		}

		return resp, err
	})
}
