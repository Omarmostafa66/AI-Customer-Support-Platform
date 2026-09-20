package com.aicustomersupport.aicustomersupportbackend.controller;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Create Customer - ADMIN only
    // Normal customer registration is handled by /auth/register
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Customer addCustomer(
            @Valid @RequestBody Customer customer
    ) {
        return customerService.addCustomer(customer);
    }

    // Get All Customers - ADMIN and EMPLOYEE
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // Get Customer By ID
    // ADMIN and EMPLOYEE can access any customer.
    // CUSTOMER can access only their own account.
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id
    ) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update Customer
    // ADMIN can update any customer.
    // CUSTOMER can update only their own account.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customer
    ) {
        return customerService.updateCustomer(id, customer)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete Customer - ADMIN only
    //
    // Customer with existing tickets or messages cannot be deleted.
    // Returns:
    // 204 NO_CONTENT -> deleted successfully
    // 404 NOT_FOUND  -> customer does not exist
    // 409 CONFLICT   -> customer still has related data
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCustomer(
            @PathVariable Long id
    ) {

        CustomerService.DeleteCustomerResult result =
                customerService.deleteCustomer(id);

        return switch (result) {

            case DELETED ->
                    ResponseEntity.noContent().build();

            case NOT_FOUND ->
                    ResponseEntity.notFound().build();

            case HAS_RELATED_DATA ->
                    ResponseEntity
                            .status(HttpStatus.CONFLICT)
                            .body(
                                    "Customer cannot be deleted because they still have tickets or messages."
                            );
        };
    }
}