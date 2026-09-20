package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Get All Employees - ADMIN only
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // Get Employee By ID - ADMIN only
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id
    ) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create Employee - ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> createEmployee(
            @Valid @RequestBody Employee employee
    ) {
        Employee savedEmployee =
                employeeService.createEmployee(employee);

        return ResponseEntity.ok(savedEmployee);
    }

    // Update Employee - ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee
    ) {
        Employee updatedEmployee =
                employeeService.updateEmployee(id, employee);

        return ResponseEntity.ok(updatedEmployee);
    }

    // Delete Employee - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id
    ) {
        employeeService.deleteEmployee(id);

        return ResponseEntity.noContent().build();
    }
}