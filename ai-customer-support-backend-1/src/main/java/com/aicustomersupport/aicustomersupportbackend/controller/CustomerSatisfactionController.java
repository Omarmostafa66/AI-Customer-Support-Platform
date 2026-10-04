package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.dto.CustomerSatisfactionMetricsResponse;
import com.aicustomersupport.aicustomersupportbackend.service.CustomerSatisfactionMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/admin/customer-satisfaction")
public class CustomerSatisfactionController {

    private final CustomerSatisfactionMetricsService csatMetricsService;

    public CustomerSatisfactionController(CustomerSatisfactionMetricsService csatMetricsService) {
        this.csatMetricsService = csatMetricsService;
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerSatisfactionMetricsResponse> getMetrics() {
        return ResponseEntity.ok(csatMetricsService.getMetrics());
    }
}
