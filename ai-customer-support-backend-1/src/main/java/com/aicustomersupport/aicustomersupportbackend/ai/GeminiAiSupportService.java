package com.aicustomersupport.aicustomersupportbackend.ai;

import com.aicustomersupport.aicustomersupportbackend.entity.Category;
import com.aicustomersupport.aicustomersupportbackend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.aicustomersupport.aicustomersupportbackend.service.KnowledgeRetrievalService;
import com.aicustomersupport.aicustomersupportbackend.service.KnowledgeRetrievalService.KnowledgeArticleReference;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Primary
public class GeminiAiSupportService implements AiSupportService {

    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final KnowledgeRetrievalService knowledgeRetrievalService;
    private final RestClient restClient;

    private final String apiKey;
    private final String model;
    private final String baseUrl;

    /*
     * Fallback Gemini models.
     *
     * Primary model:
     * gemini-3.8-flash
     *
     * Fallbacks:
     * gemini-3.7-flash
     * gemini-3.5-flash
     */
    private final List<String> fallbackModels;

    // =========================================================
    // Retry Configuration
    // =========================================================

    /*
     * Number of retries after the first request.
     *
     * MAX_RETRIES_PER_MODEL = 1
     *
     * Therefore each model can be called up to 2 times:
     *
     * Attempt 1
     * Attempt 2
     */
    private static final int MAX_RETRIES_PER_MODEL = 1;

    private static final long INITIAL_RETRY_DELAY_MS = 750L;

    // =========================================================
    // Constructor
    // =========================================================

    public GeminiAiSupportService(
            CategoryRepository categoryRepository,
            ObjectMapper objectMapper,
            KnowledgeRetrievalService knowledgeRetrievalService,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${gemini.model:gemini-3.8-flash}") String model,
            @Value("${gemini.fallback-models:gemini-3.7-flash,gemini-3.5-flash}") String fallbackModels
    ) {

        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
        this.knowledgeRetrievalService = knowledgeRetrievalService;

        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;

        this.fallbackModels =
                buildModelList(
                        model,
                        fallbackModels
                );

        System.out.println("========================================");
        System.out.println("GEMINI CONFIGURATION");
        System.out.println("Gemini Base URL: " + baseUrl);
        System.out.println("Gemini Primary Model: " + model);
        System.out.println(
                "Gemini Available Models: "
                        + String.join(
                        ", ",
                        this.fallbackModels
                )
        );
        System.out.println(
                "Gemini API Key Configured: "
                        + (
                        apiKey != null
                                && !apiKey.isBlank()
                )
        );
        System.out.println("========================================");

        this.restClient =
                RestClient.builder()
                        .baseUrl(baseUrl)
                        .defaultHeader(
                                "Content-Type",
                                "application/json"
                        )
                        .build();
    }

    // =========================================================
    // Build Model List
    // =========================================================

    private List<String> buildModelList(
            String primaryModel,
            String fallbackModelConfig
    ) {

        List<String> models =
                new ArrayList<>();

        if (primaryModel != null
                && !primaryModel.isBlank()) {

            models.add(
                    primaryModel.trim()
            );
        }

        if (fallbackModelConfig != null
                && !fallbackModelConfig.isBlank()) {

            String[] configuredModels =
                    fallbackModelConfig.split(",");

            for (String configuredModel :
                    configuredModels) {

                if (configuredModel == null) {
                    continue;
                }

                String cleanedModel =
                        configuredModel.trim();

                if (cleanedModel.isBlank()) {
                    continue;
                }

                if (!models.contains(
                        cleanedModel
                )) {

                    models.add(cleanedModel);
                }
            }
        }

        return models;
    }

    // =========================================================
    // Ticket Analysis
    // =========================================================

    @Override
    public AiAnalysisResponse analyzeTicket(
            String title,
            String description,
            List<AiChatMessage> conversation
    ) {

        validateApiKey();

        String categoryContext =
                buildCategoryContext();

        String prompt =
                buildTicketAnalysisPrompt(
                        title,
                        description,
                        categoryContext,
                        conversation
                );

        Map<String, Object> requestBody =
                buildAnalysisRequestBody(
                        prompt
                );

        System.out.println("========================================");
        System.out.println("GEMINI TICKET ANALYSIS REQUEST");
        System.out.println("Base URL: " + baseUrl);
        System.out.println("Primary Model: " + model);
        System.out.println(
                "Available Models: "
                        + String.join(
                        ", ",
                        fallbackModels
                )
        );
        System.out.println("========================================");

        try {

            JsonNode response =
                    executeGeminiRequest(
                            requestBody,
                            "ticket analysis"
                    );

            if (response == null) {

                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            String jsonText =
                    extractOutputText(
                            response
                    );

            if (jsonText == null
                    || jsonText.isBlank()) {

                throw new IllegalStateException(
                        "Gemini returned no usable output."
                );
            }

            return parseAnalysis(
                    jsonText
            );

        } catch (
                RestClientResponseException exception
        ) {

            throw new IllegalStateException(
                    "Gemini request failed with status "
                            + exception
                            .getStatusCode()
                            .value()
                            + ": "
                            + getResponseBody(
                            exception
                    ),
                    exception
            );

        } catch (Exception exception) {

            if (exception instanceof IllegalStateException) {

                throw (IllegalStateException)
                        exception;
            }

            throw new IllegalStateException(
                    "Unable to analyze ticket using Gemini.",
                    exception
            );
        }
    }

    // =========================================================
    // Customer AI Chat
    // =========================================================

    @Override
    public AiChatResponse chat(
            String message,
            List<AiChatMessage> conversation
    ) {

        validateApiKey();

        String categoryContext =
                buildCategoryContext();

        List<KnowledgeArticleReference> knowledge = knowledgeRetrievalService.retrieveKnowledge(message, categoryContext);

        String prompt =
                buildChatPrompt(
                        message,
                        conversation,
                        categoryContext,
                        knowledge
                );

        Map<String, Object> requestBody =
                buildChatRequestBody(
                        prompt
                );

        System.out.println("========================================");
        System.out.println("GEMINI CHAT REQUEST");
        System.out.println("Base URL: " + baseUrl);
        System.out.println("Primary Model: " + model);
        System.out.println(
                "Available Models: "
                        + String.join(
                        ", ",
                        fallbackModels
                )
        );
        System.out.println("========================================");

        try {

            JsonNode response =
                    executeGeminiRequest(
                            requestBody,
                            "customer chat"
                    );

            if (response == null) {

                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            String jsonText =
                    extractOutputText(
                            response
                    );

            if (jsonText == null
                    || jsonText.isBlank()) {

                throw new IllegalStateException(
                        "Gemini returned no usable chat response."
                );
            }

            AiChatResponse result =
                    parseChatResponse(
                            jsonText
                    );

            /*
             * Gemini successfully processed the request.
             */
            result.setAiAvailable(true);

            return result;

        } catch (
                RestClientResponseException exception
        ) {

            /*
             * If all Gemini models failed because of a temporary
             * provider availability problem, return a controlled
             * response instead of throwing HTTP 500.
             */
            int status =
                    exception
                            .getStatusCode()
                            .value();

            if (isTemporaryAvailabilityStatus(
                    status
            )) {

                System.err.println(
                        "========================================"
                );

                System.err.println(
                        "GEMINI TEMPORARILY UNAVAILABLE"
                );

                System.err.println(
                        "Status: " + status
                );

                System.err.println(
                        "Returning controlled AI fallback response."
                );

                System.err.println(
                        "No automatic ticket escalation will be created."
                );

                System.err.println(
                        "========================================"
                );

                return buildTemporaryUnavailableResponse();
            }

            /*
             * Authentication/configuration or invalid request errors
             * should NOT be hidden as temporary availability issues.
             */
            throw new IllegalStateException(
                    "Gemini chat request failed with status "
                            + status
                            + ": "
                            + getResponseBody(
                            exception
                    ),
                    exception
            );

        } catch (Exception exception) {

            if (exception instanceof IllegalStateException) {

                throw (IllegalStateException)
                        exception;
            }

            throw new IllegalStateException(
                    "Unable to generate AI support response.",
                    exception
            );
        }
    }

    // =========================================================
    // AI Resolution Assessment
    // =========================================================

    @Override
    public AiResolutionResponse assessResolution(
            String title,
            String description,
            List<AiChatMessage> conversation
    ) {

        validateApiKey();

        String conversationContext =
                buildConversationContext(conversation);

        String prompt =
                buildResolutionAssessmentPrompt(
                        title,
                        description,
                        conversationContext
                );

        Map<String, Object> requestBody =
                buildResolutionRequestBody(prompt);

        System.out.println("========================================");
        System.out.println("GEMINI RESOLUTION ASSESSMENT");
        System.out.println("========================================");

        try {

            JsonNode response =
                    executeGeminiRequest(
                            requestBody,
                            "resolution assessment"
                    );

            if (response == null) {

                throw new IllegalStateException(
                        "Gemini returned an empty resolution response."
                );
            }

            String jsonText =
                    extractOutputText(response);

            if (jsonText == null
                    || jsonText.isBlank()) {

                throw new IllegalStateException(
                        "Gemini returned no usable resolution response."
                );
            }

            return parseResolutionResponse(jsonText);

        } catch (RestClientResponseException exception) {

            throw new IllegalStateException(
                    "Gemini resolution assessment failed with status "
                            + exception
                            .getStatusCode()
                            .value()
                            + ": "
                            + getResponseBody(exception),
                    exception
            );

        } catch (Exception exception) {

            if (exception instanceof IllegalStateException) {

                throw (IllegalStateException) exception;
            }

            throw new IllegalStateException(
                    "Unable to assess ticket resolution using Gemini.",
                    exception
            );
        }
    }

    // =========================================================
    // Temporary AI Fallback Response
    // =========================================================

    private AiChatResponse buildTemporaryUnavailableResponse() {

        AiChatResponse response =
                new AiChatResponse(
                        "AI support is temporarily unavailable right now. "
                                + "Please try again in a moment.",
                        "General Support",
                        "MEDIUM",
                        "NEUTRAL",
                        0.0,
                        "LOW",
                        false,
                        false,
                        false,
                        false,
                        null
                );

        /*
         * Critical flag:
         *
         * This tells the escalation policy that the AI provider
         * itself is unavailable.
         */
        response.setAiAvailable(false);

        return response;
    }

    // =========================================================
    // Gemini Request With Retry + Model Fallback
    // =========================================================

    private JsonNode executeGeminiRequest(
            Map<String, Object> requestBody,
            String operation
    ) {

        RestClientResponseException lastException =
                null;

        for (
                int modelIndex = 0;
                modelIndex < fallbackModels.size();
                modelIndex++
        ) {

            String currentModel =
                    fallbackModels.get(
                            modelIndex
                    );

            String endpoint =
                    buildGenerateContentEndpoint(
                            currentModel
                    );

            System.out.println("----------------------------------------");
            System.out.println(
                    "Trying Gemini model: "
                            + currentModel
            );
            System.out.println(
                    "Endpoint: "
                            + endpoint
            );
            System.out.println("----------------------------------------");

            for (
                    int attempt = 1;
                    attempt <= MAX_RETRIES_PER_MODEL + 1;
                    attempt++
            ) {

                try {

                    System.out.println(
                            "Gemini "
                                    + operation
                                    + " | model="
                                    + currentModel
                                    + " | attempt="
                                    + attempt
                                    + "/"
                                    + (
                                    MAX_RETRIES_PER_MODEL
                                            + 1
                            )
                    );

                    JsonNode response =
                            restClient
                                    .post()
                                    .uri(endpoint)
                                    .header(
                                            "x-goog-api-key",
                                            apiKey
                                    )
                                    .body(requestBody)
                                    .retrieve()
                                    .body(
                                            JsonNode.class
                                    );

                    System.out.println(
                            "Gemini "
                                    + operation
                                    + " succeeded. "
                                    + "model="
                                    + currentModel
                                    + " attempt="
                                    + attempt
                    );

                    return response;

                } catch (
                        RestClientResponseException exception
                ) {

                    lastException =
                            exception;

                    int status =
                            exception
                                    .getStatusCode()
                                    .value();

                    boolean retryable =
                            isRetryableStatus(
                                    status
                            );

                    boolean canRetry =
                            attempt
                                    <= MAX_RETRIES_PER_MODEL;

                    System.err.println(
                            "Gemini "
                                    + operation
                                    + " failed."
                    );

                    System.err.println(
                            "Model: "
                                    + currentModel
                    );

                    System.err.println(
                            "Status: "
                                    + status
                    );

                    System.err.println(
                            "Retryable: "
                                    + retryable
                    );

                    System.err.println(
                            "Attempt: "
                                    + attempt
                                    + "/"
                                    + (
                                    MAX_RETRIES_PER_MODEL
                                            + 1
                            )
                    );

                    /*
                     * Non-retryable errors:
                     *
                     * 400 Bad Request
                     * 401 Unauthorized
                     * 403 Forbidden
                     */
                    if (!retryable) {

                        throw exception;
                    }

                    /*
                     * No more attempts for this model.
                     */
                    if (!canRetry) {

                        System.err.println(
                                "Gemini model "
                                        + currentModel
                                        + " is unavailable "
                                        + "after "
                                        + (
                                        MAX_RETRIES_PER_MODEL
                                                + 1
                                )
                                        + " attempts."
                        );

                        break;
                    }

                    long delay =
                            calculateRetryDelay(
                                    attempt
                            );

                    System.err.println(
                            "Retrying Gemini "
                                    + operation
                                    + " with model "
                                    + currentModel
                                    + " in "
                                    + delay
                                    + " ms..."
                    );

                    sleepBeforeRetry(
                            delay
                    );
                }
            }

            /*
             * Move to the next fallback model.
             */
            if (
                    modelIndex
                            < fallbackModels.size() - 1
            ) {

                String nextModel =
                        fallbackModels.get(
                                modelIndex + 1
                        );

                System.err.println(
                        "Falling back to Gemini model: "
                                + nextModel
                );
            }
        }

        /*
         * All models failed.
         */
        if (lastException != null) {

            throw lastException;
        }

        throw new IllegalStateException(
                "All configured Gemini models failed."
        );
    }

    // =========================================================
    // Temporary Availability Status
    // =========================================================

    private boolean isTemporaryAvailabilityStatus(
            int status
    ) {

        return status == 408
                || status == 429
                || status == 500
                || status == 502
                || status == 503
                || status == 504;
    }

    // =========================================================
    // Retryable HTTP Status Codes
    // =========================================================

    private boolean isRetryableStatus(
            int status
    ) {

        return status == 408
                || status == 429
                || status == 500
                || status == 502
                || status == 503
                || status == 504;
    }

    // =========================================================
    // Exponential Backoff
    // =========================================================

    private long calculateRetryDelay(
            int attempt
    ) {

        return INITIAL_RETRY_DELAY_MS
                * (1L << (attempt - 1));
    }

    // =========================================================
    // Sleep Before Retry
    // =========================================================

    private void sleepBeforeRetry(
            long delay
    ) {

        try {

            Thread.sleep(delay);

        } catch (
                InterruptedException exception
        ) {

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Gemini retry was interrupted.",
                    exception
            );
        }
    }

    // =========================================================
    // Gemini Endpoint
    // =========================================================

    private String buildGenerateContentEndpoint(
            String modelName
    ) {

        String normalizedBaseUrl =
                baseUrl.endsWith("/")
                        ? baseUrl.substring(
                        0,
                        baseUrl.length() - 1
                )
                        : baseUrl;

        return normalizedBaseUrl
                + "/models/"
                + modelName
                + ":generateContent";
    }

    // =========================================================
    // Validation
    // =========================================================

    private void validateApiKey() {

        if (apiKey == null
                || apiKey.isBlank()) {

            throw new IllegalStateException(
                    "GEMINI_API_KEY is not configured."
            );
        }
    }

    // =========================================================
    // Categories
    // =========================================================

    
    @Override
    public String summarizeConversation(List<AiChatMessage> conversation) {
        validateApiKey();

        StringBuilder conversationBuilder = new StringBuilder();
        if (conversation != null) {
            for (AiChatMessage msg : conversation) {
                conversationBuilder.append(msg.getSender().toUpperCase()).append(": ").append(msg.getText()).append("\n");
            }
        }

        String prompt = """
                You are an AI customer support summarizer.
                Create a professional and concise summary of the following conversation between a customer and an AI assistant.
                This summary will be used as the description for a support ticket that a human agent will resolve.
                Focus on the core issue and key details.
                
                CONVERSATION HISTORY:
                %s
                """.formatted(conversationBuilder.toString());

        Map<String, Object> requestBody = buildAnalysisRequestBody(prompt);

        try {
            JsonNode response = executeGeminiRequest(requestBody, "conversation summary");
            if (response != null && response.has("candidates")) {
                JsonNode candidates = response.get("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode contentNode = candidates.get(0).get("content");
                    if (contentNode != null && contentNode.has("parts")) {
                        JsonNode parts = contentNode.get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            return parts.get(0).get("text").asText();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error summarizing conversation: " + e.getMessage());
        }
        return "No summary generated.";
    }

    private String buildCategoryContext() {

        List<String> categories =
                categoryRepository
                        .findAll()
                        .stream()
                        .map(Category::getName)
                        .filter(
                                name ->
                                        name != null
                                                && !name.isBlank()
                        )
                        .distinct()
                        .toList();

        if (categories.isEmpty()) {

            return "No predefined categories are currently available.";
        }

        return categories.stream()
                .collect(
                        Collectors.joining(
                                ", "
                        )
                );
    }

    // =========================================================
    // Ticket Analysis Prompt
    // =========================================================

    private String buildTicketAnalysisPrompt(
            String title,
            String description,
            String categoryContext,
            List<AiChatMessage> conversation
    ) {

        StringBuilder conversationBuilder = new StringBuilder();
        if (conversation != null && !conversation.isEmpty()) {
            conversationBuilder.append("\n                CONVERSATION HISTORY:\n");
            for (AiChatMessage msg : conversation) {
                conversationBuilder.append("                ").append(msg.getSender().toUpperCase()).append(": ").append(msg.getText()).append("\n");
            }
        }

        return """
                You are an AI customer support analysis engine.

                Analyze the following customer support ticket and return
                a structured analysis for a human support agent.

                TICKET TITLE:
                %s

                TICKET DESCRIPTION:
                %s%s

                AVAILABLE SUPPORT CATEGORIES:
                %s

                CLASSIFICATION RULES:

                1. summary:
                   Provide a concise professional summary of the customer's
                   actual problem.

                   The summary should:
                   - describe what happened
                   - mention the main issue
                   - mention important context when available
                   - avoid assumptions
                   - be written for a human support employee

                2. category:
                   Choose the closest category from the available
                   support categories.

                   If none is suitable, use:
                   "General Support"

                3. suggestedPriority:
                   Must be exactly one of:
                   LOW, MEDIUM, HIGH, URGENT.

                   URGENT:
                   - security compromise
                   - account takeover
                   - critical service outage
                   - serious financial or security risk

                   HIGH:
                   - important functionality unavailable
                   - payment failure
                   - account access problems
                   - repeated critical errors

                   MEDIUM:
                   - normal support requests
                   - common account questions
                   - common billing questions

                   LOW:
                   - informational requests
                   - minor issues
                   - general questions

                4. sentiment:
                   Must be exactly one of:
                   POSITIVE, NEUTRAL, NEGATIVE, ANGRY, FRUSTRATED.

                5. confidence:
                   A number between 0 and 1 representing your confidence
                   in the overall classification.

                6. risk:
                   Must be exactly one of:
                   LOW, MEDIUM, HIGH, CRITICAL.

                7. recommendedAction:
                   Give the human support employee the most appropriate
                   next action.

                   The recommendation should:
                   - be practical
                   - be directly related to the ticket
                   - help the employee investigate or resolve the issue
                   - avoid inventing internal company procedures
                   - avoid promising an action that is not supported
                     by the ticket information

                8. suggestedResponse:
                   Write a professional, concise customer-support response
                   that the employee can use or adapt.

                   Do NOT invent:
                   - company policies
                   - refunds
                   - prices
                   - dates
                   - guarantees
                   - actions that are not supported by the ticket

                9. canAnswer:
                   true only if the ticket contains enough information
                   for a useful support response.

                10. canResolve:
                    true only if the issue can reasonably be resolved
                    through a direct support response without human
                    intervention.

                11. escalate:
                    true when the issue requires human review,
                    involves significant risk, has missing critical
                    information, or cannot safely be resolved automatically.

                Keep all fields concise, factual, professional,
                and useful for a human support agent.

                Ticket title:
                %s

                Ticket description:
                %s
                """.formatted(
                safe(title),
                safe(description),
                conversationBuilder.toString(),
                categoryContext,
                safe(title),
                safe(description)
        );
    }

    // =========================================================
    // Customer Chat Prompt
    // =========================================================

    private String buildChatPrompt(
            String message,
            List<AiChatMessage> conversation,
            String categoryContext,
            List<KnowledgeArticleReference> knowledge
    ) {

        String conversationContext =
                buildConversationContext(
                        conversation
                );

        return """
                You are an AI customer support assistant.

                Your job is to help customers understand and solve
                their support problems in a professional, friendly,
                concise, and safe way.

                IMPORTANT RULES:

                1. Understand the customer's current problem.

                2. Use the previous conversation when available.

                3. Give practical troubleshooting steps when they
                   are appropriate.

                4. Do not invent company policies, refunds, prices,
                   dates, guarantees, account information, or actions
                   that you cannot verify.

                5. If the customer provides insufficient information,
                   ask a clear follow-up question.

                6. If the issue appears to involve:
                   - account compromise
                   - security problems
                   - financial risk
                   - payment problems
                   - serious account access issues
                   - critical service failure
                   - repeated unresolved technical problems

                   consider escalation.

                7. canAnswer must be true only when you can provide
                   a useful response based on the available information.

                8. canResolve must be true only when the problem can
                   reasonably be solved through the conversation without
                   human intervention.

                9. escalate must be true when human support should
                   review the problem.

                10. suggestedPriority must be exactly:
                    LOW, MEDIUM, HIGH, or URGENT.

                11. risk must be exactly:
                    LOW, MEDIUM, HIGH, or CRITICAL.

                12. sentiment must be exactly:
                    POSITIVE, NEUTRAL, NEGATIVE, ANGRY, or FRUSTRATED.

                AVAILABLE SUPPORT CATEGORIES:
                %s

                PREVIOUS CONVERSATION:
                %s

                CURRENT CUSTOMER MESSAGE:
                %s

                Return a structured JSON response.
                """.formatted(
                categoryContext,
                conversationContext,
                safe(message)
        );
    }

    // =========================================================
    // Resolution Assessment Prompt
    // =========================================================

    private String buildResolutionAssessmentPrompt(
            String title,
            String description,
            String conversationContext
    ) {

        return """
                You are an AI customer support resolution assessment engine.

                Your task is to determine whether the customer's support issue
                appears to be resolved based on the original ticket and the
                complete support conversation.

                IMPORTANT RULES:

                1. Do not assume that an issue is resolved merely because
                   an employee sent a response.

                2. The issue should be considered resolved only when the
               conversation provides reasonable evidence that the original
               problem has been solved or satisfactorily addressed.

            3. If the customer still reports the same problem, the issue
               is NOT resolved.

            4. If the conversation does not contain enough evidence,
               return resolved = false.

            5. Do not invent actions, policies, refunds, technical fixes,
               or information that are not present in the ticket or
               conversation.

            6. confidence must be a number between 0 and 1.

            7. reason must briefly explain why the issue appears resolved
               or unresolved.

            ORIGINAL TICKET TITLE:
            %s

            ORIGINAL TICKET DESCRIPTION:
            %s

            SUPPORT CONVERSATION:
            %s

            Return a structured JSON response.
            """.formatted(
                safe(title),
                safe(description),
                conversationContext
        );
    }

    // =========================================================
    // Conversation Context
    // =========================================================

    private String buildConversationContext(
            List<AiChatMessage> conversation
    ) {

        if (conversation == null
                || conversation.isEmpty()) {

            return "No previous conversation.";
        }

        StringBuilder builder =
                new StringBuilder();

        for (
                AiChatMessage chatMessage :
                conversation
        ) {

            if (chatMessage == null) {
                continue;
            }

            String sender =
                    safe(
                            chatMessage.getSender()
                    );

            String text =
                    safe(
                            chatMessage.getText()
                    );

            if (text.isBlank()) {
                continue;
            }

            builder
                    .append(
                            sender.isBlank()
                                    ? "unknown"
                                    : sender
                    )
                    .append(": ")
                    .append(text)
                    .append("\n");
        }

        String result =
                builder.toString().trim();

        return result.isBlank()
                ? "No previous conversation."
                : result;
    }

    // =========================================================
    // Ticket Analysis Request Body
    // =========================================================

    private Map<String, Object> buildAnalysisRequestBody(
            String prompt
    ) {

        Map<String, Object> properties =
                buildTicketAnalysisProperties();

        Map<String, Object> responseSchema =
                new HashMap<>();

        responseSchema.put(
                "type",
                "OBJECT"
        );

        responseSchema.put(
                "properties",
                properties
        );

        responseSchema.put(
                "required",
                List.of(
                        "summary",
                        "category",
                        "suggestedPriority",
                        "suggestedResponse",
                        "recommendedAction",
                        "sentiment",
                        "confidence",
                        "risk",
                        "canAnswer",
                        "canResolve",
                        "escalate"
                )
        );

        Map<String, Object> generationConfig =
                Map.of(
                        "responseMimeType",
                        "application/json",
                        "responseSchema",
                        responseSchema
                );

        return buildGeminiRequestBody(
                prompt,
                generationConfig
        );
    }

    // =========================================================
    // Customer Chat Request Body
    // =========================================================

    private Map<String, Object> buildChatRequestBody(
            String prompt
    ) {

        Map<String, Object> properties =
                buildAnalysisProperties();

        properties.put(
                "message",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "The final customer-facing support response."
                )
        );

        Map<String, Object> responseSchema =
                new HashMap<>();

        responseSchema.put(
                "type",
                "OBJECT"
        );

        responseSchema.put(
                "properties",
                properties
        );

        responseSchema.put(
                "required",
                List.of(
                        "message",
                        "category",
                        "suggestedPriority",
                        "sentiment",
                        "confidence",
                        "risk",
                        "canAnswer",
                        "canResolve",
                        "escalate"
                )
        );

        Map<String, Object> generationConfig =
                Map.of(
                        "responseMimeType",
                        "application/json",
                        "responseSchema",
                        responseSchema
                );

        return buildGeminiRequestBody(
                prompt,
                generationConfig
        );
    }

    // =========================================================
    // Resolution Assessment Request Body
    // =========================================================

    private Map<String, Object> buildResolutionRequestBody(
            String prompt
    ) {

        Map<String, Object> properties =
                new HashMap<>();

        properties.put(
                "resolved",
                Map.of(
                        "type",
                        "BOOLEAN",
                        "description",
                        "Whether the customer's original issue appears to be resolved."
                )
        );

        properties.put(
                "confidence",
                Map.of(
                        "type",
                        "NUMBER",
                        "description",
                        "Confidence between 0 and 1."
                )
        );

        properties.put(
                "reason",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Brief factual explanation for the resolution assessment."
                )
        );

        Map<String, Object> responseSchema =
                new HashMap<>();

        responseSchema.put(
                "type",
                "OBJECT"
        );

        responseSchema.put(
                "properties",
                properties
        );

        responseSchema.put(
                "required",
                List.of(
                        "resolved",
                        "confidence",
                        "reason"
                )
        );

        Map<String, Object> generationConfig =
                Map.of(
                        "responseMimeType",
                        "application/json",
                        "responseSchema",
                        responseSchema
                );

        return buildGeminiRequestBody(
                prompt,
                generationConfig
        );
    }

    // =========================================================
    // Shared Chat Analysis Properties
    // =========================================================

    private Map<String, Object> buildAnalysisProperties() {

        Map<String, Object> properties =
                new HashMap<>();

        properties.put(
                "category",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "The most appropriate support category."
                )
        );

        properties.put(
                "suggestedPriority",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Priority: LOW, MEDIUM, HIGH, or URGENT."
                )
        );

        properties.put(
                "suggestedResponse",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Professional suggested customer response."
                )
        );

        properties.put(
                "sentiment",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Customer sentiment."
                )
        );

        properties.put(
                "confidence",
                Map.of(
                        "type",
                        "NUMBER",
                        "description",
                        "Classification confidence between 0 and 1."
                )
        );

        properties.put(
                "risk",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Risk level: LOW, MEDIUM, HIGH, or CRITICAL."
                )
        );

        properties.put(
                "canAnswer",
                Map.of(
                        "type",
                        "BOOLEAN",
                        "description",
                        "Whether AI can provide a useful answer."
                )
        );

        properties.put(
                "canResolve",
                Map.of(
                        "type",
                        "BOOLEAN",
                        "description",
                        "Whether AI can reasonably resolve the issue."
                )
        );

        properties.put(
                "escalate",
                Map.of(
                        "type",
                        "BOOLEAN",
                        "description",
                        "Whether the issue should be escalated."
                )
        );

        return properties;
    }

    // =========================================================
    // Ticket Analysis Properties
    // =========================================================

    private Map<String, Object> buildTicketAnalysisProperties() {

        Map<String, Object> properties =
                buildAnalysisProperties();

        /*
         * AI Summary for the employee.
         */
        properties.put(
                "summary",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Concise factual summary of the customer's problem for a human support agent."
                )
        );

        /*
         * Recommended next action for the employee.
         */
        properties.put(
                "recommendedAction",
                Map.of(
                        "type",
                        "STRING",
                        "description",
                        "Practical next action the human support agent should consider."
                )
        );

        return properties;
    }

    // =========================================================
    // Generic Gemini Request Body
    // =========================================================

    private Map<String, Object> buildGeminiRequestBody(
            String prompt,
            Map<String, Object> generationConfig
    ) {

        Map<String, Object> content =
                Map.of(
                        "parts",
                        List.of(
                                Map.of(
                                        "text",
                                        prompt
                                )
                        )
                );

        return Map.of(
                "contents",
                List.of(content),
                "generationConfig",
                generationConfig
        );
    }

    // =========================================================
    // Gemini Response Extraction
    // =========================================================

    private String extractOutputText(
            JsonNode response
    ) {

        JsonNode candidates =
                response.path(
                        "candidates"
                );

        if (!candidates.isArray()
                || candidates.isEmpty()) {

            return null;
        }

        JsonNode firstCandidate =
                candidates.get(0);

        JsonNode content =
                firstCandidate.path(
                        "content"
                );

        JsonNode parts =
                content.path(
                        "parts"
                );

        if (!parts.isArray()) {
            return null;
        }

        for (JsonNode part : parts) {

            JsonNode text =
                    part.path("text");

            if (!text.isMissingNode()) {

                String value =
                        text.asText();

                if (value != null
                        && !value.isBlank()) {

                    return value;
                }
            }
        }

        return null;
    }

    // =========================================================
    // Parse Ticket Analysis
    // =========================================================

    private AiAnalysisResponse parseAnalysis(
            String jsonText
    ) {

        try {

            JsonNode json =
                    objectMapper.readTree(
                            jsonText
                    );

            String summary =
                    json.path("summary")
                            .asText(
                                    "No AI summary was generated."
                            );

            String category =
                    json.path("category")
                            .asText(
                                    "General Support"
                            );

            String suggestedPriority =
                    json.path(
                                    "suggestedPriority"
                            )
                            .asText(
                                    "MEDIUM"
                            );

            String suggestedResponse =
                    json.path(
                                    "suggestedResponse"
                            )
                            .asText(
                                    "Thank you for contacting support. "
                                            + "Our team will review your request."
                            );

            String recommendedAction =
                    json.path(
                                    "recommendedAction"
                            )
                            .asText(
                                    "Review the customer's issue and investigate the available support information."
                            );

            String sentiment =
                    json.path("sentiment")
                            .asText(
                                    "NEUTRAL"
                            );

            double confidence =
                    json.path("confidence")
                            .asDouble(0.0);

            String risk =
                    json.path("risk")
                            .asText("LOW");

            boolean canAnswer =
                    json.path("canAnswer")
                            .asBoolean(true);

            boolean canResolve =
                    json.path("canResolve")
                            .asBoolean(false);

            boolean escalate =
                    json.path("escalate")
                            .asBoolean(false);

            confidence =
                    Math.max(
                            0.0,
                            Math.min(
                                    1.0,
                                    confidence
                            )
                    );

            /*
             * New Agent Assist response.
             *
             * Order MUST match the full constructor
             * in AiAnalysisResponse.
             */
            return new AiAnalysisResponse(
                    summary,
                    category,
                    suggestedPriority,
                    suggestedResponse,
                    sentiment,
                    confidence,
                    risk,
                    canAnswer,
                    canResolve,
                    escalate,
                    recommendedAction
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Gemini returned invalid structured analysis.",
                    exception
            );
        }
    }

    // =========================================================
    // Parse Customer Chat Response
    // =========================================================

    private AiChatResponse parseChatResponse(
            String jsonText
    ) {

        try {

            JsonNode json =
                    objectMapper.readTree(
                            jsonText
                    );

            String message =
                    json.path("message")
                            .asText(
                                    "Thank you for contacting support. "
                                            + "How can I help you?"
                            );

            String category =
                    json.path("category")
                            .asText(
                                    "General Support"
                            );

            String suggestedPriority =
                    json.path(
                                    "suggestedPriority"
                            )
                            .asText(
                                    "MEDIUM"
                            );

            String sentiment =
                    json.path("sentiment")
                            .asText(
                                    "NEUTRAL"
                            );

            double confidence =
                    json.path("confidence")
                            .asDouble(0.0);

            String risk =
                    json.path("risk")
                            .asText(
                                    "LOW"
                            );

            boolean canAnswer =
                    json.path("canAnswer")
                            .asBoolean(true);

            boolean canResolve =
                    json.path("canResolve")
                            .asBoolean(false);

            boolean escalate =
                    json.path("escalate")
                            .asBoolean(false);

            confidence =
                    Math.max(
                            0.0,
                            Math.min(
                                    1.0,
                                    confidence
                            )
                    );

            return new AiChatResponse(
                    message,
                    category,
                    suggestedPriority,
                    sentiment,
                    confidence,
                    risk,
                    canAnswer,
                    canResolve,
                    escalate,
                    false,
                    null
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Gemini returned invalid structured chat response.",
                    exception
            );
        }
    }

    // =========================================================
    // Parse Resolution Assessment
    // =========================================================

    private AiResolutionResponse parseResolutionResponse(
            String jsonText
    ) {

        try {

            JsonNode json =
                    objectMapper.readTree(jsonText);

            boolean resolved =
                    json.path("resolved")
                            .asBoolean(false);

            double confidence =
                    json.path("confidence")
                            .asDouble(0.0);

            String reason =
                    json.path("reason")
                            .asText(
                                    "The available conversation does not provide enough evidence to confirm resolution."
                            );

            confidence =
                    Math.max(
                            0.0,
                            Math.min(
                                    1.0,
                                    confidence
                            )
                    );

            return new AiResolutionResponse(
                    resolved,
                    confidence,
                    reason
            );

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Gemini returned invalid resolution assessment.",
                    exception
            );
        }
    }

    // =========================================================
    // Response Body
    // =========================================================

    private String getResponseBody(
            RestClientResponseException exception
    ) {

        String body =
                exception
                        .getResponseBodyAsString();

        if (body == null
                || body.isBlank()) {

            return "No response body.";
        }

        return body;
    }

    // =========================================================
    // Safe String
    // =========================================================

    private String safe(
            String value
    ) {

        return value == null
                ? ""
                : value.trim();
    }
}