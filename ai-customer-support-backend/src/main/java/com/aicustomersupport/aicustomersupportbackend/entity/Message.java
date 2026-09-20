package com.aicustomersupport.aicustomersupportbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Message text is required")
    @Column(name = "txt", nullable = false, columnDefinition = "TEXT")
    private String txt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;


    public Message() {
    }


    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;


    @PrePersist
    public void onCreate() {

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getTxt() {
        return txt;
    }

    public void setTxt(String txt) {
        this.txt = txt;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}