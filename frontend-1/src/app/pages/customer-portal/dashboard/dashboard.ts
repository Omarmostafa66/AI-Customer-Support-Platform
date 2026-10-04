import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CustomerPage } from '../shared/customer-page';
import {
  AiChatMessage,
  AiChatResponse,
} from '../../../models/resources';

interface ChatMessage {
  id: number;
  sender: 'assistant' | 'customer' | 'system';
  text: string;
  time: Date;
}

interface StoredChatState {
  conversationId: number | null;
  messageCounter: number;
  messages: {
    id: number;
    sender: 'assistant' | 'customer' | 'system';
    text: string;
    time: string;
  }[];
}

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CustomerDashboard extends CustomerPage {
  private readonly CHAT_STORAGE_KEY =
    'ai-customer-support-chat-state';

  messageText = '';
  messageCounter = 1;

  /**
   * Persistent AI conversation ID returned by the backend.
   *
   * Once the backend creates or retrieves the conversation,
   * the frontend keeps this ID and sends it with every
   * following AI chat request.
   */
  conversationId: number | null = null;

  /**
   * Controls the AI thinking/loading state
   * without affecting the shared CustomerPage busy state.
   */
  aiThinking = false;

  readonly quickPrompts = [
    "I can't log in to my account",
    'I have a billing problem',
    'My account is locked',
    'I need help with something else',
  ];

  messages: ChatMessage[] = [
    {
      id: 1,
      sender: 'assistant',
      text: `Hi! I'm your AI Support Assistant. Tell me what problem you're experiencing and I'll help you work through it step by step.`,
      time: new Date(),
    },
  ];

  constructor() {
    super();

    /*
     * Restore the AI chat state when the dashboard component
     * is created again after navigating back to this page.
     */
    this.restoreChatState();
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) {
      return;
    }

    keyboardEvent.preventDefault();
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.messageText.trim();

    if (!text || this.aiThinking) {
      return;
    }

    /*
     * Save the conversation BEFORE adding the new AI response.
     * This gives Gemini the previous conversation context.
     */
    const conversation: AiChatMessage[] = this.messages
      .filter(
        (message) =>
          message.sender === 'assistant' ||
          message.sender === 'customer',
      )
      .map((message) => ({
        sender: message.sender,
        text: message.text,
      }));

    this.addCustomerMessage(text);
    this.messageText = '';
    this.aiThinking = true;

    /*
     * Persist immediately so the customer's message is not lost
     * if the user navigates away while the AI is responding.
     */
    this.persistChatState();

    this.api
      .chatWithAi({
        /*
         * Send the persistent conversation ID when available.
         *
         * First message:
         *   conversationId = null
         *
         * Following messages:
         *   conversationId = ID returned by the backend
         */
        conversationId: this.conversationId,
        message: text,
        conversation,
      })
      .subscribe({
        next: (response: AiChatResponse) => {
          this.aiThinking = false;

          /*
           * Keep the conversation ID returned by the backend.
           *
           * This makes sure all following messages continue
           * the same server-side AI conversation.
           */
          if (response.conversationId !== null) {
            this.conversationId = response.conversationId;
          }

          /*
           * Show the AI's actual response in the chat.
           */
          if (response.message) {
            this.addAssistantMessage(response.message);
          }

          /*
           * When escalation creates a ticket, show the
           * ticket-created system message.
           */
          if (
            response.ticketCreated &&
            response.ticketId !== null
          ) {
            this.addTicketCreatedMessage(
              response.ticketId,
            );
          }

          /*
           * Save the complete updated conversation,
           * including the server-side conversation ID.
           */
          this.persistChatState();

          this.cdr.markForCheck();
        },

        error: (error) => {
          this.aiThinking = false;

          console.error(
            'AI chat request failed:',
            error,
          );

          this.addAssistantMessage(
            'I’m sorry, but I couldn’t process your request right now. Please try again in a moment.',
          );

          /*
           * Keep the current chat state even when the request fails.
           */
          this.persistChatState();

          this.cdr.markForCheck();
        },
      });
  }

  selectQuickPrompt(prompt: string): void {
    this.messageText = prompt;
  }

  private addCustomerMessage(text: string): void {
    this.messageCounter += 1;

    this.messages.push({
      id: this.messageCounter,
      sender: 'customer',
      text,
      time: new Date(),
    });

    this.persistChatState();
  }

  addAssistantMessage(text: string): void {
    this.messageCounter += 1;

    this.messages.push({
      id: this.messageCounter,
      sender: 'assistant',
      text,
      time: new Date(),
    });

    this.persistChatState();
  }

  addTicketCreatedMessage(ticketId: number): void {
    this.messageCounter += 1;

    this.messages.push({
      id: this.messageCounter,
      sender: 'system',
      text: `Support ticket #${ticketId} has been created successfully.`,
      time: new Date(),
    });

    this.persistChatState();
  }

  /**
   * Save the current AI chat state in sessionStorage.
   *
   * sessionStorage survives Angular route changes and component
   * recreation, but is cleared when the browser tab/session ends.
   */
  private persistChatState(): void {
    try {
      const state: StoredChatState = {
        conversationId: this.conversationId,
        messageCounter: this.messageCounter,
        messages: this.messages.map((message) => ({
          id: message.id,
          sender: message.sender,
          text: message.text,
          time: message.time.toISOString(),
        })),
      };

      sessionStorage.setItem(
        this.CHAT_STORAGE_KEY,
        JSON.stringify(state),
      );
    } catch (error) {
      console.error(
        'Failed to persist AI chat state:',
        error,
      );
    }
  }

  /**
   * Restore the AI chat state when returning to the dashboard.
   *
   * This restores both:
   * - the server-side conversation ID
   * - the visible chat messages
   */
  private restoreChatState(): void {
    try {
      const storedState =
        sessionStorage.getItem(
          this.CHAT_STORAGE_KEY,
        );

      if (!storedState) {
        return;
      }

      const state =
        JSON.parse(
          storedState,
        ) as StoredChatState;

      if (!state || !Array.isArray(state.messages)) {
        return;
      }

      this.conversationId =
        state.conversationId ?? null;

      this.messageCounter =
        typeof state.messageCounter === 'number'
          ? state.messageCounter
          : 1;

      this.messages =
        state.messages.map((message) => ({
          id: message.id,
          sender: message.sender,
          text: message.text,
          time: new Date(message.time),
        }));

      /*
       * If the stored state is somehow empty or invalid,
       * fall back to the initial assistant greeting.
       */
      if (this.messages.length === 0) {
        this.messages = [
          {
            id: 1,
            sender: 'assistant',
            text: `Hi! I'm your AI Support Assistant. Tell me what problem you're experiencing and I'll help you work through it step by step.`,
            time: new Date(),
          },
        ];

        this.messageCounter = 1;
      }
    } catch (error) {
      console.error(
        'Failed to restore AI chat state:',
        error,
      );

      /*
       * If the stored data is corrupted, start with
       * a clean chat instead of breaking the dashboard.
       */
      this.conversationId = null;
      this.messageCounter = 1;

      this.messages = [
        {
          id: 1,
          sender: 'assistant',
          text: `Hi! I'm your AI Support Assistant. Tell me what problem you're experiencing and I'll help you work through it step by step.`,
          time: new Date(),
        },
      ];
    }
  }
}
