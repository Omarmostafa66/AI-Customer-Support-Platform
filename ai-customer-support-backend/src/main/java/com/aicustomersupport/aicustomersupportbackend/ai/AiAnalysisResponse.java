package com.aicustomersupport.aicustomersupportbackend.ai;

public class AiAnalysisResponse {

    private String category;
    private String suggestedPriority;
    private String suggestedResponse;

    public AiAnalysisResponse(
            String category,
            String suggestedPriority,
            String suggestedResponse) {

        this.category = category;
        this.suggestedPriority = suggestedPriority;
        this.suggestedResponse = suggestedResponse;
    }

    public String getCategory() {
        return category;
    }

    public String getSuggestedPriority() {
        return suggestedPriority;
    }

    public String getSuggestedResponse() {
        return suggestedResponse;
    }
}