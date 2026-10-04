package com.aicustomersupport.aicustomersupportbackend.repository;

import com.aicustomersupport.aicustomersupportbackend.entity.Incident;
import com.aicustomersupport.aicustomersupportbackend.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findBySameMessage(Boolean sameMessage);

    boolean existsByFingerprint(String fingerprint);

    List<Incident> findByEmployeeId(Long employeeId);
}