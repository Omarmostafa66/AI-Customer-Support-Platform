package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Category;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.entity.Incident;
import com.aicustomersupport.aicustomersupportbackend.enums.IncidentStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.CategoryRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final EmployeeRepository employeeRepository;
    private final CategoryRepository categoryRepository;

    public IncidentService(
            IncidentRepository incidentRepository,
            EmployeeRepository employeeRepository,
            CategoryRepository categoryRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.employeeRepository = employeeRepository;
        this.categoryRepository = categoryRepository;
    }


    // Create Incident
    public Incident createIncident(Incident incident) {

        if (incident.getStatus() == null) {
            incident.setStatus(IncidentStatus.OPEN);
        }

        return incidentRepository.save(incident);
    }


    // Create Incident For Employee
    public Incident createIncidentForEmployee(
            Long employeeId,
            Incident incident
    ) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found")
                );

        if (incident.getStatus() == null) {
            incident.setStatus(IncidentStatus.OPEN);
        }

        incident.setEmployee(employee);

        return incidentRepository.save(incident);
    }


    // Get All Incidents
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }


    // Get Incident By ID
    public Optional<Incident> getIncidentById(Long id) {
        return incidentRepository.findById(id);
    }


    // Get Incidents By Status
    public List<Incident> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status);
    }


    // Get Incidents By Same Message
    public List<Incident> getIncidentsBySameMessage(Boolean sameMessage) {
        return incidentRepository.findBySameMessage(sameMessage);
    }


    // Get Incidents By Employee ID
    public List<Incident> getIncidentsByEmployeeId(Long employeeId) {
        return incidentRepository.findByEmployeeId(employeeId);
    }


    // Assign Incident To Employee
    public Incident assignIncidentToEmployee(
            Long incidentId,
            Long employeeId
    ) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found")
                );

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found")
                );

        incident.setEmployee(employee);

        return incidentRepository.save(incident);
    }


    // Assign Category To Incident
    public Incident assignCategoryToIncident(
            Long incidentId,
            Long categoryId
    ) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found")
                );

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found")
                );

        incident.setCategory(category);

        return incidentRepository.save(incident);
    }


    // Update Incident
    public Incident updateIncident(
            Long id,
            Incident incidentDetails
    ) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found")
                );

        incident.setSameMessage(incidentDetails.getSameMessage());

        if (incidentDetails.getStatus() != null) {
            incident.setStatus(incidentDetails.getStatus());
        }

        return incidentRepository.save(incident);
    }


    // Resolve Incident
    public Incident resolveIncident(Long id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found")
                );

        incident.setStatus(IncidentStatus.RESOLVED);

        if (incident.getResolvedAt() == null) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        return incidentRepository.save(incident);
    }


    // Delete Incident
    public void deleteIncident(Long id) {

        if (!incidentRepository.existsById(id)) {
            throw new RuntimeException("Incident not found");
        }

        incidentRepository.deleteById(id);
    }
}