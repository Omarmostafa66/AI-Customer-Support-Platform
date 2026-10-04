package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.KnowledgeArticleRequest;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.entity.KnowledgeArticle;
import com.aicustomersupport.aicustomersupportbackend.enums.KnowledgeArticleStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.KnowledgeArticleRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class KnowledgeBaseService {

    private final KnowledgeArticleRepository repository;
    private final EmployeeRepository employeeRepository;

    public KnowledgeBaseService(KnowledgeArticleRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    private Employee getCurrentEmployee() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated employee not found"));
    }

    public KnowledgeArticle createArticle(KnowledgeArticleRequest request) {
        KnowledgeArticle article = new KnowledgeArticle();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());
        article.setStatus(request.getStatus());
        article.setCreatedBy(getCurrentEmployee());
        return repository.save(article);
    }

    public KnowledgeArticle updateArticle(Long id, KnowledgeArticleRequest request) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());
        
        if (request.getStatus() == KnowledgeArticleStatus.PUBLISHED && article.getStatus() != KnowledgeArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        article.setStatus(request.getStatus());
        article.setVersion(article.getVersion() + 1);

        return repository.save(article);
    }

    public List<KnowledgeArticle> getAllArticles() {
        return repository.findAll();
    }

    public List<KnowledgeArticle> getPublishedArticles() {
        return repository.findByStatusAndActiveTrue(KnowledgeArticleStatus.PUBLISHED);
    }

    public List<KnowledgeArticle> searchArticles(String query) {
        return repository.searchArticles(query);
    }

    public KnowledgeArticle getArticle(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public void deleteArticle(Long id) {
        KnowledgeArticle article = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        article.setActive(false);
        repository.save(article);
    }
}
