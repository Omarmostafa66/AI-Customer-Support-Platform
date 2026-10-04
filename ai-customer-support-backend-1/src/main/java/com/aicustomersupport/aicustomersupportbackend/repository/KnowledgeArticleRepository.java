package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.KnowledgeArticle;
import com.aicustomersupport.aicustomersupportbackend.enums.KnowledgeArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {
    List<KnowledgeArticle> findByStatusAndActiveTrue(KnowledgeArticleStatus status);

    @Query("SELECT k FROM KnowledgeArticle k WHERE k.active = true AND " +
           "(LOWER(k.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(k.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<KnowledgeArticle> searchArticles(@Param("query") String query);
}
