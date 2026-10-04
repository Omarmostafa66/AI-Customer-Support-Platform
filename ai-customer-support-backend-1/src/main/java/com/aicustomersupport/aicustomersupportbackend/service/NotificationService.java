package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.NotificationResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Notification;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.NotificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            CustomerRepository customerRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.customerRepository = customerRepository;
    }

    // =========================================================
    // Create Notification
    // =========================================================

    public Notification createNotification(
            Customer customer,
            Ticket ticket,
            String title,
            String message
    ) {

        if (customer == null) {
            throw new IllegalArgumentException(
                    "Customer is required"
            );
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }

        Notification notification = new Notification();

        notification.setCustomer(customer);
        notification.setTicket(ticket);
        notification.setTitle(title.trim());
        notification.setMessage(message.trim());
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // =========================================================
    // Get Current Customer Notifications
    // =========================================================

    public List<NotificationResponse> getCurrentCustomerNotifications() {

        Customer currentCustomer =
                getCurrentCustomer();

        return notificationRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        currentCustomer.getId()
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // Get Current Customer Unread Count
    // =========================================================

    public long getCurrentCustomerUnreadCount() {

        Customer currentCustomer =
                getCurrentCustomer();

        return notificationRepository
                .countByCustomerIdAndReadFalse(
                        currentCustomer.getId()
                );
    }

    // =========================================================
    // Mark Notification As Read
    // =========================================================

    public NotificationResponse markAsRead(Long notificationId) {

        Customer currentCustomer =
                getCurrentCustomer();

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        if (notification.getCustomer() == null
                || !notification.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this notification"
            );
        }

        notification.setRead(true);

        Notification savedNotification =
                notificationRepository.save(notification);

        return toResponse(savedNotification);
    }

    // =========================================================
    // Convert Notification To Response
    // =========================================================

    private NotificationResponse toResponse(
            Notification notification
    ) {

        Long ticketId = null;

        if (notification.getTicket() != null) {
            ticketId = notification.getTicket().getId();
        }

        return new NotificationResponse(
                notification.getId(),
                ticketId,
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    // =========================================================
    // Get Current Customer
    // =========================================================

    private Customer getCurrentCustomer() {

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

        return customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );
    }
}