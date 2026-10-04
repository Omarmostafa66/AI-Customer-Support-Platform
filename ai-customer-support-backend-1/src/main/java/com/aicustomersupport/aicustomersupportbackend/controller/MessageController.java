package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.entity.Message;
import com.aicustomersupport.aicustomersupportbackend.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // Create Message - CUSTOMER
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Message> createMessage(
            @Valid @RequestBody Message message
    ) {
        Message createdMessage =
                messageService.createMessage(message);

        return ResponseEntity.ok(createdMessage);
    }

    // Create Message For Customer - ADMIN and EMPLOYEE
    @PostMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Message> createMessageForCustomer(
            @PathVariable Long customerId,
            @Valid @RequestBody Message message
    ) {
        try {

            Message createdMessage =
                    messageService.createMessageForCustomer(
                            customerId,
                            message
                    );

            return ResponseEntity.ok(createdMessage);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // =========================================================
    // Get Messages By Ticket
    // CUSTOMER / EMPLOYEE / ADMIN
    //
    // GET /messages/ticket/{ticketId}
    // =========================================================

    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')"
    )
    public ResponseEntity<List<Message>> getMessagesByTicket(
            @PathVariable Long ticketId
    ) {

        try {

            List<Message> messages =
                    messageService.getMessagesByTicket(
                            ticketId
                    );

            return ResponseEntity.ok(messages);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }


    // =========================================================
    // Create Message For Ticket
    // CUSTOMER / EMPLOYEE / ADMIN
    //
    // POST /messages/ticket/{ticketId}
    // =========================================================

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')"
    )
    public ResponseEntity<Message> createMessageForTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody Message message
    ) {

        try {

            Message createdMessage =
                    messageService.createMessageForTicket(
                            ticketId,
                            message.getTxt()
                    );

            return ResponseEntity.ok(createdMessage);

        } catch (IllegalStateException e) {

            // Ticket is CLOSED
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .build();

        } catch (RuntimeException e) {

            // Ticket not found
            // or customer does not own the ticket
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }
    }

    // Get All Messages - ADMIN and EMPLOYEE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    // Get Message By ID - Authenticated users
    // Ownership will be enforced in MessageService.
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<Message> getMessageById(
            @PathVariable Long id
    ) {
        return messageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update Message - ADMIN and EMPLOYEE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Message> updateMessage(
            @PathVariable Long id,
            @Valid @RequestBody Message messageDetails
    ) {
        try {

            Message updatedMessage =
                    messageService.updateMessage(
                            id,
                            messageDetails
                    );

            return ResponseEntity.ok(updatedMessage);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Delete Message - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id
    ) {
        try {

            messageService.deleteMessage(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}