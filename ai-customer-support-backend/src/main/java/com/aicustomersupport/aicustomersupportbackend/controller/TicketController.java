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

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Get All Tickets - ADMIN and EMPLOYEE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
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

    // Analyze Ticket using AI - ADMIN and EMPLOYEE
    @GetMapping("/{id}/analyze")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<AiAnalysisResponse> analyzeTicket(
            @PathVariable Long id
    ) {
        try {

            AiAnalysisResponse analysis =
                    ticketService.analyzeTicket(id);

            return ResponseEntity.ok(analysis);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
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
        try {

            Ticket createdTicket =
                    ticketService.createTicketForCustomer(
                            customerId,
                            ticket
                    );

            return ResponseEntity.ok(createdTicket);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Create Ticket for Customer and Category - ADMIN and EMPLOYEE
    @PostMapping("/customer/{customerId}/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> createTicketForCustomerAndCategory(
            @PathVariable Long customerId,
            @PathVariable Long categoryId,
            @Valid @RequestBody Ticket ticket
    ) {
        try {

            Ticket createdTicket =
                    ticketService.createTicketForCustomerAndCategory(
                            customerId,
                            categoryId,
                            ticket
                    );

            return ResponseEntity.ok(createdTicket);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Update Ticket - ADMIN and EMPLOYEE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody Ticket ticketDetails
    ) {
        try {

            Ticket updatedTicket =
                    ticketService.updateTicket(
                            id,
                            ticketDetails
                    );

            return ResponseEntity.ok(updatedTicket);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Delete Ticket - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id
    ) {
        try {

            ticketService.deleteTicket(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}