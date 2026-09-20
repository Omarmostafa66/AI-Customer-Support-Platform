package com.aicustomersupport.aicustomersupportbackend.entity;

import com.aicustomersupport.aicustomersupportbackend.enums.IncidentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "same_message", nullable = false)
    private Boolean sameMessage = false;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    @Column(nullable = false, unique = true, updatable = false)
    private String fingerprint;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;


    // العلاقة مع Employee
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;


    public Incident() {
    }


    @PrePersist
    public void onCreate() {

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        if (this.fingerprint == null || this.fingerprint.isBlank()) {
            this.fingerprint = UUID.randomUUID().toString();
        }

        if (this.sameMessage == null) {
            this.sameMessage = false;
        }
    }


    @PreUpdate
    public void onUpdate() {

        if (this.status == IncidentStatus.RESOLVED
                && this.resolvedAt == null) {

            this.resolvedAt = LocalDateTime.now();
        }
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Boolean getSameMessage() {
        return sameMessage;
    }

    public void setSameMessage(Boolean sameMessage) {
        this.sameMessage = sameMessage;
    }


    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }


    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }


    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }


    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}