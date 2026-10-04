package com.aicustomersupport.aicustomersupportbackend.ai;

import java.util.List;

public interface AiSupportService {

    AiAnalysisResponse analyzeTicket(
            String title,
            String description,
            List<AiChatMessage> conversation
    );

    String summarizeConversation(
            List<AiChatMessage> conversation
    );

    AiChatResponse chat(
            String message,
            List<AiChatMessage> conversation
    );

    AiResolutionResponse assessResolution(
            String title,
            String description,
            List<AiChatMessage> conversation
    );
}