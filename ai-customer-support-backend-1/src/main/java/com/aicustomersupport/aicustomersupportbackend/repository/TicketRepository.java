package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketPriority;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCustomerId(Long customerId);

    List<Ticket> findByEmployeeId(Long employeeId);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByPriorityIn(List<TicketPriority> priorities);

    Optional<Ticket> findFirstByCustomerIdAndDescriptionAndStatusInOrderByCreatedAtDesc(
            Long customerId,
            String description,
            List<TicketStatus> statuses
    );

    Optional<Ticket> findFirstByAiConversationIdAndStatusInOrderByCreatedAtDesc(
            Long aiConversationId,
            List<TicketStatus> statuses
    );
}