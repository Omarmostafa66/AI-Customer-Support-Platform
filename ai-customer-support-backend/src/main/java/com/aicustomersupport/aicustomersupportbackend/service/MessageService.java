package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Customer;
import com.aicustomersupport.aicustomersupportbackend.entity.Message;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerRepository;
import com.aicustomersupport.aicustomersupportbackend.repository.MessageRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final CustomerRepository customerRepository;

    public MessageService(
            MessageRepository messageRepository,
            CustomerRepository customerRepository
    ) {
        this.messageRepository = messageRepository;
        this.customerRepository = customerRepository;
    }

    // Create Message
    // CUSTOMER creates a message for the authenticated customer.
    public Message createMessage(Message message) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Customer currentCustomer =
                getCurrentCustomer(authentication);

        message.setCustomer(currentCustomer);

        return messageRepository.save(message);
    }

    // Create Message For Customer
    // ADMIN / EMPLOYEE can create a message for a specific customer.
    public Message createMessageForCustomer(
            Long customerId,
            Message message
    ) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        message.setCustomer(customer);

        return messageRepository.save(message);
    }

    // Get All Messages
    // ADMIN / EMPLOYEE only.
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    // Get Message By ID
    // CUSTOMER can only access their own message.
    // ADMIN / EMPLOYEE can access any message.
    public Optional<Message> getMessageById(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Message message = messageRepository.findById(id)
                .orElse(null);

        if (message == null) {
            return Optional.empty();
        }

        if (isAdminOrEmployee(authentication)) {
            return Optional.of(message);
        }

        Customer currentCustomer =
                getCurrentCustomer(authentication);

        if (message.getCustomer() == null
                || !message.getCustomer()
                .getId()
                .equals(currentCustomer.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this message"
            );
        }

        return Optional.of(message);
    }

    // Update Message
    // ADMIN / EMPLOYEE only.
    public Message updateMessage(
            Long id,
            Message messageDetails
    ) {

        Message message = messageRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Message not found")
                );

        message.setTxt(messageDetails.getTxt());

        return messageRepository.save(message);
    }

    // Delete Message
    // ADMIN only.
    public void deleteMessage(Long id) {

        if (!messageRepository.existsById(id)) {
            throw new RuntimeException("Message not found");
        }

        messageRepository.deleteById(id);
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
}