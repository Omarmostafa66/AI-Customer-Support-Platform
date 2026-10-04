package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.dto.AiMetricsResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.AiInteractionLog;
import com.aicustomersupport.aicustomersupportbackend.repository.AiInteractionLogRepository;
import com.aicustomersupport.aicustomersupportbackend.service.AiMetricsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/admin/ai-monitoring")
public class AiMonitoringController {

    private final AiMetricsService aiMetricsService;
    private final AiInteractionLogRepository aiInteractionLogRepository;

    public AiMonitoringController(
            AiMetricsService aiMetricsService,
            AiInteractionLogRepository aiInteractionLogRepository) {
        this.aiMetricsService = aiMetricsService;
        this.aiInteractionLogRepository = aiInteractionLogRepository;
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AiMetricsResponse> getMetrics() {
        return ResponseEntity.ok(aiMetricsService.getMetrics());
    }

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AiInteractionLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(aiInteractionLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size)));
    }
}
