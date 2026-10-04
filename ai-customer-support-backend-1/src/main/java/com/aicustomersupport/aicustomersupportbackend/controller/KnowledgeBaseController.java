package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.dto.KnowledgeArticleRequest;
import com.aicustomersupport.aicustomersupportbackend.entity.KnowledgeArticle;
import com.aicustomersupport.aicustomersupportbackend.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/admin/knowledge-base")
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    public KnowledgeBaseController(KnowledgeBaseService knowledgeBaseService) {
        this.knowledgeBaseService = knowledgeBaseService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KnowledgeArticle> createArticle(@Valid @RequestBody KnowledgeArticleRequest request) {
        return ResponseEntity.ok(knowledgeBaseService.createArticle(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KnowledgeArticle> updateArticle(@PathVariable Long id, @Valid @RequestBody KnowledgeArticleRequest request) {
        return ResponseEntity.ok(knowledgeBaseService.updateArticle(id, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KnowledgeArticle>> getAllArticles() {
        return ResponseEntity.ok(knowledgeBaseService.getAllArticles());
    }

    @GetMapping("/published")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<KnowledgeArticle>> getPublishedArticles() {
        return ResponseEntity.ok(knowledgeBaseService.getPublishedArticles());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<KnowledgeArticle>> searchArticles(@RequestParam String query) {
        return ResponseEntity.ok(knowledgeBaseService.searchArticles(query));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<KnowledgeArticle> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(knowledgeBaseService.getArticle(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        knowledgeBaseService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}
