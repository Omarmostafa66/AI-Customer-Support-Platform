package com.aicustomersupport.aicustomersupportbackend.config;

import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Value("${app.admin.email:admin@aicustomersupport.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123456}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initializeDefaultAdmin(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            boolean adminExists =
                    employeeRepository.findAll()
                            .stream()
                            .anyMatch(employee ->
                                    "ADMIN".equalsIgnoreCase(
                                            employee.getRole()
                                    )
                            );

            if (adminExists) {
                return;
            }

            Employee admin = new Employee();

            admin.setName("System Administrator");
            admin.setEmail(adminEmail.trim().toLowerCase());

            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );

            admin.setRole("ADMIN");

            admin.setAge(30);
            admin.setGender("Not Specified");
            admin.setSalary(0.0);

            employeeRepository.save(admin);

            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "Default ADMIN account created successfully."
            );
            System.out.println(
                    "Email: " + adminEmail
            );
            System.out.println(
                    "=============================================="
            );
        };
    }
}