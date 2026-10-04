import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  finalize,
  switchMap,
  throwError,
} from 'rxjs';

import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';

import {
  Ticket,
  TicketAnalysis,
  Message,
  Status,
  STATUSES,
} from '../../../models/resources';

@Component({
  selector: 'app-employee-ticket-details',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PortalState,
  ],

  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './ticket-details.css',
  ],

  styles: [`
    /* =========================================================
       Ticket Workflow
       ========================================================= */

    .workflow-card {
      margin-top: 22px;

      border-color: rgba(240, 90, 60, 0.14);

      background:
        linear-gradient(
          135deg,
          rgba(240, 90, 60, 0.035),
          #ffffff 48%
        );
    }

    .workflow-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      gap: 20px;
      margin-bottom: 20px;
    }

    .workflow-kicker {
      margin: 0 0 5px;

      color: #f05a3c;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .workflow-header h2 {
      margin: 0 0 6px;

      color: #241a2f;

      font-size: 22px;
      line-height: 1.35;
    }

    .workflow-header .hint {
      margin: 0;

      color: #737a86;

      line-height: 1.6;
    }

    .workflow-control {
      display: grid;

      grid-template-columns:
        minmax(180px, 260px)
        auto;

      align-items: end;

      gap: 14px;
    }

    .workflow-field {
      display: flex;
      flex-direction: column;

      gap: 7px;
    }

    .workflow-field label {
      color: #241a2f;

      font-size: 12px;
      font-weight: 800;
    }

    .workflow-field select {
      width: 100%;
      min-height: 46px;

      box-sizing: border-box;

      padding: 10px 13px;

      border: 1px solid #ddd8e1;
      border-radius: 10px;

      background: #ffffff;
      color: #241a2f;

      font-family: inherit;
      font-size: 13px;
      font-weight: 700;

      outline: none;

      cursor: pointer;

      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .workflow-field select:hover {
      border-color: #cfc9d5;
    }

    .workflow-field select:focus {
      border-color: #14b8a6;

      box-shadow:
        0 0 0 3px rgba(20, 184, 166, 0.11);
    }

    .workflow-field select:disabled {
      opacity: 0.7;

      background: #f8f7f9;

      cursor: not-allowed;
    }

    .workflow-status {
      display: inline-flex;
      align-items: center;

      width: fit-content;

      margin-top: 16px;

      padding: 7px 10px;

      border-radius: 8px;

      background: rgba(20, 184, 166, 0.08);
      color: #148f83;

      font-size: 11px;
      font-weight: 800;
    }

    .workflow-status strong {
      margin-left: 4px;
    }

    .resolution-field {
      display: flex;
      flex-direction: column;

      gap: 7px;

      margin-top: 18px;
    }

    .resolution-field label {
      color: #241a2f;

      font-size: 12px;
      font-weight: 800;
    }

    .resolution-field textarea {
      width: 100%;
      min-height: 110px;

      box-sizing: border-box;

      padding: 12px 13px;

      border: 1px solid #ddd8e1;
      border-radius: 10px;

      background: #ffffff;
      color: #241a2f;

      font-family: inherit;
      font-size: 13px;
      line-height: 1.6;

      resize: vertical;
      outline: none;

      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .resolution-field textarea:focus {
      border-color: #14b8a6;

      box-shadow:
        0 0 0 3px rgba(20, 184, 166, 0.11);
    }

    .resolution-hint {
      margin: 0;

      color: #737a86;

      font-size: 11px;
      line-height: 1.5;
    }

    @media (max-width: 700px) {

      .workflow-header {
        flex-direction: column;
      }

      .workflow-control {
        grid-template-columns: 1fr;
      }

      .workflow-control .primary-button {
        width: 100%;
      }
    }
  `],

  templateUrl: './ticket-details.html',
})
export class EmployeeTicketDetails extends PortalPage {

  private readonly params =
    toSignal(
      inject(ActivatedRoute).paramMap
    );

  ticket: Ticket | null = null;

  analysis: TicketAnalysis | null = null;


  // =========================================================
  // Ticket Workflow
  // =========================================================

  readonly statuses = STATUSES;

  selectedStatus: Status = 'OPEN';

  statusSaving = false;

  resolutionNote = '';


  get availableStatuses(): Status[] {

    if (!this.ticket) {
      return [];
    }

    switch (this.ticket.status) {

      case 'OPEN':
        return [
          'OPEN',
          'IN_PROGRESS',
        ];

      case 'IN_PROGRESS':
        return [
          'IN_PROGRESS',
          'RESOLVED',
        ];

      case 'RESOLVED':
        return [
          'RESOLVED',
          'CLOSED',
        ];

      case 'CLOSED':
        return [
          'CLOSED',
          'OPEN',
        ];

      default:
        return [this.ticket.status];
    }
  }


  // =========================================================
  // Ticket Conversation
  // =========================================================

  messages: Message[] = [];

  replyText = '';

  messagesLoading = false;

  conversationLoaded = false;

  sendingMessage = false;

  messagesError = '';


  constructor() {

    super();

    effect(() => {

      this.params();

      this.user.currentEmployeeId();

      this.reload();

    });
  }


  // =========================================================
  // Reload Ticket
  // =========================================================

  reload(): void {

    this.resetRequests();

    this.ticket = null;
    this.analysis = null;

    this.messages = [];
    this.replyText = '';

    this.messagesLoading = false;
    this.conversationLoaded = false;
    this.sendingMessage = false;
    this.statusSaving = false;
    this.messagesError = '';

    this.selectedStatus = 'OPEN';
    this.resolutionNote = '';

    this.cdr.markForCheck();


    const employeeId =
      this.user.currentEmployeeId();

    if (employeeId === null) {
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

      this.cdr.markForCheck();

      return;
    }


    this.loadData(

      this.api.getTicketsByEmployee(
        employeeId
      ),

      (tickets) => {

        const ticket =
          tickets.find(
            (item) =>
              item.id === id &&
              item.employee?.id === employeeId
          );


        if (!ticket) {

          this.ticket = null;

          this.error =
            'This ticket is not assigned to you or is no longer available.';

          this.cdr.markForCheck();

          return;
        }


        this.ticket = ticket;

        this.selectedStatus =
          ticket.status;

        this.resolutionNote =
          ticket.resolutionNote?.trim() || '';


        this.cdr.markForCheck();


        // Load saved AI analysis
        this.loadSavedAnalysis(
          ticket.id
        );


        // Load ticket conversation
        this.loadConversation(
          ticket.id
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

    this.messagesLoading = true;

    this.conversationLoaded = false;

    this.messagesError = '';

    this.cdr.markForCheck();


    console.log(
      'Loading ticket conversation:',
      ticketId
    );


    this.api
      .getMessagesByTicket(ticketId)

      .pipe(

        finalize(() => {

          this.messagesLoading = false;

          this.conversationLoaded = true;

          this.cdr.markForCheck();


          console.log(
            'Conversation loading finished.'
          );

        })

      )

      .subscribe({

        next: (messages) => {

          console.log(
            'Ticket conversation loaded:',
            messages
          );


          this.messages = messages;

          this.conversationLoaded = true;

          this.cdr.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load ticket conversation:',
            error
          );


          this.messages = [];

          this.messagesError =
            'Unable to load the ticket conversation.';

          this.conversationLoaded = true;

          this.cdr.markForCheck();

        },


        complete: () => {

          console.log(
            'Ticket conversation request completed.'
          );

          this.conversationLoaded = true;

          this.cdr.markForCheck();

        }

      });
  }


  // =========================================================
  // Send Employee Reply
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


    const employeeId =
      this.user.currentEmployeeId();

    if (employeeId === null) {
      return;
    }

    this.api
      .getTicketsByEmployee(employeeId)

      .pipe(

        switchMap((tickets) => {

          const currentTicket =
            tickets.find(
              (ticket) =>
                ticket.id === this.ticket?.id &&
                ticket.employee?.id === employeeId
            );


          if (!currentTicket) {

            this.ticket = null;

            this.messagesError =
              'This ticket is no longer assigned to you. Refresh your assigned tickets.';

            return throwError(
              () => new Error('Assignment changed')
            );
          }


          return this.api
            .createMessageForTicket(
              currentTicket.id,
              text
            );
        }),

        finalize(() => {

          this.sendingMessage = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (message) => {

          console.log(
            'Ticket message created:',
            message
          );


          this.messages = [
            ...this.messages,
            message
          ];


          this.conversationLoaded = true;

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


  // =========================================================
  // Use AI Suggested Response
  // =========================================================

  useSuggestedResponse(): void {

    const suggestedResponse =
      this.analysis?.suggestedResponse?.trim();

    if (
      !suggestedResponse ||
      this.sendingMessage ||
      this.statusSaving
    ) {

      return;
    }

    this.replyText = suggestedResponse;

    this.messagesError = '';

    this.cdr.markForCheck();

    setTimeout(() => {

      const textarea =
        document.querySelector<HTMLTextAreaElement>(
          '.reply-box textarea'
        );

      textarea?.focus();
    });
  }


  // =========================================================
  // AI Analysis
  // =========================================================

  loadSavedAnalysis(ticketId: number): void {

    if (
      !Number.isSafeInteger(ticketId) ||
      ticketId <= 0
    ) {
      return;
    }

    this.api
      .getSavedTicketAnalysis(ticketId)
      .subscribe({

        next: (savedAnalysis) => {

          this.analysis = savedAnalysis;

          this.cdr.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load saved AI analysis:',
            error,
          );

          // Loading saved analysis must not
          // prevent the employee from using
          // Analyze with AI.
          this.analysis = null;

          this.cdr.markForCheck();
        },
      });
  }


  analyze(): void {

    if (
      !this.ticket ||
      this.busy ||
      !this.user.currentEmployeeId()
    ) {
      return;
    }

    this.submit(
      this.api.analyzeTicket(this.ticket.id),

      (result) => {

        this.analysis = result;

        this.cdr.markForCheck();
      }
    );
  }


  refreshAnalysis(): void {
    this.analyze();
  }


  // =========================================================
  // Update Ticket Status
  // =========================================================

  updateStatus(): void {

    if (
      !this.ticket ||
      this.statusSaving ||
      this.selectedStatus === this.ticket.status
    ) {
      return;
    }


    // -------------------------------------------------------
    // Resolution confirmation
    // -------------------------------------------------------

    if (
      this.selectedStatus === 'RESOLVED' &&
      !this.resolutionNote.trim()
    ) {

      this.error =
        'Please enter a resolution note before resolving the ticket.';

      this.cdr.markForCheck();

      return;
    }


    this.statusSaving = true;

    this.error = '';

    this.notice = '';

    this.cdr.markForCheck();


    const employeeId =
      this.user.currentEmployeeId();

    if (employeeId === null) {
      this.statusSaving = false;
      return;
    }

    this.api
      .getTicketsByEmployee(employeeId)

      .pipe(

        switchMap((tickets) => {

          const currentTicket =
            tickets.find(
              (ticket) =>
                ticket.id === this.ticket?.id &&
                ticket.employee?.id === employeeId
            );


          if (!currentTicket) {

            this.ticket = null;

            this.error =
              'This ticket is no longer assigned to you. Refresh your assigned tickets.';

            return throwError(
              () => new Error('Assignment changed')
            );
          }


          return this.api
            .updateTicketStatus(
              currentTicket.id,
              this.selectedStatus,
              this.selectedStatus === 'RESOLVED'
                ? this.resolutionNote.trim()
                : undefined,
            );
        }),

        finalize(() => {

          this.statusSaving = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (ticket) => {

          this.ticket = ticket;

          this.selectedStatus =
            ticket.status;

          this.resolutionNote =
            ticket.resolutionNote?.trim() || '';

          this.notice =
            `Ticket #${ticket.id} status updated to ${ticket.status}.`;

          this.cdr.markForCheck();
        },


        error: (error) => {

          console.error(
            'Failed to update ticket status:',
            error
          );


          this.selectedStatus =
            this.ticket?.status || 'OPEN';


          if (error?.status === 409) {

            if (
              this.selectedStatus === 'RESOLVED'
              || this.ticket?.status === 'IN_PROGRESS'
            ) {

              this.error =
                'A resolution note is required before resolving the ticket.';

            } else {

              this.error =
                'This status change is not allowed by the ticket workflow.';
            }

          } else {

            this.error =
              'Unable to update the ticket status. Please try again.';
          }

          this.cdr.markForCheck();
        }
      });
  }

  // =========================================================
  // SLA Status Helpers
  // =========================================================

  getSlaStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'WITHIN_SLA':
        return 'Within SLA';

      case 'BREACHED':
        return 'SLA Breached';

      case 'RESOLVED_WITHIN_SLA':
        return 'Resolved Within SLA';

      case 'RESOLVED_AFTER_SLA':
        return 'Resolved After SLA';

      default:
        return 'SLA Not Available';
    }
  }

  getSlaStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'WITHIN_SLA':
        return 'sla-within';

      case 'BREACHED':
        return 'sla-breached';

      case 'RESOLVED_WITHIN_SLA':
        return 'sla-resolved';

      case 'RESOLVED_AFTER_SLA':
        return 'sla-breached';

      default:
        return 'sla-unknown';
    }
  }

  getFirstResponseTime(): string {
    if (!this.ticket?.createdAt || !this.ticket?.firstResponseAt) {
      return 'Not yet';
    }

    return this.formatDuration(
      new Date(this.ticket.createdAt).getTime(),
      new Date(this.ticket.firstResponseAt).getTime(),
    );
  }

  getResolutionTime(): string {
    if (!this.ticket?.createdAt || !this.ticket?.resolvedAt) {
      return 'Not resolved';
    }

    return this.formatDuration(
      new Date(this.ticket.createdAt).getTime(),
      new Date(this.ticket.resolvedAt).getTime(),
    );
  }

  private formatDuration(
    startTime: number,
    endTime: number,
  ): string {

    const difference = endTime - startTime;

    if (difference < 0) {
      return '—';
    }

    const totalMinutes = Math.floor(
      difference / (1000 * 60),
    );

    const days = Math.floor(
      totalMinutes / (60 * 24),
    );

    const hours = Math.floor(
      (totalMinutes % (60 * 24)) / 60,
    );

    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }
}
