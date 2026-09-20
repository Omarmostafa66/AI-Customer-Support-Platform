package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.ai.AiAnalysisResponse;
import com.aicustomersupport.aicustomersupportbackend.ai.AiSupportService;
import com.aicustomersupport.aicustomersupportbackend.entity.Category;
import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.repository.CategoryRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final CategoryRepository categoryRepository;
    private final AiSupportService aiSupportService;

    public TicketService(
            TicketRepository ticketRepository,
            CustomerRepository customerRepository,
            CategoryRepository categoryRepository,
            AiSupportService aiSupportService
    ) {
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.categoryRepository = categoryRepository;
        this.aiSupportService = aiSupportService;
    }

    // Get All Tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Get Tickets By Customer ID
    public List<Ticket> getTicketsByCustomerId(Long customerId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        boolean isAdminOrEmployee =
                authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_ADMIN")
                                        || authority.getAuthority().equals("ROLE_EMPLOYEE"));

        // Admin and Employee can access any customer's tickets
        if (isAdminOrEmployee) {
            return ticketRepository.findByCustomerId(customerId);
        }

        // Customer can access only their own tickets
        String currentUserEmail = authentication.getName();

        Customer currentCustomer =
                customerRepository.findByEmail(currentUserEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (!currentCustomer.getId().equals(customerId)) {
            throw new RuntimeException(
                    "You are not allowed to access these tickets"
            );
        }

        return ticketRepository.findByCustomerId(customerId);
    }

    // Get Ticket By ID
    public Optional<Ticket> getTicketById(Long id) {

        Optional<Ticket> ticketOptional =
                ticketRepository.findById(id);

        if (ticketOptional.isEmpty()) {
            return Optional.empty();
        }

        Ticket ticket = ticketOptional.get();

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        boolean isAdminOrEmployee =
                authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_ADMIN")
                                        || authority.getAuthority().equals("ROLE_EMPLOYEE"));

        // Admin and Employee can access any ticket
        if (isAdminOrEmployee) {
            return Optional.of(ticket);
        }

        // Customer can access only their own ticket
        String currentUserEmail = authentication.getName();

        Customer currentCustomer =
                customerRepository.findByEmail(currentUserEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (ticket.getCustomer() == null
                || !ticket.getCustomer().getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this ticket"
            );
        }

        return Optional.of(ticket);
    }

    // Create Ticket - CUSTOMER
    public Ticket createTicket(Ticket ticket) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String currentUserEmail = authentication.getName();

        Customer currentCustomer =
                customerRepository.findByEmail(currentUserEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        // Always associate the ticket with the authenticated customer.
        // Never trust a customer ID coming from the frontend.
        ticket.setCustomer(currentCustomer);

        return ticketRepository.save(ticket);
    }

    // Create Ticket for Customer - ADMIN / EMPLOYEE
    public Ticket createTicketForCustomer(
            Long customerId,
            Ticket ticket
    ) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        ticket.setCustomer(customer);

        return ticketRepository.save(ticket);
    }

    // Create Ticket for Customer and Category - ADMIN / EMPLOYEE
    public Ticket createTicketForCustomerAndCategory(
            Long customerId,
            Long categoryId,
            Ticket ticket
    ) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        Category category =
                categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        ticket.setCustomer(customer);
        ticket.setCategory(category);

        return ticketRepository.save(ticket);
    }

    // AI Analysis
    public AiAnalysisResponse analyzeTicket(Long id) {

        Ticket ticket =
                ticketRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        return aiSupportService.analyzeTicket(
                ticket.getTitle(),
                ticket.getDescription()
        );
    }

    // Update Ticket
    public Ticket updateTicket(
            Long id,
            Ticket ticketDetails
    ) {

        Ticket ticket =
                ticketRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        ticket.setTitle(ticketDetails.getTitle());
        ticket.setDescription(ticketDetails.getDescription());
        ticket.setStatus(ticketDetails.getStatus());
        ticket.setPriority(ticketDetails.getPriority());

        return ticketRepository.save(ticket);
    }

    // Delete Ticket
    public void deleteTicket(Long id) {

        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException(
                    "Ticket not found"
            );
        }

        ticketRepository.deleteById(id);
    }
}