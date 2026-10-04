package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.dto.NotificationResponse;
import com.aicustomersupport.aicustomersupportbackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get Current Customer Notifications
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        List<NotificationResponse> notifications = notificationService.getCurrentCustomerNotifications();
        return ResponseEntity.ok(notifications);
    }

    // Get Unread Count
    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Long> getUnreadCount() {
        long count = notificationService.getCurrentCustomerUnreadCount();
        return ResponseEntity.ok(count);
    }

    // Mark as Read
    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        NotificationResponse updatedNotification = notificationService.markAsRead(id);
        return ResponseEntity.ok(updatedNotification);
    }
}
