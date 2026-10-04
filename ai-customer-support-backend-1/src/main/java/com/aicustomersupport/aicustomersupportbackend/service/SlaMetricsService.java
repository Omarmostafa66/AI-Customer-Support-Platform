package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.SlaMetricsResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.SlaStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
public class SlaMetricsService {

    private final TicketRepository ticketRepository;
    private final SlaService slaService;


    public SlaMetricsService(
            TicketRepository ticketRepository,
            SlaService slaService
    ) {
        this.ticketRepository = ticketRepository;
        this.slaService = slaService;
    }


    public SlaMetricsResponse getMetrics() {

        List<Ticket> tickets =
                ticketRepository.findAll();

        SlaMetricsResponse response =
                new SlaMetricsResponse();

        response.setTotalTickets(
                tickets.size()
        );

        long withinSla = 0;
        long breached = 0;
        long resolvedWithinSla = 0;
        long resolvedAfterSla = 0;

        long totalFirstResponseMinutes = 0;
        long firstResponseCount = 0;

        long totalResolutionMinutes = 0;
        long resolutionCount = 0;


        for (Ticket ticket : tickets) {

            SlaStatus slaStatus =
                    slaService.getSlaStatus(ticket);


            if (slaStatus == null) {
                continue;
            }


            switch (slaStatus) {

                case WITHIN_SLA ->
                        withinSla++;

                case BREACHED ->
                        breached++;

                case RESOLVED_WITHIN_SLA ->
                        resolvedWithinSla++;

                case RESOLVED_AFTER_SLA ->
                        resolvedAfterSla++;
            }


            if (ticket.getCreatedAt() != null
                    && ticket.getFirstResponseAt() != null) {

                long minutes =
                        Duration.between(
                                ticket.getCreatedAt(),
                                ticket.getFirstResponseAt()
                        ).toMinutes();

                if (minutes >= 0) {
                    totalFirstResponseMinutes += minutes;
                    firstResponseCount++;
                }
            }


            if (ticket.getCreatedAt() != null
                    && ticket.getResolvedAt() != null) {

                long minutes =
                        Duration.between(
                                ticket.getCreatedAt(),
                                ticket.getResolvedAt()
                        ).toMinutes();

                if (minutes >= 0) {
                    totalResolutionMinutes += minutes;
                    resolutionCount++;
                }
            }
        }


        double averageFirstResponseMinutes =
                firstResponseCount == 0
                        ? 0
                        : (double) totalFirstResponseMinutes
                        / firstResponseCount;


        double averageResolutionMinutes =
                resolutionCount == 0
                        ? 0
                        : (double) totalResolutionMinutes
                        / resolutionCount;


        long slaCompletedTickets =
                resolvedWithinSla
                        + resolvedAfterSla;


        double slaCompliancePercentage =
                slaCompletedTickets == 0
                        ? 0
                        : (double) resolvedWithinSla
                        / slaCompletedTickets
                        * 100.0;


        response.setWithinSla(
                withinSla
        );

        response.setBreached(
                breached
        );

        response.setResolvedWithinSla(
                resolvedWithinSla
        );

        response.setResolvedAfterSla(
                resolvedAfterSla
        );

        response.setAverageFirstResponseMinutes(
                Math.round(
                        averageFirstResponseMinutes * 100.0
                ) / 100.0
        );

        response.setAverageResolutionMinutes(
                Math.round(
                        averageResolutionMinutes * 100.0
                ) / 100.0
        );

        response.setSlaCompliancePercentage(
                Math.round(
                        slaCompliancePercentage * 100.0
                ) / 100.0
        );


        return response;
    }
}