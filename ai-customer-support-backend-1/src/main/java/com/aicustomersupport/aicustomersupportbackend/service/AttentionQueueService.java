package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.AttentionQueueResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.SlaStatus;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketPriority;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.AiTicketAnalysisRepository;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;
import com.aicustomersupport.aicustomersupportbackend.entity.AiTicketAnalysis;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AttentionQueueService {

    private final TicketRepository ticketRepository;
    private final SlaService slaService;
    private final AiTicketAnalysisRepository aiTicketAnalysisRepository;

    public AttentionQueueService(
            TicketRepository ticketRepository,
            SlaService slaService,
            AiTicketAnalysisRepository aiTicketAnalysisRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.slaService = slaService;
        this.aiTicketAnalysisRepository = aiTicketAnalysisRepository;
    }

    public AttentionQueueResponse getAttentionQueue() {

        // Fetch only active tickets (not RESOLVED or CLOSED)
        List<Ticket> allTickets = ticketRepository.findAll()
            .stream()
            .filter(t -> t.getStatus() == TicketStatus.OPEN || t.getStatus() == TicketStatus.IN_PROGRESS)
            .toList();

        List<Ticket> attentionTickets = new ArrayList<>();

        long urgentTickets = 0;
        long highPriorityTickets = 0;
        long slaBreachedTickets = 0;
        long highRiskTickets = 0;

        for (Ticket ticket : allTickets) {
            boolean isUrgent = ticket.getPriority() == TicketPriority.URGENT;
            boolean isHigh = ticket.getPriority() == TicketPriority.HIGH;

            SlaStatus slaStatus = slaService.getSlaStatus(ticket);
            ticket.setSlaStatus(slaStatus);
            boolean isBreached = slaStatus == SlaStatus.BREACHED;

            // Check AI Risk
            boolean isHighRisk = false;
            AiTicketAnalysis analysis = aiTicketAnalysisRepository.findByTicketId(ticket.getId()).orElse(null);
            if (analysis != null) {
                String risk = analysis.getRisk();
                if ("HIGH".equalsIgnoreCase(risk) || "CRITICAL".equalsIgnoreCase(risk)) {
                    isHighRisk = true;
                }
            }

            if (isUrgent) {
                urgentTickets++;
            }

            if (isHigh) {
                highPriorityTickets++;
            }

            if (isBreached) {
                slaBreachedTickets++;
            }
            
            if (isHighRisk) {
                highRiskTickets++;
            }

            if (isUrgent || isHigh || isBreached || isHighRisk) {
                attentionTickets.add(ticket);
            }
        }

        attentionTickets.sort(
                Comparator
                        .comparing(
                                (Ticket ticket) ->
                                        ticket.getPriority() == TicketPriority.URGENT
                                                ? 0
                                                : ticket.getPriority() == TicketPriority.HIGH
                                                ? 1
                                                : 2
                        )
                        .thenComparing(Ticket::getCreatedAt)
        );

        AttentionQueueResponse response = new AttentionQueueResponse();
        response.setUrgentTickets(urgentTickets);
        response.setHighPriorityTickets(highPriorityTickets);
        response.setSlaBreachedTickets(slaBreachedTickets);
        response.setTickets(attentionTickets);

        return response;
    }
}