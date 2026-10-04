package com.aicustomersupport.aicustomersupportbackend.ai;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MockAiSupportService implements AiSupportService {

    // =========================================================
    // Ticket Analysis
    // =========================================================

    @Override
    public AiAnalysisResponse analyzeTicket(
            String title,
            String description,
            List<AiChatMessage> conversation
    ) {

        return new AiAnalysisResponse(
                "Mock summary",
                "General Support",
                "MEDIUM",
                "Thank you for contacting support. "
                        + "Our team will review your request "
                        + "and assist you shortly.",
                "NEUTRAL",
                0.75,
                "LOW",
                true,
                false,
                true,
                "Mock action"
        );
    }

    @Override
    public String summarizeConversation(List<AiChatMessage> conversation) {
        return "Mock conversation summary";
    }

    // =========================================================
    // Customer AI Chat
    // =========================================================

    @Override
    public AiChatResponse chat(
            String message,
            List<AiChatMessage> conversation
    ) {

        return new AiChatResponse(
                "Thank you for contacting support. "
                        + "I understand your request. "
                        + "Please provide a few more details so "
                        + "I can help you with the issue.",
                "General Support",
                "MEDIUM",
                "NEUTRAL",
                0.75,
                "LOW",
                true,
                false,
                false,
                false,
                null
        );
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
        return new AiResolutionResponse(
                false,
                0.0,
                "Mock resolution assessment."
        );
    }
}