package com.aicustomersupport.aicustomersupportbackend.ai;

public class AiResolutionResponse {

    private boolean resolved;
    private double confidence;
    private String reason;

    public AiResolutionResponse() {
    }

    public AiResolutionResponse(
            boolean resolved,
            double confidence,
            String reason
    ) {
        this.resolved = resolved;
        this.confidence = confidence;
        this.reason = reason;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}