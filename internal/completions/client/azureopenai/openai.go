package azureopenai

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore"
	"github.com/Azure/azure-sdk-for-go/sdk/azcore/policy"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/google/uuid"
	"github.com/pkoukk/tiktoken-go"
	tiktoken_loader "github.com/pkoukk/tiktoken-go-loader"
	"golang.org/x/net/http2"

	"github.com/sourcegraph/sourcegraph/internal/completions/tokenizer"
	"github.com/sourcegraph/sourcegraph/internal/httpcli"

	"github.com/sourcegraph/log"

	"github.com/sourcegraph/sourcegraph/internal/completions/tokenusage"
	"github.com/sourcegraph/sourcegraph/internal/completions/types"
	"github.com/sourcegraph/sourcegraph/lib/errors"
)

// HTTP proxy value to be used for id token requests to Azure
// This value will only used when using an access token is not provided
// and it will only apply to requests made to the Azure authentication endpoint
// not other requests such as to the OpenAI API
var authProxyURL = os.Getenv("CODY_AZURE_OPENAI_IDENTITY_HTTP_PROXY")

// We want to reuse the client because when using the DefaultAzureCredential
// it will acquire a short lived token and reusing the client
// prevents acquiring a new token on every request.
// The client will refresh the token as needed.
var apiClient completionsClient
var startTokenRefresherOnce sync.Once

type TokenResponse struct {
	AccessToken string `json:"access_token"`
}

type completionsClient struct {
	mu          sync.RWMutex
	accessToken string
	endpoint    string
	client      *azopenai.Client
}

type CompletionsClient interface {
	GetCompletionsStream(ctx context.Context, body azopenai.CompletionsOptions, options *azopenai.GetCompletionsStreamOptions) (azopenai.GetCompletionsStreamResponse, error)
	GetCompletions(ctx context.Context, body azopenai.CompletionsOptions, options *azopenai.GetCompletionsOptions) (azopenai.GetCompletionsResponse, error)
	GetChatCompletions(ctx context.Context, body azopenai.ChatCompletionsOptions, options *azopenai.GetChatCompletionsOptions) (azopenai.GetChatCompletionsResponse, error)
	GetChatCompletionsStream(ctx context.Context, body azopenai.ChatCompletionsOptions, options *azopenai.GetChatCompletionsStreamOptions) (azopenai.GetChatCompletionsStreamResponse, error)
}

// MockAzureAPIClientTransport is a hack enabling you to intercept the HTTP
// client used by the Azure SDK. This should only be set by unit tests.
var MockAzureAPIClientTransport httpcli.Doer

func getAccessToken(tokenRetrievalEndpoint, clientID, clientSecret string) (string, error) {
	data := map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"scope":         "azureopenai-readwrite",
		"grant_type":    "client_credentials",
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", errors.New("error marshalling JSON: " + err.Error())
	}

	req, err := http.NewRequest("POST", tokenRetrievalEndpoint, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", errors.New("error creating request: " + err.Error())
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", errors.New("error making request: " + err.Error())
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("request failed with status: " + resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("error reading response body: " + err.Error())
	}

	var tokenResponse TokenResponse
	err = json.Unmarshal(body, &tokenResponse)
	if err != nil {
		return "", errors.New("error decoding response: " + err.Error())
	}

	return tokenResponse.AccessToken, nil
}

func startTokenRefresher(endpoint, tokenRetrievalEndpoint, clientID, clientSecret string, logger log.Logger) {
	startTokenRefresherOnce.Do(func() {
		ticker := time.NewTicker(29 * time.Minute)
		go func() {
			for {
				<-ticker.C
				refreshAccessToken(endpoint, tokenRetrievalEndpoint, clientID, clientSecret, logger)
			}
		}()
	})
}

func refreshAccessToken(endpoint, tokenRetrievalEndpoint, clientID, clientSecret string, logger log.Logger) {
	apiClient.mu.Lock()
	defer apiClient.mu.Unlock()

	accessToken, err := getAccessToken(tokenRetrievalEndpoint, clientID, clientSecret)
	if err != nil {
		logger.Warn("Failed to get the accessToken  %w", log.Error(err))
		return
	}

	credential := azcore.NewKeyCredential(accessToken)
	clientOpts := &azopenai.ClientOptions{
		ClientOptions: azcore.ClientOptions{
			Transport: apiVersionClient("2023-05-15"),
			PerRetryPolicies: []policy.Policy{
				&addHeadersPolicy{
					headers: generateHeaders(accessToken),
				},
			},
		},
	}
	apiClient.client, err = azopenai.NewClientWithKeyCredential(endpoint, credential, clientOpts)
	if err != nil {
		logger.Warn("Failed to reset Azure credentials %w", log.Error(err))
		return
	}
	apiClient.endpoint = endpoint
	apiClient.accessToken = accessToken
}

// Custom policy to add multiple headers and log the request
type addHeadersPolicy struct {
	headers map[string]string
}

func generateHeaders(bearerToken string) map[string]string {
	return map[string]string{
		"correlationId":      uuid.New().String(),
		"dataClassification": "sensitive",
		"dataSource":         "internet",
		"Authorization":      "Bearer " + bearerToken,
	}
}
func (p *addHeadersPolicy) Do(req *policy.Request) (*http.Response, error) {
	for key, value := range p.headers {
		req.Raw().Header.Set(key, value)
	}
	return req.Next()
}

func GetAPIClient(endpoint, accessToken, tokenRetrievalEndpoint, clientId, clientSecret string, logger log.Logger) (CompletionsClient, error) {
	apiClient.mu.RLock()
	if apiClient.client != nil && apiClient.endpoint == endpoint && apiClient.accessToken != "" {
		apiClient.mu.RUnlock()
		return apiClient.client, nil
	}
	apiClient.mu.RUnlock()
	apiClient.mu.Lock()
	defer apiClient.mu.Unlock()

	// API Versions and docs https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#completions
	var err error
	if tokenRetrievalEndpoint != "" && accessToken == "" {
		accessToken, err = getAccessToken(tokenRetrievalEndpoint, clientId, clientSecret)
		if err != nil {
			logger.Warn("Failed to get the accessToken  %w", log.Error(err))
			return nil, err
		}
		startTokenRefresher(endpoint, tokenRetrievalEndpoint, clientId, clientSecret, logger)
	}
	clientOpts := &azopenai.ClientOptions{
		ClientOptions: azcore.ClientOptions{
			Transport: apiVersionClient("2023-05-15"),
			PerRetryPolicies: []policy.Policy{
				&addHeadersPolicy{
					headers: generateHeaders(accessToken),
				},
			},
		},
	}
	if accessToken != "" {
		credential := azcore.NewKeyCredential(accessToken)
		apiClient.client, err = azopenai.NewClientWithKeyCredential(endpoint, credential, clientOpts)
	} else {
		var opts *azidentity.DefaultAzureCredentialOptions
		opts, err = getCredentialOptions()
		if err != nil {
			return nil, err
		}
		credential, credErr := azidentity.NewDefaultAzureCredential(opts)
		if credErr != nil {
			return nil, credErr
		}
		apiClient.endpoint = endpoint

		apiClient.client, err = azopenai.NewClient(endpoint, credential, clientOpts)
	}
	return apiClient.client, err

}

func getCredentialOptions() (*azidentity.DefaultAzureCredentialOptions, error) {
	// if there is no proxy we don't need any options
	if authProxyURL == "" {
		return nil, nil
	}

	proxyUrl, err := url.Parse(authProxyURL)
	if err != nil {
		return nil, err
	}
	proxiedClient := &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl)}}
	return &azidentity.DefaultAzureCredentialOptions{
		ClientOptions: azcore.ClientOptions{
			Transport: proxiedClient,
		},
	}, nil

}

type GetCompletionsAPIClientFunc func(endpoint, accessToken, tokenRetrievalEndpoint, clientId, clientSecret string, logger log.Logger) (CompletionsClient, error)

func NewClient(getClient GetCompletionsAPIClientFunc, endpoint, accessToken, tokenRetrievalEndpoint, clientId, clientSecret string, tokenizer tokenusage.Manager, logger log.Logger) (types.CompletionsClient, error) {
	client, err := getClient(endpoint, accessToken, tokenRetrievalEndpoint, clientId, clientSecret, logger)
	if err != nil {
		return nil, err
	}
	return &azureCompletionClient{
		client:    client,
		tokenizer: tokenizer,
	}, nil
}

type azureCompletionClient struct {
	client    CompletionsClient
	tokenizer tokenusage.Manager
}

func (c *azureCompletionClient) Complete(
	ctx context.Context,
	log log.Logger,
	request types.CompletionRequest) (*types.CompletionResponse, error) {

	switch request.Feature {
	case types.CompletionsFeatureCode:
		return completeAutocomplete(ctx, c.client, request, log)
	case types.CompletionsFeatureChat:
		return completeChat(ctx, c.client, request, log)
	default:
		return nil, errors.New("invalid completions feature")
	}
}

func completeAutocomplete(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	log log.Logger,
) (*types.CompletionResponse, error) {
	useDeprecatedAPI := request.Parameters.AzureUseDeprecatedCompletionsAPIForOldModels
	if useDeprecatedAPI {
		return doCompletionsAPIAutocomplete(ctx, client, request, log)
	}
	return doChatCompletionsAPIAutocomplete(ctx, client, request, log)
}

func doChatCompletionsAPIAutocomplete(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	logger log.Logger,
) (*types.CompletionResponse, error) {
	response, err := client.GetChatCompletions(ctx, getChatOptions(request), nil)
	if err != nil {
		return nil, toStatusCodeError(err)
	}
	if !hasValidFirstChatChoice(response.Choices) {
		logger.Warn("response from Azure has no valid first chat choice")
		return &types.CompletionResponse{}, nil
	}
	requestParams := request.Parameters
	inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	outputTokens, err := NumTokensFromAzureOpenAiResponseString(*response.Choices[0].Delta.Content, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	// Note: If we had an error calculating input/output tokens, that is unfortunate, the
	// best thing we can do is record zero token usage which would be our hint to look at
	// the logs for errors.
	if err = recordTokenUsage(request, inputTokens, outputTokens); err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	return &types.CompletionResponse{
		Completion: *response.Choices[0].Delta.Content,
		StopReason: string(*response.Choices[0].FinishReason),
	}, nil
}

func doCompletionsAPIAutocomplete(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	logger log.Logger,
) (*types.CompletionResponse, error) {
	options, err := getCompletionsOptions(request)
	if err != nil {
		return nil, err
	}
	response, err := client.GetCompletions(ctx, options, nil)
	if err != nil {
		return nil, toStatusCodeError(err)
	}
	requestParams := request.Parameters
	inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	outputTokens, err := NumTokensFromAzureOpenAiResponseString(*response.Choices[0].Text, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	// Note: If we had an error calculating input/output tokens, that is unfortunate, the
	// best thing we can do is record zero token usage which would be our hint to look at
	// the logs for errors.
	if err = recordTokenUsage(request, inputTokens, outputTokens); err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	// Text and FinishReason are documented as REQUIRED but checking just to be safe
	if !hasValidFirstCompletionsChoice(response.Choices) {
		logger.Warn("response had no valid completions choice")
		return &types.CompletionResponse{}, nil
	}
	return &types.CompletionResponse{
		Completion: *response.Choices[0].Text,
		StopReason: string(*response.Choices[0].FinishReason),
	}, nil
}

func completeChat(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	logger log.Logger,
) (*types.CompletionResponse, error) {
	response, err := client.GetChatCompletions(ctx, getChatOptions(request), nil)
	if err != nil {
		return nil, toStatusCodeError(err)
	}
	if !hasValidFirstChatChoice(response.Choices) {
		logger.Warn("response from Azure has no valid chat choices")
		return &types.CompletionResponse{}, nil
	}
	requestParams := request.Parameters
	inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	outputTokens, err := NumTokensFromAzureOpenAiResponseString(*response.Choices[0].Delta.Content, requestParams.AzureChatModel)
	if err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	// Note: If we had an error calculating input/output tokens, that is unfortunate, the
	// best thing we can do is record zero token usage which would be our hint to look at
	// the logs for errors.
	if err := recordTokenUsage(request, inputTokens, outputTokens); err != nil {
		logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
	}
	return &types.CompletionResponse{
		Completion: *response.Choices[0].Delta.Content,
		StopReason: string(*response.Choices[0].FinishReason),
	}, nil
}

func (c *azureCompletionClient) Stream(
	ctx context.Context,
	log log.Logger,
	request types.CompletionRequest,
	sendEvent types.SendCompletionEvent,
) error {
	switch request.Feature {
	case types.CompletionsFeatureCode:
		return streamAutocomplete(ctx, c.client, request, sendEvent, log)
	case types.CompletionsFeatureChat:
		return streamChat(ctx, c.client, request, sendEvent, log)
	default:
		return errors.New("invalid completions feature")
	}
}

func NumTokensFromAzureOpenAiMessages(messages []types.Message, model string) (numTokens int, error error) {
	tiktoken.SetBpeLoader(tiktoken_loader.NewOfflineLoader())
	tkm, err := tiktoken.EncodingForModel(model)
	if err != nil {
		return 0, errors.Newf("tiktoken EncodingForModel error: %v", err)
	}

	var tokensPerMessage int
	switch model {
	case "gpt-3.5-turbo-0613",
		"gpt-3.5-turbo-16k-0613",
		"gpt-4-0314",
		"gpt-4-32k-0314",
		"gpt-4-0613",
		"gpt-4-32k-0613",
		"gpt-4o":
		tokensPerMessage = 3
	case "gpt-3.5-turbo-0301":
		tokensPerMessage = 4 // every message follows <|im_start|>{role/name}\n{content}<|end|>\n
	default:
		if strings.Contains(model, "gpt-3.5-turbo") {
			return NumTokensFromAzureOpenAiMessages(messages, "gpt-3.5-turbo-0613")
		} else if strings.Contains(model, "gpt-4") {
			return NumTokensFromAzureOpenAiMessages(messages, "gpt-4-0613")
		} else {
			err = errors.Newf("num_tokens_from_messages() is not implemented for model %s. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens.", model)
			return 0, err
		}
	}

	for _, message := range messages {
		numTokens += tokensPerMessage
		numTokens += len(tkm.Encode(message.Text, nil, nil))
		numTokens += len(tkm.Encode(message.Speaker, nil, nil))
	}
	numTokens += 3 // every reply is primed with <|im_start|>assistant<|im_sep|>
	return numTokens, nil
}

func NumTokensFromAzureOpenAiResponseString(response string, model string) (numTokens int, error error) {
	tiktoken.SetBpeLoader(tiktoken_loader.NewOfflineLoader())
	tkm, err := tiktoken.EncodingForModel(model)
	if err != nil {
		return 0, errors.Newf("tiktoken EncodingForModel error: %v", err)
	}
	return len(tkm.Encode(response, nil, nil)), nil
}

func streamAutocomplete(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	sendEvent types.SendCompletionEvent,
	logger log.Logger,
) error {
	useDeprecatedAPI := request.Parameters.AzureUseDeprecatedCompletionsAPIForOldModels
	if useDeprecatedAPI {
		return doStreamCompletionsAPI(ctx, client, request, sendEvent, logger)
	}
	return doStreamChatCompletionsAPI(ctx, client, request, sendEvent, logger)
}

// Streaming with ChatCompletions API
func doStreamChatCompletionsAPI(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	sendEvent types.SendCompletionEvent,
	logger log.Logger,
) error {
	resp, err := client.GetChatCompletionsStream(ctx, getChatOptions(request), nil)
	if err != nil {
		return err
	}
	defer resp.ChatCompletionsStream.Close()

	var content string
	for {
		entry, err := resp.ChatCompletionsStream.Read()
		if errors.Is(err, io.EOF) {
			requestParams := request.Parameters
			inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureChatModel)
			if err != nil {
				logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
			}
			outputTokens, err := NumTokensFromAzureOpenAiResponseString(content, requestParams.AzureChatModel)
			if err != nil {
				logger.Warn("Failed to count output tokens with the token manager %w ", log.Error(err))
			}
			// Note: If we had an error calculating input/output tokens, that is unfortunate, the
			// best thing we can do is record zero token usage which would be our hint to look at
			// the logs for errors.
			if err = recordTokenUsage(request, inputTokens, outputTokens); err != nil {
				logger.Warn("Failed to count tokens with the token manager %w ", log.Error(err))
			}
			return nil
		}
		if err != nil {
			return err
		}

		if hasValidFirstChatChoice(entry.Choices) {
			content += *entry.Choices[0].Delta.Content
			finish := ""
			if entry.Choices[0].FinishReason != nil {
				finish = string(*entry.Choices[0].FinishReason)
			}
			ev := types.CompletionResponse{
				Completion: content,
				StopReason: finish,
			}
			err := sendEvent(ev)
			if err != nil {
				return err
			}
		}
	}
}

// Streaming with Completions API
func doStreamCompletionsAPI(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	sendEvent types.SendCompletionEvent,
	logger log.Logger,
) error {
	options, err := getCompletionsOptions(request)
	if err != nil {
		return err
	}
	resp, err := client.GetCompletionsStream(ctx, options, nil)
	if err != nil {
		return toStatusCodeError(err)
	}
	defer resp.CompletionsStream.Close()

	// Azure sends incremental deltas for each message in a chat stream
	// build up the full message content over multiple responses
	var content string
	for {
		entry, err := resp.CompletionsStream.Read()
		// stream is done
		if errors.Is(err, io.EOF) {
			requestParams := request.Parameters
			inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureCompletionModel)
			if err != nil {
				logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
			}
			outputTokens, err := NumTokensFromAzureOpenAiResponseString(content, requestParams.AzureCompletionModel)
			if err != nil {
				logger.Warn("Failed to count output tokens with the token manager %w ", log.Error(err))
			}
			// Note: If we had an error calculating input/output tokens, that is unfortunate, the
			// best thing we can do is record zero token usage which would be our hint to look at
			// the logs for errors.
			if err = recordTokenUsage(request, inputTokens, outputTokens); err != nil {
				logger.Warn("Failed to count tokens with the token manager %w ", log.Error(err))
			}
			return nil
		}
		// some other error has occured
		if err != nil {
			return err
		}
		// hasValidFirstCompletionsChoice checks for a valid 1st choice which has text
		if hasValidFirstCompletionsChoice(entry.Choices) {
			content += *entry.Choices[0].Text
			finish := ""
			if entry.Choices[0].FinishReason != nil {
				finish = string(*entry.Choices[0].FinishReason)
			}
			ev := types.CompletionResponse{
				Completion: content,
				StopReason: finish,
			}
			err := sendEvent(ev)
			if err != nil {
				return err
			}
		}
	}
}

func streamChat(
	ctx context.Context,
	client CompletionsClient,
	request types.CompletionRequest,
	sendEvent types.SendCompletionEvent,
	logger log.Logger,
) error {

	resp, err := client.GetChatCompletionsStream(ctx, getChatOptions(request), nil)
	if err != nil {
		return toStatusCodeError(err)
	}
	defer resp.ChatCompletionsStream.Close()

	// Azure sends incremental deltas for each message in a chat stream
	// build up the full message content over multiple responses
	var content string

	for {
		entry, err := resp.ChatCompletionsStream.Read()
		// stream is done
		if errors.Is(err, io.EOF) {
			requestParams := request.Parameters
			inputTokens, err := NumTokensFromAzureOpenAiMessages(requestParams.Messages, requestParams.AzureChatModel)
			if err != nil {
				logger.Warn("Failed to count input tokens with the token manager %w ", log.Error(err))
			}
			outputTokens, err := NumTokensFromAzureOpenAiResponseString(content, requestParams.AzureChatModel)
			if err != nil {
				logger.Warn("Failed to count output tokens with the token manager %w ", log.Error(err))
			}
			// Note: If we had an error calculating input/output tokens, that is unfortunate, the
			// best thing we can do is record zero token usage which would be our hint to look at
			// the logs for errors.
			if err = recordTokenUsage(request, inputTokens, outputTokens); err != nil {
				logger.Warn("Failed to count tokens with the token manager %w ", log.Error(err))
			}
			return nil
		}
		// some other error has occurred
		if err != nil {
			return err
		}

		if hasValidFirstChatChoice(entry.Choices) {
			// hasValidFirstChatChoice checks that Delta.Content isn't null
			// it is marked as REQUIRED in docs despite being a pointer
			content += *entry.Choices[0].Delta.Content

			finish := ""
			// FinishReason is marked as REQUIRED but it's nil until the end
			if entry.Choices[0].FinishReason != nil {
				finish = string(*entry.Choices[0].FinishReason)
			}
			ev := types.CompletionResponse{
				Completion: content,
				StopReason: finish,
			}
			err := sendEvent(ev)
			if err != nil {
				return err
			}
		}
	}
}

// hasValidChatChoice checks to ensure there is a choice and the first one contains non-nil values
func hasValidFirstChatChoice(choices []azopenai.ChatChoice) bool {
	return len(choices) > 0 &&
		choices[0].Delta != nil &&
		choices[0].Delta.Content != nil
}

// hasValidChatChoice checks to ensure there is a choice and the first one contains non-nil values
func hasValidFirstCompletionsChoice(choices []azopenai.Choice) bool {
	return len(choices) > 0 &&
		choices[0].Text != nil
}

func getChatMessages(messages []types.Message) []azopenai.ChatRequestMessageClassification {
	azureMessages := make([]azopenai.ChatRequestMessageClassification, len(messages))
	for i, m := range messages {
		message := m.Text
		switch m.Speaker {
		case types.HUMAN_MESSAGE_SPEAKER:
			azureMessages[i] = &azopenai.ChatRequestUserMessage{Content: azopenai.NewChatRequestUserMessageContent(message)}
		case types.ASSISTANT_MESSAGE_SPEAKER:
			azureMessages[i] = &azopenai.ChatRequestAssistantMessage{Content: &message}
		}

	}
	return azureMessages
}

func getChatOptions(request types.CompletionRequest) azopenai.ChatCompletionsOptions {
	requestParams := request.Parameters
	if requestParams.TopK < 0 {
		requestParams.TopK = 0
	}
	if requestParams.TopP < 0 {
		requestParams.TopP = 0
	}
	return azopenai.ChatCompletionsOptions{
		Messages:       getChatMessages(requestParams.Messages),
		Temperature:    &requestParams.Temperature,
		TopP:           &requestParams.TopP,
		N:              intToInt32Ptr(1),
		Stop:           requestParams.StopSequences,
		MaxTokens:      intToInt32Ptr(requestParams.MaxTokensToSample),
		DeploymentName: &requestParams.Model,
		User:           &requestParams.User,
	}
}

func getCompletionsOptions(request types.CompletionRequest) (azopenai.CompletionsOptions, error) {
	requestParams := request.Parameters
	if requestParams.TopK < 0 {
		requestParams.TopK = 0
	}
	if requestParams.TopP < 0 {
		requestParams.TopP = 0
	}
	prompt, err := getPrompt(requestParams.Messages)
	if err != nil {
		return azopenai.CompletionsOptions{}, err
	}
	return azopenai.CompletionsOptions{
		Prompt:         []string{prompt},
		Temperature:    &requestParams.Temperature,
		TopP:           &requestParams.TopP,
		N:              intToInt32Ptr(1),
		Stop:           requestParams.StopSequences,
		MaxTokens:      intToInt32Ptr(requestParams.MaxTokensToSample),
		DeploymentName: &requestParams.Model,
		User:           &requestParams.User,
	}, nil
}

func getPrompt(messages []types.Message) (string, error) {
	if len(messages) != 1 {
		return "", errors.New("Expected to receive exactly one message with the prompt")
	}

	return messages[0].Text, nil
}

func intToInt32Ptr(i int) *int32 {
	v := int32(i)
	return &v
}

// toStatusCodeError converts Azure SDK ResponseError to a ErrStatusNotOK error
// when the status code is not OK.  This allows the request handler to return the
// appropriate status code to the calling client which is especially important for rate limits.
func toStatusCodeError(err error) error {
	var responseError *azcore.ResponseError
	if errors.As(err, &responseError) {
		if responseError.StatusCode != http.StatusOK {
			return types.NewErrStatusNotOK("AzureOpenAI", responseError.RawResponse)
		}
	}
	return err
}

func recordTokenUsage(request types.CompletionRequest, inputTokens, outputTokens int) error {
	tokenManager := tokenusage.NewManager()
	label := tokenizer.AzureModel + "/" + request.Parameters.Model
	feature := string(request.Feature)
	return tokenManager.UpdateTokenCountsFromModelUsage(
		inputTokens, outputTokens,
		label, feature,
		tokenusage.AzureOpenAI)
}

type apiVersionRoundTripper struct {
	rt         http.RoundTripper
	apiVersion string
}

func (rt *apiVersionRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	newReq := req.Clone(req.Context())
	values := newReq.URL.Query()
	values.Set("api-version", rt.apiVersion)
	newReq.URL.RawQuery = values.Encode()
	return rt.rt.RoundTrip(newReq)
}

func apiVersionClient(apiVersion string) *http.Client {
	dialer := &net.Dialer{
		Timeout:   30 * time.Second,
		KeepAlive: 30 * time.Second,
	}
	azureClientDefaultTransport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		DialContext:           dialer.DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   10,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		TLSClientConfig: &tls.Config{
			MinVersion:    tls.VersionTLS12,
			Renegotiation: tls.RenegotiateFreelyAsClient,
		},
	}

	if http2Transport, err := http2.ConfigureTransports(azureClientDefaultTransport); err == nil {
		http2Transport.ReadIdleTimeout = 10 * time.Second
		http2Transport.PingTimeout = 5 * time.Second
	}

	return &http.Client{
		Transport: &apiVersionRoundTripper{
			rt:         azureClientDefaultTransport,
			apiVersion: apiVersion,
		},
	}
}
