package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.AiMetricsResponse;
import com.aicustomersupport.aicustomersupportbackend.repository.AiConversationRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.AiInteractionLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AiMetricsService {

    private final AiInteractionLogRepository interactionLogRepository;
    private final AiConversationRepository conversationRepository;

    public AiMetricsService(
            AiInteractionLogRepository interactionLogRepository,
            AiConversationRepository conversationRepository) {
        this.interactionLogRepository = interactionLogRepository;
        this.conversationRepository = conversationRepository;
    }

    public AiMetricsResponse getMetrics() {
        AiMetricsResponse response = new AiMetricsResponse();

        long totalInteractions = interactionLogRepository.count();
        long totalConversations = conversationRepository.count();

        long answered = interactionLogRepository.countByCanAnswerTrue();
        long escalated = interactionLogRepository.countByEscalatedTrue();
        long resolved = interactionLogRepository.countByCanResolveTrue();

        long apiFailures = interactionLogRepository.countByApiFailedTrue();
        long fallbacks = interactionLogRepository.countByFallbackUsedTrue();

        Double avgConfidence = interactionLogRepository.getAverageConfidence();
        if (avgConfidence == null) {
            avgConfidence = 0.0;
        }

        double handlingRate = 0.0;
        if (totalInteractions > 0) {
            handlingRate = (double) answered / totalInteractions;
        }

        List<Object[]> riskCounts = interactionLogRepository.countByRisk();
        Map<String, Long> escalationsByRisk = new HashMap<>();
        for (Object[] result : riskCounts) {
            String risk = (String) result[0];
            Long count = (Long) result[1];
            escalationsByRisk.put(risk, count);
        }

        response.setTotalInteractions(totalInteractions);
        response.setTotalConversations(totalConversations);
        response.setInteractionsAnswered(answered);
        response.setInteractionsEscalated(escalated);
        response.setInteractionsResolved(resolved);
        response.setAverageConfidence(avgConfidence);
        response.setHandlingRate(handlingRate);
        response.setApiFailures(apiFailures);
        response.setFallbackResponses(fallbacks);
        response.setEscalationsByRisk(escalationsByRisk);

        return response;
    }
}
