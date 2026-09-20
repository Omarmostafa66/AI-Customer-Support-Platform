package com.aicustomersupport.aicustomersupportbackend.auth;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import com.aicustomersupport.aicustomersupportbackend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            CustomerRepository customerRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registerCustomer(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());

        if (customerRepository.findByEmail(email).isPresent()
                || employeeRepository.findByEmail(email).isPresent()) {

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        Customer customer = new Customer();

        customer.setName(request.getName());
        customer.setEmail(email);
        customer.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setGender(request.getGender());
        customer.setAge(request.getAge());

        Customer savedCustomer = customerRepository.save(customer);

        String token = jwtService.generateToken(
                savedCustomer.getId(),
                savedCustomer.getEmail(),
                "CUSTOMER"
        );

        return new AuthResponse(
                token,
                "Bearer",
                savedCustomer.getId(),
                savedCustomer.getEmail(),
                savedCustomer.getName(),
                "CUSTOMER"
        );
    }

    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.getEmail());

        Customer customer = customerRepository
                .findByEmail(email)
                .orElse(null);

        if (customer != null) {

            if (!passwordEncoder.matches(
                    request.getPassword(),
                    customer.getPassword()
            )) {
                throw new IllegalArgumentException(
                        "Invalid email or password."
                );
            }

            String token = jwtService.generateToken(
                    customer.getId(),
                    customer.getEmail(),
                    "CUSTOMER"
            );

            return new AuthResponse(
                    token,
                    "Bearer",
                    customer.getId(),
                    customer.getEmail(),
                    customer.getName(),
                    "CUSTOMER"
            );
        }

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElse(null);

        if (employee != null) {

            if (!passwordEncoder.matches(
                    request.getPassword(),
                    employee.getPassword()
            )) {
                throw new IllegalArgumentException(
                        "Invalid email or password."
                );
            }

            String role = normalizeRole(employee.getRole());

            String token = jwtService.generateToken(
                    employee.getId(),
                    employee.getEmail(),
                    role
            );

            return new AuthResponse(
                    token,
                    "Bearer",
                    employee.getId(),
                    employee.getEmail(),
                    employee.getName(),
                    role
            );
        }

        throw new IllegalArgumentException(
                "Invalid email or password."
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "EMPLOYEE";
        }

        return role.trim().toUpperCase();
    }
}