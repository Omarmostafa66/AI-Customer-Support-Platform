package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.AiConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationMessageRepository
        extends JpaRepository<AiConversationMessage, Long> {

    List<AiConversationMessage>
    findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}