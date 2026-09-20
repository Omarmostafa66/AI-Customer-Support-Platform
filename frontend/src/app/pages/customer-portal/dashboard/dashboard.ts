import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CustomerPage } from '../shared/customer-page';

interface ChatMessage {
  id: number;
  sender: 'assistant' | 'customer' | 'system';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CustomerDashboard extends CustomerPage {
  messageText = '';
  messageCounter = 1;

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

    if (!text) {
      return;
    }

    this.addCustomerMessage(text);
    this.messageText = '';

    /*
     * FUTURE AI INTEGRATION
     * ---------------------
     * When the backend AI/chat endpoint is ready,
     * send the customer's message and conversation history here.
     *
     * Example future flow:
     *
     * this.api.sendChatMessage({
     *   customerId: this.user.currentCustomerId(),
     *   message: text,
     *   conversation: this.messages
     * }).subscribe({
     *   next: (response) => {
     *     this.addAssistantMessage(response.message);
     *   }
     * });
     *
     * If the AI determines that the problem cannot be solved,
     * the backend can create a ticket and return the ticket ID.
     */
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
  }

  addAssistantMessage(text: string): void {
    this.messageCounter += 1;

    this.messages.push({
      id: this.messageCounter,
      sender: 'assistant',
      text,
      time: new Date(),
    });
  }

  addTicketCreatedMessage(ticketId: number): void {
    this.messageCounter += 1;

    this.messages.push({
      id: this.messageCounter,
      sender: 'system',
      text: `Support ticket #${ticketId} has been created successfully.`,
      time: new Date(),
    });
  }
}