package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.ai.AiAnalysisResponse;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatMessage;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatResponse;
import com.aicustomersupport.aicustomersupportbackend.ai.AiResolutionResponse;
import com.aicustomersupport.aicustomersupportbackend.ai.AiSupportService;

import com.aicustomersupport.aicustomersupportbackend.entity.AiConversation;
import com.aicustomersupport.aicustomersupportbackend.entity.AiTicketAnalysis;
import com.aicustomersupport.aicustomersupportbackend.entity.Category;
import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Employee;
import com.aicustomersupport.aicustomersupportbackend.entity.Incident;
import com.aicustomersupport.aicustomersupportbackend.entity.Message;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;

import com.aicustomersupport.aicustomersupportbackend.enums.TicketPriority;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;

import com.aicustomersupport.aicustomersupportbackend.repository.AiTicketAnalysisRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.CategoryRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.EmployeeRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.IncidentRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final CategoryRepository categoryRepository;
    private final EmployeeRepository employeeRepository;
    private final IncidentRepository incidentRepository;
    private final AiSupportService aiSupportService;
    private final AiTicketAnalysisRepository aiTicketAnalysisRepository;
    private final SlaService slaService;
    private final MessageService messageService;
    private final com.aicustomersupport.aicustomersupportbackend.repository.AiConversationMessageRepository aiConversationMessageRepository;
    private final NotificationService notificationService;
    private final com.aicustomersupport.aicustomersupportbackend.service.AuditLogService auditLogService;

    public TicketService(
            TicketRepository ticketRepository,
            CustomerRepository customerRepository,
            CategoryRepository categoryRepository,
            EmployeeRepository employeeRepository,
            IncidentRepository incidentRepository,
            AiSupportService aiSupportService,
            AiTicketAnalysisRepository aiTicketAnalysisRepository,
            SlaService slaService,
            MessageService messageService,
            com.aicustomersupport.aicustomersupportbackend.repository.AiConversationMessageRepository aiConversationMessageRepository,
            NotificationService notificationService,
            com.aicustomersupport.aicustomersupportbackend.service.AuditLogService auditLogService
    ) {
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.categoryRepository = categoryRepository;
        this.employeeRepository = employeeRepository;
        this.incidentRepository = incidentRepository;
        this.aiSupportService = aiSupportService;
        this.aiTicketAnalysisRepository = aiTicketAnalysisRepository;
        this.slaService = slaService;
        this.messageService = messageService;
        this.aiConversationMessageRepository = aiConversationMessageRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }


    // =========================================================
    // Get All Tickets
    // =========================================================

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::backfillSla)
                .map(this::applySlaStatus)
                .toList();
    }


    // =========================================================
    // Get Tickets By Customer ID
    // =========================================================

    public List<Ticket> getTicketsByCustomerId(Long customerId) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        boolean isAdminOrEmployee =
                authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_ADMIN")
                                        || authority.getAuthority().equals("ROLE_EMPLOYEE")
                        );

        if (isAdminOrEmployee) {
            return ticketRepository.findByCustomerId(customerId)
                    .stream()
                    .map(this::backfillSla)
                    .map(this::applySlaStatus)
                    .toList();
        }

        String currentUserEmail =
                authentication.getName();

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

        return ticketRepository.findByCustomerId(customerId)
                .stream()
                .map(this::backfillSla)
                .map(this::applySlaStatus)
                .toList();
    }


    // =========================================================
    // Get Ticket By ID
    // =========================================================

    public Optional<Ticket> getTicketById(Long id) {

        Optional<Ticket> ticketOptional =
                ticketRepository.findById(id);

        if (ticketOptional.isEmpty()) {
            return Optional.empty();
        }

        Ticket ticket =
                ticketOptional.get();

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        boolean isAdminOrEmployee =
                authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_ADMIN")
                                        || authority.getAuthority().equals("ROLE_EMPLOYEE")
                        );

        if (isAdminOrEmployee) {
            return Optional.of(
                    applySlaStatus(ticket)
            );
        }

        String currentUserEmail =
                authentication.getName();

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

        return Optional.of(
                applySlaStatus(ticket)
        );
    }


    // =========================================================
    // Create Ticket - CUSTOMER
    // =========================================================

    public Ticket createTicket(Ticket ticket) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String currentUserEmail =
                authentication.getName();

        Customer currentCustomer =
                customerRepository.findByEmail(currentUserEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        ticket.setCustomer(currentCustomer);

        Ticket savedTicket = applySla(ticket);
        try {
            auditLogService.log("CREATE_TICKET", "TICKET", String.valueOf(savedTicket.getId()), "Ticket created");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // Create Ticket for Customer - ADMIN / EMPLOYEE
    // =========================================================

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

        Ticket savedTicket = applySla(ticket);
        try {
            auditLogService.log("CREATE_TICKET", "TICKET", String.valueOf(savedTicket.getId()), "Ticket created");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // Create Ticket for Customer and Category
    // =========================================================

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

        Ticket savedTicket = applySla(ticket);
        try {
            auditLogService.log("CREATE_TICKET", "TICKET", String.valueOf(savedTicket.getId()), "Ticket created");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // AI Analysis
    // =========================================================

    public AiAnalysisResponse analyzeTicket(Long id) {

        Ticket ticket =
                getTicketById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        System.out.println("========================================");
        System.out.println("AI TICKET ANALYSIS");
        System.out.println("Ticket ID: " + id);
        System.out.println("Generating new AI analysis...");
        System.out.println("========================================");

        List<com.aicustomersupport.aicustomersupportbackend.entity.Message> ticketMessages =
                messageService.getMessagesForResolutionAssessment(ticket.getId());
        List<com.aicustomersupport.aicustomersupportbackend.ai.AiChatMessage> conversation = new java.util.ArrayList<>();
        if (ticketMessages != null) {
            for (com.aicustomersupport.aicustomersupportbackend.entity.Message m : ticketMessages) {
                String sender = m.getSenderType() == com.aicustomersupport.aicustomersupportbackend.entity.Message.SenderType.CUSTOMER ? "CUSTOMER" : "EMPLOYEE";
                conversation.add(new com.aicustomersupport.aicustomersupportbackend.ai.AiChatMessage(sender, m.getTxt()));
            }
        }

        AiAnalysisResponse analysis =
                aiSupportService.analyzeTicket(
                        ticket.getTitle(),
                        ticket.getDescription(),
                        conversation
                );

        if (analysis == null) {
            throw new IllegalStateException(
                    "AI analysis returned an empty response."
            );
        }

        saveAiTicketAnalysis(
                ticket,
                analysis
        );

        System.out.println("========================================");
        System.out.println("AI TICKET ANALYSIS SAVED");
        System.out.println("Ticket ID: " + id);
        System.out.println("========================================");

        return analysis;
    }


    // =========================================================
    // Assess Ticket Resolution
    // =========================================================

    public AiResolutionResponse assessTicketResolution(Long ticketId) {

        Ticket ticket =
                getTicketById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        List<Message> messages =
                messageService.getMessagesForResolutionAssessment(ticketId);

        List<AiChatMessage> conversation =
                new ArrayList<>();

        for (Message message : messages) {

            String sender =
                    message.getSenderType() != null
                            ? message.getSenderType().name()
                            : "UNKNOWN";

            String text =
                    message.getTxt() != null
                            ? message.getTxt()
                            : "";

            conversation.add(
                    new AiChatMessage(
                            sender,
                            text
                    )
            );
        }

        return aiSupportService.assessResolution(
                ticket.getTitle(),
                ticket.getDescription(),
                conversation
        );
    }


    // =========================================================
    // Get Saved AI Analysis
    // =========================================================

    public Optional<AiAnalysisResponse> getSavedAiAnalysis(
            Long ticketId
    ) {

        return aiTicketAnalysisRepository
                .findByTicketId(ticketId)
                .map(this::toAiAnalysisResponse);
    }


    // =========================================================
    // Save AI Ticket Analysis
    // =========================================================

    private AiTicketAnalysis saveAiTicketAnalysis(
            Ticket ticket,
            AiAnalysisResponse analysis
    ) {

        AiTicketAnalysis savedAnalysis =
                aiTicketAnalysisRepository
                        .findByTicketId(ticket.getId())
                        .orElseGet(
                                AiTicketAnalysis::new
                        );

        savedAnalysis.setTicket(ticket);

        savedAnalysis.setSummary(
                analysis.getSummary()
        );

        savedAnalysis.setCategory(
                safeAnalysisValue(
                        analysis.getCategory(),
                        "General Support"
                )
        );

        savedAnalysis.setSuggestedPriority(
                safeAnalysisValue(
                        analysis.getSuggestedPriority(),
                        "MEDIUM"
                )
        );

        savedAnalysis.setSuggestedResponse(
                analysis.getSuggestedResponse()
        );

        savedAnalysis.setRecommendedAction(
                analysis.getRecommendedAction()
        );

        savedAnalysis.setSentiment(
                safeAnalysisValue(
                        analysis.getSentiment(),
                        "NEUTRAL"
                )
        );

        savedAnalysis.setConfidence(
                Math.max(
                        0.0,
                        Math.min(
                                1.0,
                                analysis.getConfidence()
                        )
                )
        );

        savedAnalysis.setRisk(
                safeAnalysisValue(
                        analysis.getRisk(),
                        "LOW"
                )
        );

        savedAnalysis.setCanAnswer(
                analysis.isCanAnswer()
        );

        savedAnalysis.setCanResolve(
                analysis.isCanResolve()
        );

        savedAnalysis.setEscalate(
                analysis.isEscalate()
        );

        savedAnalysis.setAnalyzedAt(
                LocalDateTime.now()
        );

        return aiTicketAnalysisRepository.save(
                savedAnalysis
        );
    }


    // =========================================================
    // Convert Entity To AI Analysis Response
    // =========================================================

    private AiAnalysisResponse toAiAnalysisResponse(
            AiTicketAnalysis analysis
    ) {

        return new AiAnalysisResponse(
                analysis.getSummary(),
                analysis.getCategory(),
                analysis.getSuggestedPriority(),
                analysis.getSuggestedResponse(),
                analysis.getSentiment(),
                analysis.getConfidence(),
                analysis.getRisk(),
                analysis.isCanAnswer(),
                analysis.isCanResolve(),
                analysis.isEscalate(),
                analysis.getRecommendedAction()
        );
    }


    // =========================================================
    // Safe AI Analysis Value
    // =========================================================

    private String safeAnalysisValue(
            String value,
            String fallback
    ) {

        if (value == null || value.isBlank()) {
            return fallback;
        }

        return value.trim();
    }


    // =========================================================
    // AI Automatic Escalation
    // =========================================================

    public Ticket createTicketFromAiEscalation(
            AiConversation conversation,
            String customerMessage,
            AiChatResponse aiResponse
    ) {

        if (aiResponse == null) {
            throw new IllegalArgumentException(
                    "AI response cannot be null"
            );
        }

        if (!aiResponse.isEscalate()) {
            return null;
        }

        if (conversation == null) {
            throw new IllegalArgumentException(
                    "AI conversation cannot be null"
            );
        }

        if (customerMessage == null ||
                customerMessage.isBlank()) {

            throw new IllegalArgumentException(
                    "Customer message cannot be empty"
            );
        }

        // -----------------------------------------------------
        // Get authenticated customer
        // -----------------------------------------------------

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated customer not found"
            );
        }

        String currentUserEmail =
                authentication.getName();

        Customer currentCustomer =
                customerRepository.findByEmail(currentUserEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        // -----------------------------------------------------
        // Validate that the AI conversation belongs
        // to the authenticated customer
        // -----------------------------------------------------

        if (conversation.getCustomer() == null ||
                conversation.getCustomer().getId() == null ||
                !conversation.getCustomer()
                        .getId()
                        .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to use this AI conversation"
            );
        }

        // -----------------------------------------------------
        // Prevent duplicate tickets for the same
        // AI conversation
        // -----------------------------------------------------

        List<TicketStatus> activeStatuses =
                List.of(
                        TicketStatus.OPEN,
                        TicketStatus.IN_PROGRESS
                );

        Optional<Ticket> existingTicket =
                ticketRepository
                        .findFirstByAiConversationIdAndStatusInOrderByCreatedAtDesc(
                                conversation.getId(),
                                activeStatuses
                        );

        if (existingTicket.isPresent()) {

            Ticket existing = existingTicket.get();

            syncAiConversationCustomerMessages(
                    existing,
                    conversation,
                    customerMessage
            );

            return existing;
        }

        // -----------------------------------------------------
        // Create new ticket
        // -----------------------------------------------------

        Ticket ticket =
                new Ticket();

        ticket.setCustomer(currentCustomer);

        ticket.setAiConversation(conversation);

        ticket.setTitle(
                buildAiTicketTitle(aiResponse)
        );

        ticket.setDescription(
                customerMessage.trim()
        );

        ticket.setStatus(
                TicketStatus.OPEN
        );

        ticket.setPriority(
                mapAiPriority(
                        aiResponse.getSuggestedPriority()
                )
        );

        // -----------------------------------------------------
        // Find AI-selected category
        // -----------------------------------------------------

        Category category =
                findCategory(
                        aiResponse.getCategory()
                );

        if (category != null) {
            ticket.setCategory(category);
        }

        Ticket savedTicket = applySla(ticket);

        syncAiConversationCustomerMessages(
                savedTicket,
                conversation,
                customerMessage
        );

        try {
            auditLogService.log("CREATE_TICKET", "TICKET", String.valueOf(savedTicket.getId()), "Ticket created");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // Sync AI Conversation Customer Messages To Ticket
    // =========================================================

    private void syncAiConversationCustomerMessages(
            Ticket ticket,
            AiConversation conversation,
            String currentCustomerMessage
    ) {

        if (ticket == null || conversation == null) {
            return;
        }

        List<Message> existingTicketMessages =
                messageService.getMessagesForResolutionAssessment(
                        ticket.getId()
                );

        List<String> existingCustomerMessages =
                new ArrayList<>(
                        existingTicketMessages
                                .stream()
                                .filter(message ->
                                        message.getSenderType() == Message.SenderType.CUSTOMER
                                )
                                .map(Message::getTxt)
                                .filter(text -> text != null && !text.isBlank())
                                .map(String::trim)
                                .toList()
                );

        List<com.aicustomersupport.aicustomersupportbackend.entity.AiConversationMessage> aiMessages =
                aiConversationMessageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        for (com.aicustomersupport.aicustomersupportbackend.entity.AiConversationMessage aiMessage : aiMessages) {

            if (aiMessage.getSenderType()
                    != com.aicustomersupport.aicustomersupportbackend.entity.AiConversationMessage.SenderType.CUSTOMER) {
                continue;
            }

            String text = aiMessage.getText();

            if (text == null || text.isBlank()) {
                continue;
            }

            String normalizedText = text.trim();

            if (existingCustomerMessages.contains(normalizedText)) {
                continue;
            }

            messageService.createMessageForTicket(
                    ticket.getId(),
                    normalizedText
            );

            existingCustomerMessages.add(normalizedText);
        }

        if (currentCustomerMessage != null
                && !currentCustomerMessage.isBlank()) {

            String normalizedCurrentMessage =
                    currentCustomerMessage.trim();

            if (!existingCustomerMessages.contains(normalizedCurrentMessage)) {
                messageService.createMessageForTicket(
                        ticket.getId(),
                        normalizedCurrentMessage
                );
            }
        }
    }


    // =========================================================
    // Build AI Ticket Title
    // =========================================================

    private String buildAiTicketTitle(
            AiChatResponse aiResponse
    ) {

        String category =
                aiResponse.getCategory();

        if (category == null ||
                category.isBlank()) {

            return "AI Escalated Support Request";
        }

        return "AI Escalated - " + category.trim();
    }


    // =========================================================
    // Map AI Priority
    // =========================================================

    private TicketPriority mapAiPriority(
            String priority
    ) {

        if (priority == null ||
                priority.isBlank()) {

            return TicketPriority.MEDIUM;
        }

        try {

            return TicketPriority.valueOf(
                    priority.trim()
                            .toUpperCase(Locale.ROOT)
            );

        } catch (IllegalArgumentException exception) {

            return TicketPriority.MEDIUM;
        }
    }


    // =========================================================
    // Find Category
    // =========================================================

    private Category findCategory(
            String categoryName
    ) {

        if (categoryName == null ||
                categoryName.isBlank()) {

            return null;
        }

        String normalizedName =
                categoryName.trim();

        return categoryRepository.findAll()
                .stream()
                .filter(category ->
                        category.getName() != null &&
                                category.getName()
                                        .equalsIgnoreCase(
                                                normalizedName
                                        )
                )
                .findFirst()
                .orElse(null);
    }


    // =========================================================
    // Assign Ticket To Employee
    // =========================================================

    public Ticket assignTicket(
            Long ticketId,
            Long employeeId
    ) {

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        ticket.setEmployee(employee);

        Ticket savedTicket =
                ticketRepository.save(ticket);

        if (savedTicket.getCustomer() != null) {

            notificationService.createNotification(
                    savedTicket.getCustomer(),
                    savedTicket,
                    "Ticket Assigned",
                    "Your ticket #" + savedTicket.getId()
                            + " has been assigned to a support employee."
            );
        }

        return savedTicket;
    }


    // =========================================================
    // Link Ticket To Incident
    // =========================================================

    public Ticket linkTicketToIncident(
            Long ticketId,
            Long incidentId
    ) {

        Ticket ticket =
                ticketRepository.findById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        Incident incident =
                incidentRepository.findById(incidentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Incident not found"
                                )
                        );

        ticket.setIncident(incident);

        Ticket savedTicket = ticketRepository.save(ticket);
        try {
            auditLogService.log("LINK_INCIDENT", "TICKET", String.valueOf(savedTicket.getId()), "Linked to Incident");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // Get Tickets Assigned To Employee
    // =========================================================

    public List<Ticket> getTicketsAssignedToEmployee(
            Long employeeId
    ) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new RuntimeException(
                    "Employee not found"
            );
        }

        return ticketRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::backfillSla)
                .map(this::applySlaStatus)
                .toList();
    }


    // =========================================================
    // Update Ticket
    // =========================================================

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

        ticket.setTitle(
                ticketDetails.getTitle()
        );

        ticket.setDescription(
                ticketDetails.getDescription()
        );

        ticket.setStatus(
                ticketDetails.getStatus()
        );

        ticket.setPriority(
                ticketDetails.getPriority()
        );

        Ticket savedTicket = ticketRepository.save(ticket);
        try {
            auditLogService.log("UPDATE_TICKET", "TICKET", String.valueOf(savedTicket.getId()), "Ticket updated");
        } catch(Exception e) {}
        return savedTicket;
    }


    // =========================================================
    // Update Ticket Status
    // =========================================================

    public Ticket updateTicketStatus(
            Long id,
            TicketStatus newStatus,
            String resolutionNote
    ) {

        Ticket ticket =
                getTicketById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        TicketStatus currentStatus =
                ticket.getStatus();

        if (currentStatus == null) {
            throw new IllegalStateException(
                    "Ticket has no current status"
            );
        }

        if (newStatus == null) {
            throw new IllegalStateException(
                    "New status is required"
            );
        }

        if (!isValidStatusTransition(
                currentStatus,
                newStatus
        )) {
            throw new IllegalStateException(
                    "Invalid ticket status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        /*
         * Resolution is required when
         * moving IN_PROGRESS -> RESOLVED.
         */
        if (newStatus == TicketStatus.RESOLVED) {

            if (resolutionNote == null
                    || resolutionNote.trim().isEmpty()) {

                throw new IllegalStateException(
                        "Resolution note is required before resolving the ticket"
                );
            }

            ticket.setResolutionNote(
                    resolutionNote.trim()
            );
        }

        if (newStatus == TicketStatus.RESOLVED
                && ticket.getResolvedAt() == null) {

            ticket.setResolvedAt(LocalDateTime.now());
        }

        /*
         * A ticket cannot be closed
         * without a saved resolution.
         */
        if (newStatus == TicketStatus.CLOSED) {

            if (ticket.getResolutionNote() == null
                    || ticket.getResolutionNote().trim().isEmpty()) {

                throw new IllegalStateException(
                        "A resolution note is required before closing the ticket"
                );
            }
        }

        /*
         * Reopening a ticket keeps the
         * previous resolution history.
         */
        ticket.setStatus(newStatus);

        Ticket savedTicket =
                ticketRepository.save(ticket);

        if (savedTicket.getCustomer() != null) {

            notificationService.createNotification(
                    savedTicket.getCustomer(),
                    savedTicket,
                    "Ticket Status Updated",
                    "Your ticket #" + savedTicket.getId()
                            + " status has been changed to "
                            + savedTicket.getStatus().name()
                            + "."
            );
        }

        return savedTicket;
    }


    // =========================================================
    // Customer Resolution Confirmation
    // =========================================================

    public Ticket confirmCustomerResolution(
            Long ticketId
    ) {

        Ticket ticket =
                getTicketById(ticketId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ticket not found"
                                )
                        );

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated customer not found"
            );
        }

        Customer currentCustomer =
                customerRepository.findByEmail(
                                authentication.getName()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (ticket.getCustomer() == null
                || !ticket.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to confirm this ticket"
            );
        }

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {

            throw new IllegalStateException(
                    "Only an in-progress ticket can be confirmed as resolved"
            );
        }

        String resolutionNote =
                "Customer confirmed that the issue has been resolved.";

        return updateTicketStatus(
                ticketId,
                TicketStatus.RESOLVED,
                resolutionNote
        );
    }


    // =========================================================
    // Status Transition Validation
    // =========================================================

    private boolean isValidStatusTransition(
            TicketStatus currentStatus,
            TicketStatus newStatus
    ) {

        return switch (currentStatus) {

            case OPEN ->
                    newStatus == TicketStatus.IN_PROGRESS;

            case IN_PROGRESS ->
                    newStatus == TicketStatus.RESOLVED;

            case RESOLVED ->
                    newStatus == TicketStatus.CLOSED;

            case CLOSED ->
                    newStatus == TicketStatus.OPEN;
        };
    }


    // =========================================================
    // Apply SLA Status
    // =========================================================

    private Ticket applySlaStatus(Ticket ticket) {

        if (ticket != null) {
            ticket.setSlaStatus(
                    slaService.getSlaStatus(ticket)
            );
        }

        return ticket;
    }


    // =========================================================
    // Backfill Missing SLA
    // =========================================================

    private Ticket backfillSla(Ticket ticket) {

        if (ticket == null) {
            return null;
        }

        if (ticket.getSlaDueAt() == null
                && ticket.getPriority() != null
                && ticket.getCreatedAt() != null) {

            ticket.setSlaDueAt(
                    slaService.calculateDueAt(
                            ticket.getPriority(),
                            ticket.getCreatedAt()
                    )
            );

            ticket = ticketRepository.save(ticket);
        }

        return ticket;
    }


    // =========================================================
    // Apply SLA
    // =========================================================

    private Ticket applySla(Ticket ticket) {

        Ticket savedTicket = ticketRepository.save(ticket);

        savedTicket.setSlaDueAt(
                slaService.calculateDueAt(
                        savedTicket.getPriority(),
                        savedTicket.getCreatedAt()
                )
        );

        Ticket finalTicket = ticketRepository.save(savedTicket);
        try {
            auditLogService.log("UPDATE_STATUS", "TICKET", String.valueOf(finalTicket.getId()), "Status changed to " + finalTicket.getStatus());
        } catch(Exception e) {}
        return finalTicket;
    }


    // =========================================================
    // Delete Ticket
    // =========================================================

    public void deleteTicket(Long id) {

        if (!ticketRepository.existsById(id)) {

            throw new RuntimeException(
                    "Ticket not found"
            );
        }

        ticketRepository.deleteById(id);
    }
}

