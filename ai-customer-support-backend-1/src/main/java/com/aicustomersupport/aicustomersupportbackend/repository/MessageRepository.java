package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    boolean existsByCustomerId(Long customerId);

    List<Message> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}