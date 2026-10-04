package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.ai.AiAnalysisResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final com.aicustomersupport.aicustomersupportbackend.service.AttentionQueueService attentionQueueService;
    private final com.aicustomersupport.aicustomersupportbackend.service.SlaMetricsService slaMetricsService;
    private final com.aicustomersupport.aicustomersupportbackend.service.CustomerSatisfactionService customerSatisfactionService;

    public TicketController(TicketService ticketService, com.aicustomersupport.aicustomersupportbackend.service.AttentionQueueService attentionQueueService, com.aicustomersupport.aicustomersupportbackend.service.SlaMetricsService slaMetricsService, com.aicustomersupport.aicustomersupportbackend.service.CustomerSatisfactionService customerSatisfactionService) {
        this.ticketService = ticketService;
        this.attentionQueueService = attentionQueueService;
        this.slaMetricsService = slaMetricsService;
        this.customerSatisfactionService = customerSatisfactionService;
    }

    // Get All Tickets - ADMIN and EMPLOYEE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }


    // Get Tickets Assigned to Employee - ADMIN and EMPLOYEE
    @GetMapping("/assigned/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Ticket> getTicketsAssignedToEmployee(
            @PathVariable Long employeeId
    ) {
        return ticketService.getTicketsAssignedToEmployee(employeeId);
    }

    // Get Tickets By Customer ID - Authenticated users
    // Ownership will be enforced in a later security step.
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public List<Ticket> getTicketsByCustomerId(
            @PathVariable Long customerId
    ) {
        return ticketService.getTicketsByCustomerId(customerId);
    }

    // Get Attention Queue
    @GetMapping("/attention")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<com.aicustomersupport.aicustomersupportbackend.dto.AttentionQueueResponse> getAttentionQueue() {
        return ResponseEntity.ok(attentionQueueService.getAttentionQueue());
    }

    // Get SLA Metrics
    @GetMapping("/sla/metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<com.aicustomersupport.aicustomersupportbackend.dto.SlaMetricsResponse> getSlaMetrics() {
        return ResponseEntity.ok(slaMetricsService.getMetrics());
    }

    // Get Ticket By ID - Authenticated users
    // Ownership will be enforced in a later security step.
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable Long id
    ) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Customer Satisfaction
    @PostMapping("/{id}/satisfaction")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<com.aicustomersupport.aicustomersupportbackend.entity.CustomerSatisfaction> submitSatisfaction(
            @PathVariable Long id,
            @RequestBody com.aicustomersupport.aicustomersupportbackend.dto.CustomerSatisfactionRequest request) {
        return ResponseEntity.ok(customerSatisfactionService.submitSatisfaction(id, request));
    }

    @GetMapping("/{id}/satisfaction")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<com.aicustomersupport.aicustomersupportbackend.entity.CustomerSatisfaction> getSatisfaction(
            @PathVariable Long id) {
        return ResponseEntity.ok(customerSatisfactionService.getSatisfaction(id));
    }

    // Analyze Ticket using AI - ADMIN and EMPLOYEE
    @GetMapping("/{id}/analyze")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<AiAnalysisResponse> analyzeTicket(
            @PathVariable Long id
    ) {
        AiAnalysisResponse analysis = ticketService.analyzeTicket(id);
        return ResponseEntity.ok(analysis);
    }

    // Create Ticket - CUSTOMER
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public Ticket createTicket(
            @Valid @RequestBody Ticket ticket
    ) {
        return ticketService.createTicket(ticket);
    }

    // Create Ticket for Customer - ADMIN and EMPLOYEE
    @PostMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> createTicketForCustomer(
            @PathVariable Long customerId,
            @Valid @RequestBody Ticket ticket
    ) {
        Ticket createdTicket = ticketService.createTicketForCustomer(customerId, ticket);
        return ResponseEntity.ok(createdTicket);
    }

    // Create Ticket for Customer and Category - ADMIN and EMPLOYEE
    @PostMapping("/customer/{customerId}/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> createTicketForCustomerAndCategory(
            @PathVariable Long customerId,
            @PathVariable Long categoryId,
            @Valid @RequestBody Ticket ticket
    ) {
        Ticket createdTicket = ticketService.createTicketForCustomerAndCategory(customerId, categoryId, ticket);
        return ResponseEntity.ok(createdTicket);
    }

    // Update Ticket - ADMIN and EMPLOYEE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody Ticket ticketDetails
    ) {
        Ticket updatedTicket = ticketService.updateTicket(id, ticketDetails);
        return ResponseEntity.ok(updatedTicket);
    }

    // Delete Ticket - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id
    ) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // Link Ticket to Incident - ADMIN and EMPLOYEE
    @PostMapping("/{id}/incident/{incidentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> linkTicketToIncident(
            @PathVariable Long id,
            @PathVariable Long incidentId
    ) {
        return ResponseEntity.ok(ticketService.linkTicketToIncident(id, incidentId));
    }
}