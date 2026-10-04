package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.entity.Message;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.MessageRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public MessageService(
            MessageRepository messageRepository,
            CustomerRepository customerRepository,
            TicketRepository ticketRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // Create Message
    // CUSTOMER creates a standalone message
    // =========================================================
    public Message createMessage(Message message) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Customer currentCustomer =
                getCurrentCustomer(authentication);

        message.setCustomer(currentCustomer);
        message.setSenderType(Message.SenderType.CUSTOMER);

        return messageRepository.save(message);
    }

    // =========================================================
    // Create Message For Customer
    // ADMIN / EMPLOYEE creates a standalone message
    // =========================================================
    public Message createMessageForCustomer(
            Long customerId,
            Message message
    ) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        message.setCustomer(customer);
        message.setSenderType(Message.SenderType.EMPLOYEE);

        return messageRepository.save(message);
    }

    // =========================================================
    // Get All Messages
    // ADMIN / EMPLOYEE only
    // =========================================================
    public List<Message> getAllMessages() {

        return messageRepository.findAll();
    }

    // =========================================================
    // Get Message By ID
    // =========================================================
    public Optional<Message> getMessageById(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Message message =
                messageRepository.findById(id)
                        .orElse(null);

        if (message == null) {
            return Optional.empty();
        }

        if (isAdminOrEmployee(authentication)) {
            return Optional.of(message);
        }

        Customer currentCustomer =
                getCurrentCustomer(authentication);

        if (message.getCustomer() == null
                || !message.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this message"
            );
        }

        return Optional.of(message);
    }

    // =========================================================
    // Update Message
    // ADMIN / EMPLOYEE only
    // =========================================================
    public Message updateMessage(
            Long id,
            Message messageDetails
    ) {

        Message message =
                messageRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Message not found"
                                )
                        );

        message.setTxt(messageDetails.getTxt());

        return messageRepository.save(message);
    }

    // =========================================================
    // Delete Message
    // ADMIN only
    // =========================================================
    public void deleteMessage(Long id) {

        if (!messageRepository.existsById(id)) {

            throw new RuntimeException(
                    "Message not found"
            );
        }

        messageRepository.deleteById(id);
    }

    // =========================================================
    // Get Messages By Ticket
    // CUSTOMER / EMPLOYEE / ADMIN
    //
    // IMPORTANT:
    // Reading a closed ticket conversation is allowed.
    // =========================================================
    public List<Message> getMessagesByTicket(Long ticketId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        boolean isAdmin =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_ADMIN")
                        );

        boolean isEmployee =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_EMPLOYEE")
                        );

        if (isEmployee) {

            ensureEmployeeAssigned(
                    authentication,
                    ticket
            );

        } else if (!isAdmin) {

            Customer currentCustomer =
                    getCurrentCustomer(authentication);

            if (
                    ticket.getCustomer() == null ||
                            !ticket.getCustomer()
                                    .getId()
                                    .equals(
                                            currentCustomer.getId()
                                    )
            ) {

                throw new RuntimeException(
                        "You are not allowed to access this ticket"
                );
            }
        }

        return messageRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // =========================================================
    // Get Messages For Resolution Assessment
    // Internal backend use for chronological conversation history
    // =========================================================
    public List<Message> getMessagesForResolutionAssessment(Long ticketId) {

        return messageRepository
                .findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // =========================================================
    // Create Message For Ticket
    // CUSTOMER / EMPLOYEE / ADMIN
    //
    // IMPORTANT:
    // CLOSED tickets cannot receive new messages.
    // =========================================================
    public Message createMessageForTicket(
            Long ticketId,
            String txt
    ) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        ensureEmployeeAssigned(
                authentication,
                ticket
        );

        // Prevent replies on CLOSED tickets
        if (ticket.getStatus() == TicketStatus.CLOSED) {

            throw new IllegalStateException(
                    "This ticket is closed and cannot receive new messages"
            );
        }

        Message message = new Message();

        message.setTxt(txt);
        message.setTicket(ticket);

        // =====================================================
        // CUSTOMER
        // =====================================================

        if (!isAdminOrEmployee(authentication)) {

            Customer currentCustomer =
                    getCurrentCustomer(authentication);

            if (ticket.getCustomer() == null
                    || !ticket.getCustomer()
                    .getId()
                    .equals(currentCustomer.getId())) {

                throw new RuntimeException(
                        "You are not allowed to reply to this ticket"
                );
            }

            message.setCustomer(currentCustomer);
            message.setSenderType(
                    Message.SenderType.CUSTOMER
            );

        } else {

            // =================================================
            // ADMIN / EMPLOYEE
            // =================================================

            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(LocalDateTime.now());
                ticketRepository.save(ticket);
            }

            message.setCustomer(
                    ticket.getCustomer()
            );

            message.setSenderType(
                    Message.SenderType.EMPLOYEE
            );
        }

        Message savedMessage =
                messageRepository.save(message);

        if (message.getSenderType() == Message.SenderType.EMPLOYEE
                && ticket.getCustomer() != null) {

            notificationService.createNotification(
                    ticket.getCustomer(),
                    ticket,
                    "New Reply on Your Ticket",
                    "A support employee has replied to your ticket #"
                            + ticket.getId()
                            + "."
            );
        }

        return savedMessage;
    }

    // =========================================================
    // Check Employee Assignment
    // =========================================================
    private void ensureEmployeeAssigned(
            Authentication authentication,
            Ticket ticket
    ) {

        if (
                authentication == null ||
                        authentication.getName() == null
        ) {
            throw new RuntimeException(
                    "Authenticated user not found"
            );
        }

        boolean isEmployee =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_EMPLOYEE")
                        );

        if (!isEmployee) {
            return;
        }

        Employee currentEmployee =
                employeeRepository
                        .findByEmail(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        if (
                ticket.getEmployee() == null ||
                        !ticket.getEmployee()
                                .getId()
                                .equals(
                                        currentEmployee.getId()
                                )
        ) {

            throw new RuntimeException(
                    "You are not allowed to access this ticket"
            );
        }
    }

    // =========================================================
    // Get Current Customer
    // =========================================================
    private Customer getCurrentCustomer(
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "Authenticated user not found"
            );
        }

        return customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );
    }

    // =========================================================
    // Check ADMIN / EMPLOYEE
    // =========================================================
    private boolean isAdminOrEmployee(
            Authentication authentication
    ) {

        return authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> {

                    String authorityName =
                            authority.getAuthority();

                    return authorityName.equals("ROLE_ADMIN")
                            || authorityName.equals("ROLE_EMPLOYEE");
                });
    }
}