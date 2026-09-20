package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.entity.Incident;
import com.aicustomersupport.aicustomersupportbackend.enums.IncidentStatus;
import com.aicustomersupport.aicustomersupportbackend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    // Create Incident - ADMIN and EMPLOYEE
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Incident> createIncident(
            @Valid @RequestBody Incident incident
    ) {
        Incident createdIncident =
                incidentService.createIncident(incident);

        return ResponseEntity.ok(createdIncident);
    }

    // Create Incident For Employee - ADMIN only
    @PostMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> createIncidentForEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody Incident incident
    ) {
        try {
            Incident createdIncident =
                    incidentService.createIncidentForEmployee(
                            employeeId,
                            incident
                    );

            return ResponseEntity.ok(createdIncident);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get All Incidents - ADMIN and EMPLOYEE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Incident> getAllIncidents() {
        return incidentService.getAllIncidents();
    }

    // Get Incident By ID - ADMIN and EMPLOYEE
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Incident> getIncidentById(
            @PathVariable Long id
    ) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get Incidents By Employee ID - ADMIN and EMPLOYEE
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Incident> getIncidentsByEmployeeId(
            @PathVariable Long employeeId
    ) {
        return incidentService
                .getIncidentsByEmployeeId(employeeId);
    }

    // Get Incidents By Status - ADMIN and EMPLOYEE
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Incident> getIncidentsByStatus(
            @PathVariable IncidentStatus status
    ) {
        return incidentService.getIncidentsByStatus(status);
    }

    // Get Incidents By Same Message - ADMIN and EMPLOYEE
    @GetMapping("/same-message/{sameMessage}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Incident> getIncidentsBySameMessage(
            @PathVariable Boolean sameMessage
    ) {
        return incidentService
                .getIncidentsBySameMessage(sameMessage);
    }

    // Update Incident - ADMIN and EMPLOYEE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Incident> updateIncident(
            @PathVariable Long id,
            @Valid @RequestBody Incident incident
    ) {
        try {
            Incident updatedIncident =
                    incidentService.updateIncident(
                            id,
                            incident
                    );

            return ResponseEntity.ok(updatedIncident);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Resolve Incident - ADMIN and EMPLOYEE
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Incident> resolveIncident(
            @PathVariable Long id
    ) {
        try {
            Incident resolvedIncident =
                    incidentService.resolveIncident(id);

            return ResponseEntity.ok(resolvedIncident);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign Incident To Employee - ADMIN only
    @PutMapping("/{incidentId}/assign/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> assignIncidentToEmployee(
            @PathVariable Long incidentId,
            @PathVariable Long employeeId
    ) {
        try {
            Incident incident =
                    incidentService.assignIncidentToEmployee(
                            incidentId,
                            employeeId
                    );

            return ResponseEntity.ok(incident);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Assign Category To Incident - ADMIN only
    @PutMapping("/{incidentId}/category/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> assignCategoryToIncident(
            @PathVariable Long incidentId,
            @PathVariable Long categoryId
    ) {
        try {
            Incident incident =
                    incidentService.assignCategoryToIncident(
                            incidentId,
                            categoryId
                    );

            return ResponseEntity.ok(incident);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete Incident - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable Long id
    ) {
        try {
            incidentService.deleteIncident(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}