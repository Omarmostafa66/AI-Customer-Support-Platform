package com.aicustomersupport.aicustomersupportbackend.dto;

import com.aicustomersupport.aicustomersupportbackend.enums.KnowledgeArticleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class KnowledgeArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String category;
    private List<String> tags;

    @NotNull(message = "Status is required")
    private KnowledgeArticleStatus status;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public KnowledgeArticleStatus getStatus() { return status; }
    public void setStatus(KnowledgeArticleStatus status) { this.status = status; }
}
