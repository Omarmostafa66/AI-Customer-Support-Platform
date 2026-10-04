package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConversationRepository
        extends JpaRepository<AiConversation, Long> {

    Optional<AiConversation> findFirstByCustomerIdOrderByUpdatedAtDesc(
            Long customerId
    );
}