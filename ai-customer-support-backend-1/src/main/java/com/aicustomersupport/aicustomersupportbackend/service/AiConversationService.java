package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.ai.AiChatMessage;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatRequest;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatResponse;
import com.aicustomersupport.aicustomersupportbackend.ai.AiSupportService;
import com.aicustomersupport.aicustomersupportbackend.entity.AiConversation;
import com.aicustomersupport.aicustomersupportbackend.entity.AiConversationMessage;
import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;
import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;
import com.aicustomersupport.aicustomersupportbackend.repository.AiConversationMessageRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.AiConversationRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.TicketRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AiConversationService {

    private static final int MAX_CONTEXT_MESSAGES = 20;

    private final AiConversationRepository conversationRepository;
    private final AiConversationMessageRepository messageRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final AiSupportService aiSupportService;
    private final AiEscalationPolicyService escalationPolicyService;
    private final TicketService ticketService;
    private final com.aicustomersupport.aicustomersupportbackend.repository.AiInteractionLogRepository aiInteractionLogRepository;

    public AiConversationService(
            AiConversationRepository conversationRepository,
            AiConversationMessageRepository messageRepository,
            CustomerRepository customerRepository,
            TicketRepository ticketRepository,
            AiSupportService aiSupportService,
            AiEscalationPolicyService escalationPolicyService,
            TicketService ticketService,
            com.aicustomersupport.aicustomersupportbackend.repository.AiInteractionLogRepository aiInteractionLogRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
        this.aiSupportService = aiSupportService;
        this.escalationPolicyService = escalationPolicyService;
        this.ticketService = ticketService;
        this.aiInteractionLogRepository = aiInteractionLogRepository;
    }

    public AiChatResponse chat(AiChatRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "AI chat request cannot be null"
            );
        }

        String message = request.getMessage();

        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException(
                    "Customer message cannot be empty"
            );
        }

        Customer customer = getCurrentCustomer();

        AiConversation conversation =
                getOrCreateConversation(
                        request.getConversationId(),
                        customer
                );

        List<AiChatMessage> context =
                loadConversationContext(conversation);

        /*
         * Backward compatibility:
         * if the database conversation has no messages yet,
         * we can still use the old Angular-provided conversation.
         */
        if (context.isEmpty()
                && request.getConversation() != null
                && !request.getConversation().isEmpty()) {

            context =
                    sanitizeClientConversation(
                            request.getConversation()
                    );
        }

        // =========================================================
        // 1. Ask AI
        // =========================================================

        AiChatResponse response =
                aiSupportService.chat(
                        message,
                        context
                );

        if (response == null) {
            throw new IllegalStateException(
                    "AI support service returned an empty response."
            );
        }

        // =========================================================
        // 2. Server-side escalation policy
        // =========================================================

        AiEscalationPolicyService.Decision escalationDecision =
                escalationPolicyService.evaluate(
                        message,
                        response,
                        context
                );

        /*
         * IMPORTANT:
         * The final escalation decision comes from the backend
         * policy, not directly from Gemini.
         */
        response.setEscalate(
                escalationDecision.isEscalate()
        );

        if (response.isEscalate()) {
            try {

                /*
                 * Check whether this AI conversation already has
                 * an active support ticket.
                 *
                 * This allows us to distinguish between:
                 *
                 * 1. A newly created ticket
                 * 2. An already existing ticket that is being reused
                 */
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

                /*
                 * Create or reuse the ticket.
                 *
                 * TicketService itself is responsible for the
                 * duplicate-prevention logic.
                 */
                Ticket ticket =
                        ticketService.createTicketFromAiEscalation(
                                conversation,
                                message,
                                response
                        );

                if (ticket != null) {

                    /*
                     * Always return the ticket ID so the frontend
                     * knows which ticket is associated with this
                     * AI conversation.
                     */
                    response.setTicketId(
                            ticket.getId()
                    );

                    /*
                     * Only mark ticketCreated=true when there was
                     * no active ticket before this request.
                     *
                     * This prevents the frontend from showing:
                     *
                     * "Support ticket #3 has been created"
                     *
                     * again for every follow-up message.
                     */
                    response.setTicketCreated(
                            existingTicket.isEmpty()
                    );
                }

            } catch (Exception e) {

                System.err.println(
                        "Failed to auto-create ticket: "
                                + e.getMessage()
                );
            }
        }

        System.out.println(
                "========================================"
        );

        System.out.println(
                "AI ESCALATION POLICY"
        );

        System.out.println(
                "Decision: "
                        + escalationDecision.isEscalate()
        );

        System.out.println(
                "Reason: "
                        + escalationDecision.getReason()
        );

        System.out.println(
                "AI requested escalation: "
                        + response.isEscalate()
        );

        System.out.println(
                "Risk: "
                        + response.getRisk()
        );

        System.out.println(
                "Confidence: "
                        + response.getConfidence()
        );

        System.out.println(
                "========================================"
        );

        // =========================================================
        // 3. Save customer message
        // =========================================================

        saveMessage(
                conversation,
                AiConversationMessage.SenderType.CUSTOMER,
                message
        );

        // =========================================================
        // 4. Save AI response
        // =========================================================

        if (response.getMessage() != null
                && !response.getMessage().isBlank()) {

            saveMessage(
                    conversation,
                    AiConversationMessage.SenderType.AI,
                    response.getMessage()
            );
        }

        // =========================================================
        // 5. Return conversation ID
        // =========================================================

        response.setConversationId(
                conversation.getId()
        );

        conversationRepository.save(conversation);

        // =========================================================
        // 6. Log AI Interaction
        // =========================================================

        try {

            com.aicustomersupport.aicustomersupportbackend.entity.AiInteractionLog log =
                    new com.aicustomersupport.aicustomersupportbackend.entity.AiInteractionLog();

            log.setCustomer(customer);
            log.setConversation(conversation);
            log.setUserMessage(message);
            log.setAiResponse(response.getMessage());
            log.setConfidence(response.getConfidence());
            log.setRisk(response.getRisk());
            log.setSentiment(response.getSentiment());
            log.setCanAnswer(response.isCanAnswer());
            log.setCanResolve(response.isCanResolve());
            log.setEscalated(escalationDecision.isEscalate());
            log.setApiFailed(!response.isAiAvailable());
            log.setFallbackUsed(!response.isAiAvailable());

            aiInteractionLogRepository.save(log);

        } catch (Exception e) {

            System.err.println(
                    "Failed to log AI interaction: "
                            + e.getMessage()
            );
        }

        return response;
    }

    // =============================================================
    // Get / Create Conversation
    // =============================================================

    private AiConversation getOrCreateConversation(
            Long conversationId,
            Customer customer
    ) {

        /*
         * If the frontend provides a conversation ID,
         * continue that exact conversation.
         */
        if (conversationId != null) {

            AiConversation conversation =
                    conversationRepository
                            .findById(conversationId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "AI conversation not found"
                                    )
                            );

            /*
             * Security check:
             * a customer can only access their own AI conversation.
             */
            if (conversation.getCustomer() == null
                    || !conversation.getCustomer()
                    .getId()
                    .equals(customer.getId())) {

                throw new RuntimeException(
                        "You are not allowed to access this AI conversation"
                );
            }

            return conversation;
        }

        /*
         * No conversationId means this is a NEW AI chat.
         *
         * Do NOT reuse the customer's latest conversation.
         *
         * This is important because refreshing the Customer
         * Dashboard or starting a new chat must not accidentally
         * continue an old support case.
         */
        return createConversation(customer);
    }

    // =============================================================
    // Create Conversation
    // =============================================================

    private AiConversation createConversation(
            Customer customer
    ) {

        AiConversation conversation =
                new AiConversation();

        conversation.setCustomer(customer);

        return conversationRepository.save(
                conversation
        );
    }

    // =============================================================
    // Load Server-side Context
    // =============================================================

    private List<AiChatMessage> loadConversationContext(
            AiConversation conversation
    ) {

        List<AiConversationMessage> storedMessages =
                messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conversation.getId()
                        );

        if (storedMessages.isEmpty()) {
            return new ArrayList<>();
        }

        int startIndex =
                Math.max(
                        0,
                        storedMessages.size()
                                - MAX_CONTEXT_MESSAGES
                );

        List<AiChatMessage> context =
                new ArrayList<>();

        for (
                int i = startIndex;
                i < storedMessages.size();
                i++
        ) {

            AiConversationMessage storedMessage =
                    storedMessages.get(i);

            String sender =
                    storedMessage.getSenderType()
                            == AiConversationMessage.SenderType.CUSTOMER
                            ? "customer"
                            : "ai";

            context.add(
                    new AiChatMessage(
                            sender,
                            storedMessage.getText()
                    )
            );
        }

        return context;
    }

    // =============================================================
    // Sanitize Old Client Conversation
    // =============================================================

    private List<AiChatMessage> sanitizeClientConversation(
            List<AiChatMessage> clientConversation
    ) {

        if (clientConversation == null
                || clientConversation.isEmpty()) {

            return new ArrayList<>();
        }

        List<AiChatMessage> sanitized =
                new ArrayList<>();

        int startIndex =
                Math.max(
                        0,
                        clientConversation.size()
                                - MAX_CONTEXT_MESSAGES
                );

        for (
                int i = startIndex;
                i < clientConversation.size();
                i++
        ) {

            AiChatMessage message =
                    clientConversation.get(i);

            if (message == null
                    || message.getText() == null
                    || message.getText().isBlank()) {

                continue;
            }

            String sender =
                    normalizeSender(
                            message.getSender()
                    );

            sanitized.add(
                    new AiChatMessage(
                            sender,
                            message.getText().trim()
                    )
            );
        }

        return sanitized;
    }

    // =============================================================
    // Normalize Sender
    // =============================================================

    private String normalizeSender(
            String sender
    ) {

        if (sender == null) {
            return "customer";
        }

        if ("ai".equalsIgnoreCase(sender)
                || "assistant".equalsIgnoreCase(sender)
                || "bot".equalsIgnoreCase(sender)) {

            return "ai";
        }

        return "customer";
    }

    // =============================================================
    // Save Conversation Message
    // =============================================================

    private void saveMessage(
            AiConversation conversation,
            AiConversationMessage.SenderType senderType,
            String text
    ) {

        if (text == null || text.isBlank()) {
            return;
        }

        AiConversationMessage message =
                new AiConversationMessage();

        message.setConversation(
                conversation
        );

        message.setSenderType(
                senderType
        );

        message.setText(
                text.trim()
        );

        messageRepository.save(
                message
        );
    }

    // =============================================================
    // Current Customer
    // =============================================================

    private Customer getCurrentCustomer() {

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

        String email =
                authentication.getName();

        return customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );
    }
}