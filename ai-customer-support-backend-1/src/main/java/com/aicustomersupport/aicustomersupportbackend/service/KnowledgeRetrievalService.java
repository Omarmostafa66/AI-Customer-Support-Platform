package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.KnowledgeArticle;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class KnowledgeRetrievalService {

    private final KnowledgeBaseService knowledgeBaseService;

    public KnowledgeRetrievalService(KnowledgeBaseService knowledgeBaseService) {
        this.knowledgeBaseService = knowledgeBaseService;
    }

    public List<KnowledgeArticleReference> retrieveKnowledge(String query, String categoryContext) {
        // Fallback to empty if query is short
        if (query == null || query.trim().length() < 3) {
            return new ArrayList<>();
        }

        // Basic token overlap / keyword matching could be implemented here.
        // For now, we'll use the DB search we created in KnowledgeBaseService,
        // which does simple LIKE queries.
        List<KnowledgeArticle> articles = knowledgeBaseService.searchArticles(query);

        List<KnowledgeArticleReference> results = new ArrayList<>();
        for (int i = 0; i < articles.size() && i < 3; i++) {
            KnowledgeArticle a = articles.get(i);
            KnowledgeArticleReference ref = new KnowledgeArticleReference();
            ref.setArticleId(a.getId());
            ref.setTitle(a.getTitle());
            // deterministic placeholder score for now
            ref.setRelevanceScore(0.85 - (i * 0.1));
            // simple snippet
            String content = a.getContent();
            ref.setSnippet(content.length() > 200 ? content.substring(0, 200) + "..." : content);
            results.add(ref);
        }
        
        return results;
    }

    public static class KnowledgeArticleReference {
        private Long articleId;
        private String title;
        private double relevanceScore;
        private String snippet;

        public Long getArticleId() { return articleId; }
        public void setArticleId(Long articleId) { this.articleId = articleId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public double getRelevanceScore() { return relevanceScore; }
        public void setRelevanceScore(double relevanceScore) { this.relevanceScore = relevanceScore; }
        public String getSnippet() { return snippet; }
        public void setSnippet(String snippet) { this.snippet = snippet; }
    }
}
