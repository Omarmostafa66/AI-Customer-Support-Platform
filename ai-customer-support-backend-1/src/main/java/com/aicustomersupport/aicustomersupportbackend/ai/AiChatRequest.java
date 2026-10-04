package com.aicustomersupport.aicustomersupportbackend.ai;

import java.util.ArrayList;
import java.util.List;

public class AiChatRequest {

    /*
     * Optional for backward compatibility.
     *
     * The backend can automatically find the customer's
     * active/latest conversation when this value is null.
     */
    private Long conversationId;

    private String message;

    /*
     * Kept for backward compatibility with the existing Angular app.
     *
     * The server-side database conversation is now the
     * authoritative source of context whenever available.
     */
    private List<AiChatMessage> conversation =
            new ArrayList<>();

    public AiChatRequest() {
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<AiChatMessage> getConversation() {
        return conversation;
    }

    public void setConversation(
            List<AiChatMessage> conversation
    ) {
        this.conversation = conversation;
    }
}