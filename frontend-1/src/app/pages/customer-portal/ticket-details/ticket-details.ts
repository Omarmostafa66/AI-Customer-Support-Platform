import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { CustomerPage } from '../shared/customer-page';
import { CustomerState } from '../shared/customer-state';

import {
  CustomerStatus,
  CUSTOMER_STATUS_LABELS
} from '../shared/customer-status';

import {
  Ticket,
  Message,
  AiResolutionResponse,
  CustomerSatisfaction,
  CustomerSatisfactionRequest
} from '../../../models/resources';

@Component({
  selector: 'app-customer-ticket-details',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomerState,
    CustomerStatus
  ],

  styleUrls: [
    '../shared/customer-ui.css',
    '../shared/customer-forms.css'
  ],

  styles: [`
    .conversation {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 4px;
    }

    .conversation-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 520px;
      overflow-y: auto;
      padding: 6px 2px;
    }

    .conversation-empty {
      padding: 28px 20px;
      text-align: center;
      border: 1px dashed rgba(36, 26, 47, 0.18);
      border-radius: 14px;
      background: rgba(36, 26, 47, 0.025);
    }

    .conversation-empty p {
      margin: 0;
    }

    .message-row {
      display: flex;
      width: 100%;
    }

    .message-row.customer {
      justify-content: flex-end;
    }

    .message-row.employee {
      justify-content: flex-start;
    }

    .message-bubble {
      width: min(78%, 680px);
      padding: 14px 16px;
      border-radius: 16px;
      box-sizing: border-box;
    }

    .message-bubble.customer {
      background: #f05a3c;
      color: #ffffff;
      border-bottom-right-radius: 5px;
    }

    .message-bubble.employee {
      background: #14b8a6;
      color: #ffffff;
      border-bottom-left-radius: 5px;
    }

    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 7px;
      font-size: 12px;
      font-weight: 700;
      opacity: 0.9;
    }

    .message-text {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.6;
    }

    .message-time {
      font-size: 11px;
      opacity: 0.82;
      font-weight: 500;
    }

    .reply-box {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 18px;
      border-top: 1px solid rgba(36, 26, 47, 0.1);
    }

    .reply-box textarea {
      width: 100%;
      min-height: 110px;
      resize: vertical;
      box-sizing: border-box;
    }

    .reply-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
    }

    .conversation-loading {
      padding: 28px 20px;
      text-align: center;
      color: #6b6474;
    }

    .conversation-error {
      padding: 14px 16px;
      border-radius: 12px;
      background: rgba(240, 90, 60, 0.08);
      color: #a53b27;
    }

    /* =========================================================
       Customer Satisfaction (CSAT)
       ========================================================= */

    .satisfaction-section {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .satisfaction-rating {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .satisfaction-rating-label {
      font-size: 14px;
      font-weight: 700;
      color: #241a2f;
    }

    .rating-options {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rating-button {
      width: 46px;
      height: 46px;
      padding: 0;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      border: 1px solid rgba(36, 26, 47, 0.16);
      border-radius: 10px;

      background: #ffffff;
      color: #241a2f;

      font-size: 15px;
      font-weight: 700;

      cursor: pointer;

      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .rating-button:hover {
      border-color: #f05a3c;
      color: #f05a3c;
      transform: translateY(-1px);
    }

    .rating-button.active {
      background: #f05a3c;
      border-color: #f05a3c;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(240, 90, 60, 0.18);
    }

    .rating-button:focus-visible {
      outline: 3px solid rgba(240, 90, 60, 0.2);
      outline-offset: 2px;
    }

    .rating-description {
      margin: 0;
      min-height: 20px;
      color: #6b6474;
      font-size: 13px;
    }

    .satisfaction-feedback {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .satisfaction-feedback textarea {
      width: 100%;
      min-height: 110px;
      padding: 12px 14px;

      box-sizing: border-box;
      resize: vertical;

      border: 1px solid rgba(36, 26, 47, 0.16);
      border-radius: 10px;

      background: #ffffff;
      color: #241a2f;

      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;

      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .satisfaction-feedback textarea:focus {
      outline: none;
      border-color: #f05a3c;
      box-shadow: 0 0 0 3px rgba(240, 90, 60, 0.08);
    }

    .satisfaction-feedback textarea:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .satisfaction-actions {
      display: flex;
      justify-content: flex-end;
    }

    .satisfaction-success {
      text-align: center;
    }

    .satisfaction-success h2 {
      margin-bottom: 8px;
    }

    @media (max-width: 700px) {

      .rating-options {
        width: 100%;
      }

      .rating-button {
        flex: 1;
        width: auto;
      }

      .satisfaction-actions {
        justify-content: stretch;
      }

      .satisfaction-actions .button {
        width: 100%;
      }
    }

    @media (max-width: 700px) {
      .conversation-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .message-bubble {
        width: 90%;
      }

      .reply-actions {
        justify-content: stretch;
      }

      .reply-actions .button {
        width: 100%;
      }
    }
  `],

  templateUrl: './ticket-details.html',
})
export class CustomerTicketDetails extends CustomerPage {

  private readonly params = toSignal(
    inject(ActivatedRoute).paramMap
  );


  // =========================================================
  // Ticket
  // =========================================================

  ticket: Ticket | null = null;


  // =========================================================
  // Ticket Conversation
  // =========================================================

  messages: Message[] = [];

  replyText = '';

  messagesLoading = false;

  sendingMessage = false;

  messagesError = '';


  // =========================================================
  // AI Resolution Assessment
  // =========================================================

  resolutionAssessment: AiResolutionResponse | null = null;

  resolutionLoading = false;

  resolutionError = '';

  resolutionConfirming = false;

  resolutionConfirmError = '';


  // =========================================================
  // Customer Satisfaction (CSAT)
  // =========================================================

  satisfactionRating = 0;

  satisfactionFeedback = '';

  satisfactionSubmitting = false;

  satisfactionSubmitted = false;

  satisfactionError = '';


  readonly labels =
    CUSTOMER_STATUS_LABELS;


  // =========================================================
  // Ticket Progress
  // =========================================================

  get steps(): string[] {

    return [
      'Submitted',
      'In Progress',
      this.ticket?.status === 'CLOSED'
        ? 'Closed'
        : 'Resolved'
    ];
  }


  get stage(): number {

    return this.ticket?.status === 'OPEN'
      ? 0
      : this.ticket?.status === 'IN_PROGRESS'
        ? 1
        : 2;
  }


  // =========================================================
  // Constructor
  // =========================================================

  constructor() {

    super();

    effect(() => {

      this.params();

      this.user.currentCustomerId();

      this.reload();

    });
  }


  // =========================================================
  // Reload Ticket
  // =========================================================

  reload(): void {

    this.resetRequests();

    this.ticket = null;

    this.messages = [];

    this.replyText = '';

    this.messagesLoading = false;

    this.sendingMessage = false;

    this.messagesError = '';

    this.resolutionAssessment = null;

    this.resolutionLoading = false;

    this.resolutionError = '';

    this.resolutionConfirming = false;

    this.resolutionConfirmError = '';

    this.satisfactionRating = 0;

    this.satisfactionFeedback = '';

    this.satisfactionSubmitting = false;

    this.satisfactionSubmitted = false;

    this.satisfactionError = '';


    const customerId =
      this.user.currentCustomerId();


    if (customerId === null) {

      return;
    }


    const id =
      Number(
        this.params()?.get('id')
      );


    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {

      this.error =
        'Invalid ticket reference.';

      return;
    }


    this.loadData(

      this.api.getTicketsByCustomer(
        customerId
      ),

      (rows) => {

        const selectedTicket =
          rows.find(
            (t) =>
              t.id === id &&
              t.customer?.id === customerId
          ) ?? null;


        this.ticket =
          selectedTicket;


        if (!selectedTicket) {

          this.messages = [];

          this.messagesLoading = false;

          this.cdr.markForCheck();

          return;
        }


        // Load existing CSAT only for resolved tickets
        if (selectedTicket.status === 'RESOLVED') {

          this.loadSatisfaction(
            selectedTicket.id
          );

        }


        this.loadConversation(
          selectedTicket.id
        );

      }
    );
  }


  // =========================================================
  // Load Ticket Conversation
  // =========================================================

  loadConversation(
    ticketId: number
  ): void {

    if (
      !Number.isSafeInteger(ticketId) ||
      ticketId <= 0
    ) {

      this.messagesLoading = false;

      this.messagesError =
        'Invalid ticket reference.';

      this.cdr.markForCheck();

      return;
    }


    this.messagesLoading = true;

    this.messagesError = '';

    this.cdr.markForCheck();


    this.api
      .getMessagesByTicket(ticketId)

      .pipe(

        finalize(() => {

          this.messagesLoading = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (messages) => {

          this.messages =
            Array.isArray(messages)
              ? messages
              : [];

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load ticket conversation:',
            error
          );


          this.messages = [];

          this.messagesError =
            'Unable to load the ticket conversation. Please try again.';

          this.cdr.markForCheck();

        }

      });
  }


  // =========================================================
  // AI Resolution Assessment
  // =========================================================

  assessResolution(): void {

    if (
      !this.ticket ||
      this.resolutionLoading
    ) {

      return;
    }

    this.resolutionLoading = true;

    this.resolutionError = '';

    this.resolutionAssessment = null;

    this.cdr.markForCheck();


    this.api
      .getResolutionAssessment(
        this.ticket.id
      )

      .pipe(

        finalize(() => {

          this.resolutionLoading = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (assessment) => {

          this.resolutionAssessment =
            assessment;

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to assess ticket resolution:',
            error
          );

          this.resolutionAssessment =
            null;

          this.resolutionError =
            'Unable to assess the ticket resolution. Please try again.';

          this.cdr.markForCheck();

        }

      });
  }


  // =========================================================
  // Customer Resolution Confirmation
  // =========================================================

  confirmResolution(): void {

    if (
      !this.ticket ||
      this.resolutionConfirming
    ) {
      return;
    }

    this.resolutionConfirming = true;

    this.resolutionConfirmError = '';

    this.cdr.markForCheck();


    this.api
      .confirmTicketResolution(
        this.ticket.id
      )

      .pipe(

        finalize(() => {

          this.resolutionConfirming = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (updatedTicket) => {

          this.ticket = updatedTicket;

          this.resolutionAssessment = {
            resolved: true,
            confidence: 1,
            reason:
              'You confirmed that the issue has been resolved.'
          };

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to confirm ticket resolution:',
            error
          );

          this.resolutionConfirmError =
            'Unable to confirm the ticket resolution. Please try again.';

          this.cdr.markForCheck();

        }

      });
  }


  // =========================================================
  // Customer Satisfaction (CSAT)
  // =========================================================

  setSatisfactionRating(rating: number): void {

    if (this.satisfactionSubmitted || this.satisfactionSubmitting) {

      return;
    }

    this.satisfactionRating = rating;

    this.cdr.markForCheck();
  }


  // =========================================================
  // Load Existing Customer Satisfaction
  // =========================================================

  loadSatisfaction(ticketId: number): void {

    if (
      !Number.isSafeInteger(ticketId) ||
      ticketId <= 0
    ) {
      return;
    }

    this.api
      .getTicketSatisfaction(ticketId)

      .subscribe({

        next: (satisfaction) => {

          if (satisfaction) {

            this.satisfactionSubmitted = true;

            this.satisfactionRating =
              satisfaction.rating;

            this.satisfactionFeedback =
              satisfaction.feedback ?? '';

          } else {

            this.satisfactionSubmitted = false;

          }

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load ticket satisfaction:',
            error
          );

          /*
           * If loading the previous rating fails,
           * keep the form available so the customer
           * can still try to submit feedback.
           */
          this.satisfactionSubmitted = false;

          this.cdr.markForCheck();

        }

      });
  }


  submitSatisfaction(): void {

    if (
      !this.ticket ||
      this.satisfactionRating < 1 ||
      this.satisfactionRating > 5 ||
      this.satisfactionSubmitting
    ) {

      return;
    }

    this.satisfactionSubmitting = true;

    this.satisfactionError = '';

    const request: CustomerSatisfactionRequest = {
      rating: this.satisfactionRating,
      feedback: this.satisfactionFeedback.trim() || null
    };

    this.api
      .submitTicketSatisfaction(this.ticket.id, request)

      .pipe(

        finalize(() => {

          this.satisfactionSubmitting = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: () => {

          this.satisfactionSubmitted = true;

          this.cdr.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to submit ticket satisfaction:',
            error
          );

          this.satisfactionError =
            'Unable to submit your feedback. Please try again.';

          this.cdr.markForCheck();

        }

      });
  }


  // =========================================================
  // Send Customer Reply
  // =========================================================

  sendReply(): void {

    const text =
      this.replyText.trim();


    if (
      !text ||
      !this.ticket ||
      this.sendingMessage
    ) {

      return;
    }


    this.sendingMessage = true;

    this.messagesError = '';

    this.cdr.markForCheck();


    this.api
      .createMessageForTicket(
        this.ticket.id,
        text
      )

      .pipe(

        finalize(() => {

          this.sendingMessage = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (message) => {

          console.log(
            'Customer ticket message created:',
            message
          );


          this.messages = [
            ...this.messages,
            message
          ];


          this.replyText = '';

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to send ticket message:',
            error
          );


          this.messagesError =
            'Unable to send your message. Please try again.';

          this.cdr.markForCheck();

        }

      });
  }
}
