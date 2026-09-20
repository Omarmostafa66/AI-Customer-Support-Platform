package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get All Employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Get Employee By ID
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    // Create Employee
    public Employee createEmployee(Employee employee) {

        String email = normalizeEmail(employee.getEmail());

        validateEmailAvailability(email, null);

        employee.setEmail(email);

        validateRole(employee.getRole());

        if (employee.getPassword() == null
                || employee.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        employee.setPassword(
                passwordEncoder.encode(employee.getPassword())
        );

        return employeeRepository.save(employee);
    }

    // Update Employee
    public Employee updateEmployee(
            Long id,
            Employee employeeDetails
    ) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found")
                );

        String email = normalizeEmail(employeeDetails.getEmail());

        validateEmailAvailability(email, id);

        validateRole(employeeDetails.getRole());

        employee.setName(employeeDetails.getName());
        employee.setEmail(email);

        /*
         * Only change the password when a new password
         * is actually provided.
         */
        if (employeeDetails.getPassword() != null
                && !employeeDetails.getPassword().isBlank()) {

            employee.setPassword(
                    passwordEncoder.encode(
                            employeeDetails.getPassword()
                    )
            );
        }

        employee.setRole(
                employeeDetails.getRole()
                        .trim()
                        .toUpperCase()
        );

        employee.setAge(employeeDetails.getAge());
        employee.setGender(employeeDetails.getGender());
        employee.setSalary(employeeDetails.getSalary());

        return employeeRepository.save(employee);
    }

    // Delete Employee
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found")
                );

        employeeRepository.delete(employee);
    }

    // Validate email across Customer and Employee accounts
    private void validateEmailAvailability(
            String email,
            Long currentEmployeeId
    ) {

        Optional<Employee> existingEmployee =
                employeeRepository.findByEmail(email);

        if (existingEmployee.isPresent()
                && !existingEmployee.get()
                .getId()
                .equals(currentEmployeeId)) {

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        if (customerRepository.findByEmail(email).isPresent()) {

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }
    }

    // Normalize email
    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        return email.trim().toLowerCase();
    }

    // Validate employee role
    private void validateRole(String role) {

        if (role == null || role.isBlank()) {

            throw new IllegalArgumentException(
                    "Role is required"
            );
        }

        String normalizedRole =
                role.trim().toUpperCase();

        if (!normalizedRole.equals("ADMIN")
                && !normalizedRole.equals("EMPLOYEE")) {

            throw new IllegalArgumentException(
                    "Invalid employee role. Allowed roles: ADMIN, EMPLOYEE"
            );
        }
    }
}