package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.AiInteractionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AiInteractionLogRepository extends JpaRepository<AiInteractionLog, Long> {

    Page<AiInteractionLog> findAllByOrderByTimestampDesc(Pageable pageable);

    long countByApiFailedTrue();

    long countByFallbackUsedTrue();

    long countByEscalatedTrue();

    long countByCanAnswerTrue();

    long countByCanResolveTrue();

    @Query("SELECT AVG(l.confidence) FROM AiInteractionLog l WHERE l.apiFailed = false")
    Double getAverageConfidence();

    @Query("SELECT l.risk, COUNT(l) FROM AiInteractionLog l GROUP BY l.risk")
    java.util.List<Object[]> countByRisk();
}
