package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCustomerId(Long customerId);

}