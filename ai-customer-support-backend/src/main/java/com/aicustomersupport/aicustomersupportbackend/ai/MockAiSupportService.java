package com.aicustomersupport.aicustomersupportbackend.ai;

import org.springframework.stereotype.Service;

@Service
public class MockAiSupportService implements AiSupportService {

    @Override
    public AiAnalysisResponse analyzeTicket(
            String title,
            String description) {

        return new AiAnalysisResponse(
                "General Support",
                "MEDIUM",
                "Thank you for contacting support. Our team will review your request shortly."
        );
    }
}