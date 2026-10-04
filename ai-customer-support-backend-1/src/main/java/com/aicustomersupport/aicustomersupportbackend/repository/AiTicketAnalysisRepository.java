package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.AiTicketAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiTicketAnalysisRepository
        extends JpaRepository<AiTicketAnalysis, Long> {

    Optional<AiTicketAnalysis> findByTicketId(Long ticketId);
}