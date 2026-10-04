package com.aicustomersupport.aicustomersupportbackend.dto;

import java.util.Map;

public class AiMetricsResponse {

    private long totalInteractions;
    private long totalConversations;
    private long interactionsAnswered;
    private long interactionsEscalated;
    private long interactionsResolved;
    private double averageConfidence;
    private double handlingRate;

    private long apiFailures;
    private long fallbackResponses;

    private Map<String, Long> escalationsByRisk;

    public AiMetricsResponse() {
    }

    public long getTotalInteractions() { return totalInteractions; }
    public void setTotalInteractions(long totalInteractions) { this.totalInteractions = totalInteractions; }

    public long getTotalConversations() { return totalConversations; }
    public void setTotalConversations(long totalConversations) { this.totalConversations = totalConversations; }

    public long getInteractionsAnswered() { return interactionsAnswered; }
    public void setInteractionsAnswered(long interactionsAnswered) { this.interactionsAnswered = interactionsAnswered; }

    public long getInteractionsEscalated() { return interactionsEscalated; }
    public void setInteractionsEscalated(long interactionsEscalated) { this.interactionsEscalated = interactionsEscalated; }

    public long getInteractionsResolved() { return interactionsResolved; }
    public void setInteractionsResolved(long interactionsResolved) { this.interactionsResolved = interactionsResolved; }

    public double getAverageConfidence() { return averageConfidence; }
    public void setAverageConfidence(double averageConfidence) { this.averageConfidence = averageConfidence; }

    public double getHandlingRate() { return handlingRate; }
    public void setHandlingRate(double handlingRate) { this.handlingRate = handlingRate; }

    public long getApiFailures() { return apiFailures; }
    public void setApiFailures(long apiFailures) { this.apiFailures = apiFailures; }

    public long getFallbackResponses() { return fallbackResponses; }
    public void setFallbackResponses(long fallbackResponses) { this.fallbackResponses = fallbackResponses; }

    public Map<String, Long> getEscalationsByRisk() { return escalationsByRisk; }
    public void setEscalationsByRisk(Map<String, Long> escalationsByRisk) { this.escalationsByRisk = escalationsByRisk; }
}
