package com.aicustomersupport.aicustomersupportbackend.ai;

import java.util.List;
import com.aicustomersupport.aicustomersupportbackend.service.KnowledgeRetrievalService.KnowledgeArticleReference;

public class AiChatResponse {

    private String message;

    private String category;

    private String suggestedPriority;

    private String sentiment;

    private double confidence;

    private String risk;

    private boolean canAnswer;

    private boolean canResolve;

    private boolean escalate;

    private boolean ticketCreated;

    private Long ticketId;

    /*
     * Persistent AI conversation ID.
     *
     * This is returned to the frontend so the same
     * server-side conversation can be continued.
     */
    private Long conversationId;

    /*
     * Indicates whether the AI provider was actually available.
     *
     * true  = Gemini successfully processed the request.
     * false = Gemini was temporarily unavailable.
     *
     * This prevents the escalation policy from creating
     * a ticket simply because Gemini is down.
     */
    private boolean aiAvailable = true;

    private List<KnowledgeArticleReference> sources;

    public AiChatResponse() {
    }

    public AiChatResponse(
            String message,
            String category,
            String suggestedPriority,
            String sentiment,
            double confidence,
            String risk,
            boolean canAnswer,
            boolean canResolve,
            boolean escalate,
            boolean ticketCreated,
            Long ticketId
    ) {
        this.message = message;
        this.category = category;
        this.suggestedPriority = suggestedPriority;
        this.sentiment = sentiment;
        this.confidence = confidence;
        this.risk = risk;
        this.canAnswer = canAnswer;
        this.canResolve = canResolve;
        this.escalate = escalate;
        this.ticketCreated = ticketCreated;
        this.ticketId = ticketId;
        this.aiAvailable = true;
    }

    // =========================================================
    // Message
    // =========================================================

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // =========================================================
    // Category
    // =========================================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // =========================================================
    // Suggested Priority
    // =========================================================

    public String getSuggestedPriority() {
        return suggestedPriority;
    }

    public void setSuggestedPriority(String suggestedPriority) {
        this.suggestedPriority = suggestedPriority;
    }

    // =========================================================
    // Sentiment
    // =========================================================

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    // =========================================================
    // Confidence
    // =========================================================

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    // =========================================================
    // Risk
    // =========================================================

    public String getRisk() {
        return risk;
    }

    public void setRisk(String risk) {
        this.risk = risk;
    }

    // =========================================================
    // Can Answer
    // =========================================================

    public boolean isCanAnswer() {
        return canAnswer;
    }

    public void setCanAnswer(boolean canAnswer) {
        this.canAnswer = canAnswer;
    }

    // =========================================================
    // Can Resolve
    // =========================================================

    public boolean isCanResolve() {
        return canResolve;
    }

    public void setCanResolve(boolean canResolve) {
        this.canResolve = canResolve;
    }

    // =========================================================
    // Escalation
    // =========================================================

    public boolean isEscalate() {
        return escalate;
    }

    public void setEscalate(boolean escalate) {
        this.escalate = escalate;
    }

    // =========================================================
    // Ticket Created
    // =========================================================

    public boolean isTicketCreated() {
        return ticketCreated;
    }

    public void setTicketCreated(boolean ticketCreated) {
        this.ticketCreated = ticketCreated;
    }

    // =========================================================
    // Ticket ID
    // =========================================================

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    // =========================================================
    // Conversation ID
    // =========================================================

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    // =========================================================
    // AI Availability
    // =========================================================

    public boolean isAiAvailable() {
        return aiAvailable;
    }

    public void setAiAvailable(boolean aiAvailable) {
        this.aiAvailable = aiAvailable;
    }

    public List<KnowledgeArticleReference> getSources() {
        return sources;
    }

    public void setSources(List<KnowledgeArticleReference> sources) {
        this.sources = sources;
    }
}