package com.aicustomersupport.aicustomersupportbackend.ai;

public class AiAnalysisResponse {

    // =========================================================
    // AI Ticket Summary
    // =========================================================

    private String summary;


    // =========================================================
    // Classification
    // =========================================================

    private String category;

    private String suggestedPriority;

    private String suggestedResponse;

    private String sentiment;

    private double confidence;

    private String risk;


    // =========================================================
    // AI Capabilities
    // =========================================================

    private boolean canAnswer;

    private boolean canResolve;

    private boolean escalate;


    // =========================================================
    // Agent Assist
    // =========================================================

    private String recommendedAction;


    // =========================================================
    // Default Constructor
    // =========================================================

    public AiAnalysisResponse() {
    }


    // =========================================================
    // Existing 3-Parameter Constructor
    // =========================================================

    public AiAnalysisResponse(
            String category,
            String suggestedPriority,
            String suggestedResponse
    ) {

        this(
                null,
                category,
                suggestedPriority,
                suggestedResponse,
                "NEUTRAL",
                0.0,
                "LOW",
                true,
                false,
                false,
                null
        );
    }


    // =========================================================
    // Existing 9-Parameter Constructor
    //
    // IMPORTANT:
    // Keep this constructor because existing
    // MockAiSupportService and GeminiAiSupportService
    // may still use it.
    // =========================================================

    public AiAnalysisResponse(
            String category,
            String suggestedPriority,
            String suggestedResponse,
            String sentiment,
            double confidence,
            String risk,
            boolean canAnswer,
            boolean canResolve,
            boolean escalate
    ) {

        this(
                null,
                category,
                suggestedPriority,
                suggestedResponse,
                sentiment,
                confidence,
                risk,
                canAnswer,
                canResolve,
                escalate,
                null
        );
    }


    // =========================================================
    // NEW Full Constructor
    //
    // Used for:
    // - Summary
    // - Classification
    // - Suggested Response
    // - Sentiment
    // - Confidence
    // - Risk
    // - AI Capabilities
    // - Recommended Action
    // =========================================================

    public AiAnalysisResponse(
            String summary,
            String category,
            String suggestedPriority,
            String suggestedResponse,
            String sentiment,
            double confidence,
            String risk,
            boolean canAnswer,
            boolean canResolve,
            boolean escalate,
            String recommendedAction
    ) {

        this.summary = summary;
        this.category = category;
        this.suggestedPriority = suggestedPriority;
        this.suggestedResponse = suggestedResponse;
        this.sentiment = sentiment;
        this.confidence = confidence;
        this.risk = risk;
        this.canAnswer = canAnswer;
        this.canResolve = canResolve;
        this.escalate = escalate;
        this.recommendedAction = recommendedAction;
    }


    // =========================================================
    // Summary
    // =========================================================

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
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
    // Suggested Response
    // =========================================================

    public String getSuggestedResponse() {
        return suggestedResponse;
    }

    public void setSuggestedResponse(String suggestedResponse) {
        this.suggestedResponse = suggestedResponse;
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
    // Escalate
    // =========================================================

    public boolean isEscalate() {
        return escalate;
    }

    public void setEscalate(boolean escalate) {
        this.escalate = escalate;
    }


    // =========================================================
    // Recommended Action
    // =========================================================

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
}