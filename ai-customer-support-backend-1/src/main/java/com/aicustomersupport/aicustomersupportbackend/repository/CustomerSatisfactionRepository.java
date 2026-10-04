package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.CustomerSatisfaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerSatisfactionRepository
        extends JpaRepository<CustomerSatisfaction, Long> {

    Optional<CustomerSatisfaction> findByTicketId(Long ticketId);

    boolean existsByTicketId(Long ticketId);
}