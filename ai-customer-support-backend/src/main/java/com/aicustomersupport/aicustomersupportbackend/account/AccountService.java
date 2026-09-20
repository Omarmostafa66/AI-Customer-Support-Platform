package com.aicustomersupport.aicustomersupportbackend.account;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

@Service
public class AccountService {

    /*
     * Maximum avatar size = 5 MB.
     *
     * The previous value:
     *
     * 10 * 24 * 1024
     *
     * was only about 240 KB.
     *
     * The frontend already allows 5 MB, so the backend
     * must use the same limit.
     */
    private static final long MAX_AVATAR_SIZE =
            5L * 1024 * 1024;

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            CustomerRepository customerRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================================================
    // Get Current Account
    // =========================================================

    /**
     * Get the currently authenticated account.
     *
     * The account is identified using the email stored
     * inside the authenticated JWT.
     */
    public AccountResponse getCurrentAccount() {

        Authentication authentication =
                getAuthentication();

        String email =
                normalizeEmail(authentication.getName());

        String role =
                getRole(authentication);


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer account not found"
                                    )
                            );

            return toCustomerResponse(customer);
        }


        // -----------------------------------------------------
        // Employee / Admin
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        return toEmployeeResponse(
                employee,
                role
        );
    }


    // =========================================================
    // Update Current Account
    // =========================================================

    /**
     * Update editable profile information.
     *
     * IMPORTANT:
     *
     * Email changes are intentionally blocked here.
     *
     * The JWT subject is the user's email. Allowing the database
     * email to change without issuing a new JWT would leave the
     * current session pointing to the old email.
     *
     * This keeps the authentication/session system stable.
     */
    public AccountResponse updateCurrentAccount(
            UpdateAccountRequest request
    ) {

        Authentication authentication =
                getAuthentication();

        String currentEmail =
                normalizeEmail(authentication.getName());

        String role =
                getRole(authentication);


        // -----------------------------------------------------
        // Validate requested email
        // -----------------------------------------------------

        String requestedEmail =
                normalizeEmail(request.getEmail());

        /*
         * Email is used as the JWT identity.
         *
         * Until a complete token-refresh flow is introduced,
         * changing it from this endpoint is intentionally blocked.
         */
        if (!requestedEmail.equalsIgnoreCase(currentEmail)) {

            throw new IllegalArgumentException(
                    "Email address cannot be changed from the profile page."
            );
        }


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByEmail(currentEmail)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer account not found"
                                    )
                            );

            customer.setName(
                    request.getName().trim()
            );

            /*
             * Keep the existing email.
             */
            customer.setEmail(currentEmail);

            customer.setPhoneNumber(
                    request.getPhoneNumber() == null
                            ? ""
                            : request.getPhoneNumber().trim()
            );

            customer.setAddress(
                    request.getAddress() == null
                            ? ""
                            : request.getAddress().trim()
            );

            customer.setGender(
                    request.getGender().trim()
            );

            customer.setAge(
                    request.getAge()
            );

            Customer saved =
                    customerRepository.save(customer);

            return toCustomerResponse(saved);
        }


        // -----------------------------------------------------
        // Employee / Admin
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(currentEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        employee.setName(
                request.getName().trim()
        );

        /*
         * Keep the existing email.
         */
        employee.setEmail(currentEmail);

        employee.setGender(
                request.getGender().trim()
        );

        employee.setAge(
                request.getAge()
        );

        Employee saved =
                employeeRepository.save(employee);

        return toEmployeeResponse(
                saved,
                role
        );
    }


    // =========================================================
    // Change Password
    // =========================================================

    /**
     * Change the password of the currently authenticated account.
     */
    public void changePassword(
            ChangePasswordRequest request
    ) {

        Authentication authentication =
                getAuthentication();

        String email =
                normalizeEmail(authentication.getName());

        String role =
                getRole(authentication);


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer account not found"
                                    )
                            );

            changeCustomerPassword(
                    customer,
                    request
            );

            return;
        }


        // -----------------------------------------------------
        // Employee / Admin
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        changeEmployeePassword(
                employee,
                request
        );
    }


    // =========================================================
    // Upload Avatar
    // =========================================================

    /**
     * Upload or replace the current account avatar.
     */
    public AvatarResponse uploadAvatar(
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select an image."
            );
        }


        // -----------------------------------------------------
        // File Size
        // -----------------------------------------------------

        if (file.getSize() > MAX_AVATAR_SIZE) {

            throw new IllegalArgumentException(
                    "Avatar image must not exceed 5 MB."
            );
        }


        // -----------------------------------------------------
        // Content Type
        // -----------------------------------------------------

        String contentType =
                file.getContentType();

        if (!isAllowedImageType(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            );
        }


        try {

            byte[] imageBytes =
                    file.getBytes();

            Authentication authentication =
                    getAuthentication();

            String email =
                    normalizeEmail(
                            authentication.getName()
                    );

            String role =
                    getRole(authentication);


            // -------------------------------------------------
            // Customer Avatar
            // -------------------------------------------------

            if ("CUSTOMER".equals(role)) {

                Customer customer =
                        customerRepository
                                .findByEmail(email)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Customer account not found"
                                        )
                                );

                customer.setAvatar(
                        imageBytes
                );

                customer.setAvatarContentType(
                        contentType
                );

                customerRepository.save(
                        customer
                );

            }

            // -------------------------------------------------
            // Employee / Admin Avatar
            // -------------------------------------------------

            else {

                Employee employee =
                        employeeRepository
                                .findByEmail(email)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Employee account not found"
                                        )
                                );

                employee.setAvatar(
                        imageBytes
                );

                employee.setAvatarContentType(
                        contentType
                );

                employeeRepository.save(
                        employee
                );
            }


            return new AvatarResponse(
                    true,
                    "/account/me/avatar"
            );

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to read the uploaded image.",
                    ex
            );
        }
    }


    // =========================================================
    // Delete Avatar
    // =========================================================

    /**
     * Remove the current account avatar.
     */
    public void deleteAvatar() {

        Authentication authentication =
                getAuthentication();

        String email =
                normalizeEmail(
                        authentication.getName()
                );

        String role =
                getRole(authentication);


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer account not found"
                                    )
                            );

            customer.setAvatar(null);
            customer.setAvatarContentType(null);

            customerRepository.save(customer);

            return;
        }


        // -----------------------------------------------------
        // Employee / Admin
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        employee.setAvatar(null);
        employee.setAvatarContentType(null);

        employeeRepository.save(employee);
    }


    // =========================================================
    // Get Avatar
    // =========================================================

    /**
     * Return the current account avatar.
     */
    public AvatarData getAvatar() {

        Authentication authentication =
                getAuthentication();

        String email =
                normalizeEmail(
                        authentication.getName()
                );

        String role =
                getRole(authentication);


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if ("CUSTOMER".equals(role)) {

            Customer customer =
                    customerRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Customer account not found"
                                    )
                            );

            return new AvatarData(
                    customer.getAvatar(),
                    customer.getAvatarContentType()
            );
        }


        // -----------------------------------------------------
        // Employee / Admin
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee account not found"
                                )
                        );

        return new AvatarData(
                employee.getAvatar(),
                employee.getAvatarContentType()
        );
    }


    // =========================================================
    // Password Helpers
    // =========================================================

    private void changeCustomerPassword(
            Customer customer,
            ChangePasswordRequest request
    ) {

        validateCurrentPassword(
                request.getCurrentPassword(),
                customer.getPassword()
        );

        validateNewPassword(
                request.getNewPassword(),
                customer.getPassword()
        );

        customer.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        customerRepository.save(customer);
    }


    private void changeEmployeePassword(
            Employee employee,
            ChangePasswordRequest request
    ) {

        validateCurrentPassword(
                request.getCurrentPassword(),
                employee.getPassword()
        );

        validateNewPassword(
                request.getNewPassword(),
                employee.getPassword()
        );

        employee.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        employeeRepository.save(employee);
    }


    private void validateCurrentPassword(
            String currentPassword,
            String storedPassword
    ) {

        if (currentPassword == null
                || currentPassword.isBlank()
                || !passwordEncoder.matches(
                currentPassword,
                storedPassword
        )) {

            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }
    }


    private void validateNewPassword(
            String newPassword,
            String storedPassword
    ) {

        if (newPassword == null
                || newPassword.isBlank()) {

            throw new IllegalArgumentException(
                    "New password is required."
            );
        }

        if (newPassword.length() < 6) {

            throw new IllegalArgumentException(
                    "New password must be at least 6 characters."
            );
        }

        if (passwordEncoder.matches(
                newPassword,
                storedPassword
        )) {

            throw new IllegalArgumentException(
                    "New password must be different from the current password."
            );
        }
    }


    // =========================================================
    // Email Helpers
    // =========================================================

    private boolean emailExists(
            String email
    ) {

        return customerRepository
                .findByEmail(email)
                .isPresent()
                ||
                employeeRepository
                        .findByEmail(email)
                        .isPresent();
    }


    private String normalizeEmail(
            String email
    ) {

        if (email == null) {
            return "";
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }


    // =========================================================
    // Authentication Helpers
    // =========================================================

    private Authentication getAuthentication() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated user not found"
            );
        }

        return authentication;
    }


    private String getRole(
            Authentication authentication
    ) {

        return authentication
                .getAuthorities()
                .stream()
                .map(authority ->
                        authority.getAuthority()
                )
                .filter(authority ->
                        authority.startsWith("ROLE_")
                )
                .map(authority ->
                        authority.substring(
                                "ROLE_".length()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "User role not found"
                        )
                );
    }


    // =========================================================
    // Response Mapping
    // =========================================================

    private AccountResponse toCustomerResponse(
            Customer customer
    ) {

        return new AccountResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                "CUSTOMER",
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getGender(),
                customer.getAge(),
                null,
                null,
                customer.getAvatar() != null
        );
    }


    private AccountResponse toEmployeeResponse(
            Employee employee,
            String role
    ) {

        return new AccountResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                role,
                null,
                null,
                employee.getGender(),
                employee.getAge(),
                employee.getRole(),
                employee.getSalary(),
                employee.getAvatar() != null
        );
    }


    // =========================================================
    // Image Validation
    // =========================================================

    private boolean isAllowedImageType(
            String contentType
    ) {

        if (contentType == null) {
            return false;
        }

        return contentType.equalsIgnoreCase(
                "image/jpeg"
        )
                || contentType.equalsIgnoreCase(
                "image/png"
        )
                || contentType.equalsIgnoreCase(
                "image/webp"
        );
    }


    // =========================================================
    // Avatar Data
    // =========================================================

    public static class AvatarData {

        private final byte[] data;
        private final String contentType;


        public AvatarData(
                byte[] data,
                String contentType
        ) {

            this.data = data;
            this.contentType = contentType;
        }


        public byte[] getData() {
            return data;
        }


        public String getContentType() {
            return contentType;
        }


        public boolean hasImage() {

            return data != null
                    && data.length > 0
                    && contentType != null
                    && !contentType.isBlank();
        }
    }
}