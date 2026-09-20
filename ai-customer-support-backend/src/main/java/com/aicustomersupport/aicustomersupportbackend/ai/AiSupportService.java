package com.aicustomersupport.aicustomersupportbackend.ai;

public interface AiSupportService {

    AiAnalysisResponse analyzeTicket(
            String title,
            String description
    );
}