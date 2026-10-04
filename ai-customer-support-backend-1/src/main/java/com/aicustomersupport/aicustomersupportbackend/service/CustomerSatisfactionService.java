package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.CustomerSatisfactionRequest;
import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.CustomerSatisfaction;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerSatisfactionRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CustomerSatisfactionService {

    private final CustomerSatisfactionRepository satisfactionRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;

    public CustomerSatisfactionService(
            CustomerSatisfactionRepository satisfactionRepository,
            CustomerRepository customerRepository,
            TicketRepository ticketRepository
    ) {
        this.satisfactionRepository = satisfactionRepository;
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
    }

    public CustomerSatisfaction submitSatisfaction(
            Long ticketId,
            CustomerSatisfactionRequest request
    ) {

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated customer not found"
            );
        }

        Customer currentCustomer =
                customerRepository.findByEmail(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (ticket.getCustomer() == null
                || !ticket.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to rate this ticket"
            );
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {

            throw new IllegalStateException(
                    "Only resolved tickets can receive a satisfaction rating"
            );
        }

        if (satisfactionRepository.existsByTicketId(ticketId)) {

            throw new IllegalStateException(
                    "This ticket has already been rated"
            );
        }

        CustomerSatisfaction satisfaction =
                new CustomerSatisfaction();

        satisfaction.setTicket(ticket);

        satisfaction.setRating(
                request.getRating()
        );

        satisfaction.setFeedback(
                request.getFeedback() == null
                        ? null
                        : request.getFeedback().trim()
        );

        return satisfactionRepository.save(
                satisfaction
        );
    }

    // =========================================================
    // Get Customer Satisfaction
    // =========================================================

    public CustomerSatisfaction getSatisfaction(
            Long ticketId
    ) {

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated customer not found"
            );
        }

        Customer currentCustomer =
                customerRepository.findByEmail(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (ticket.getCustomer() == null
                || !ticket.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to view this satisfaction rating"
            );
        }

        return satisfactionRepository
                .findByTicketId(ticketId)
                .orElse(null);
    }
}