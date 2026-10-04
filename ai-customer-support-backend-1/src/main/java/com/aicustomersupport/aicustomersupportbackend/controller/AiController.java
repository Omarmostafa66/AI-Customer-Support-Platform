package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.ai.AiChatRequest;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatResponse;
import com.aicustomersupport.aicustomersupportbackend.service.AiConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiConversationService aiConversationService;

    public AiController(AiConversationService aiConversationService) {
        this.aiConversationService = aiConversationService;
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'ADMIN')")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiConversationService.chat(request));
    }
}
