package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.SlaStatus;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketPriority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SlaService {

    public LocalDateTime calculateDueAt(
            TicketPriority priority,
            LocalDateTime createdAt
    ) {

        if (priority == null || createdAt == null) {
            return null;
        }

        return switch (priority) {
            case LOW -> createdAt.plusHours(48);
            case MEDIUM -> createdAt.plusHours(24);
            case HIGH -> createdAt.plusHours(8);
            case URGENT -> createdAt.plusHours(4);
        };
    }

    public SlaStatus getSlaStatus(Ticket ticket) {

        if (ticket == null
                || ticket.getSlaDueAt() == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();

        if (ticket.getResolvedAt() != null) {

            if (ticket.getResolvedAt()
                    .isBefore(ticket.getSlaDueAt())
                    || ticket.getResolvedAt()
                    .isEqual(ticket.getSlaDueAt())) {

                return SlaStatus.RESOLVED_WITHIN_SLA;
            }

            return SlaStatus.RESOLVED_AFTER_SLA;
        }

        if (now.isAfter(ticket.getSlaDueAt())) {
            return SlaStatus.BREACHED;
        }

        return SlaStatus.WITHIN_SLA;
    }
}