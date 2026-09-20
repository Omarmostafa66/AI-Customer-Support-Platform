package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.MessageRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepository,
            TicketRepository ticketRepository,
            MessageRepository messageRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Create Customer
    // This operation is protected by CustomerController.
    public Customer addCustomer(Customer customer) {

        if (customer.getPassword() != null
                && !customer.getPassword().isBlank()) {

            customer.setPassword(
                    passwordEncoder.encode(customer.getPassword())
            );
        }

        return customerRepository.save(customer);
    }

    // Get All Customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Get Customer By ID
    public Optional<Customer> getCustomerById(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (isAdminOrEmployee(authentication)) {
            return customerRepository.findById(id);
        }

        Customer currentCustomer =
                getCurrentCustomer(authentication);

        if (!currentCustomer.getId().equals(id)) {
            throw new RuntimeException(
                    "You are not allowed to access this customer"
            );
        }

        return Optional.of(currentCustomer);
    }

    // Update Customer
    public Optional<Customer> updateCustomer(
            Long id,
            Customer customerDetails
    ) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        Customer existingCustomer =
                customerRepository.findById(id)
                        .orElse(null);

        if (existingCustomer == null) {
            return Optional.empty();
        }

        // Only ADMIN can update any customer.
        // CUSTOMER can update only their own account.
        if (!isAdmin(authentication)) {

            Customer currentCustomer =
                    getCurrentCustomer(authentication);

            if (!currentCustomer.getId().equals(id)) {
                throw new RuntimeException(
                        "You are not allowed to update this customer"
                );
            }
        }

        existingCustomer.setName(
                customerDetails.getName()
        );

        existingCustomer.setEmail(
                customerDetails.getEmail()
        );

        existingCustomer.setPhoneNumber(
                customerDetails.getPhoneNumber()
        );

        existingCustomer.setAddress(
                customerDetails.getAddress()
        );

        existingCustomer.setGender(
                customerDetails.getGender()
        );

        existingCustomer.setAge(
                customerDetails.getAge()
        );

        // Update password only when a new password is provided.
        if (customerDetails.getPassword() != null
                && !customerDetails.getPassword().isBlank()) {

            existingCustomer.setPassword(
                    passwordEncoder.encode(
                            customerDetails.getPassword()
                    )
            );
        }

        return Optional.of(
                customerRepository.save(existingCustomer)
        );
    }

    // Delete Customer
    // ADMIN only.
    //
    // A customer cannot be deleted while they still have
    // tickets or messages.
    //
    // This protects the support history and prevents
    // foreign-key violations.
    public DeleteCustomerResult deleteCustomer(Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Only ADMIN can delete customers.
        if (!isAdmin(authentication)) {
            throw new RuntimeException(
                    "Only administrators can delete customers"
            );
        }

        Customer customer =
                customerRepository.findById(id)
                        .orElse(null);

        if (customer == null) {
            return DeleteCustomerResult.NOT_FOUND;
        }

        // Do not delete a customer who still owns tickets.
        if (ticketRepository.findByCustomerId(id).stream().findAny().isPresent()) {
            return DeleteCustomerResult.HAS_RELATED_DATA;
        }

        // Do not delete a customer who still has messages.
        if (messageRepository.existsByCustomerId(id)) {
            return DeleteCustomerResult.HAS_RELATED_DATA;
        }

        customerRepository.delete(customer);

        return DeleteCustomerResult.DELETED;
    }

    private Customer getCurrentCustomer(
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "Authenticated user not found"
            );
        }

        return customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );
    }

    private boolean isAdmin(
            Authentication authentication
    ) {

        return authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_ADMIN")
                );
    }

    private boolean isAdminOrEmployee(
            Authentication authentication
    ) {

        return authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> {

                    String authorityName =
                            authority.getAuthority();

                    return authorityName.equals("ROLE_ADMIN")
                            || authorityName.equals("ROLE_EMPLOYEE");
                });
    }

    public enum DeleteCustomerResult {
        DELETED,
        NOT_FOUND,
        HAS_RELATED_DATA
    }
}