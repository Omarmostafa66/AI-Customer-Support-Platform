import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Api } from '../../services/api';
import {
  Ticket,
  TicketInput,
  TicketAnalysis,
  Customer,
} from '../../models/resources';
import { ToastService } from '../../shared/toast/toast.service';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.html',
  styleUrls: [
    './tickets.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Tickets implements OnInit {
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  tickets: Ticket[] = [];

  customers: Customer[] = [];
  customersLoading = false;

  loading = false;
  error = '';

  showForm = false;
  editing = false;

  selectedTicketId: number | null = null;
  selectedCustomerId: number | null = null;

  analysis: TicketAnalysis | null = null;
  analyzingTicketId: number | null = null;

  deletingTicketId: number | null = null;

  ticketForm: TicketInput = {
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
  };

  statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  ngOnInit(): void {
    this.loadTickets();
    this.loadCustomers();
  }

  loadTickets(force = false): void {
    if (this.loading && !force) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.api
      .getTickets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tickets) => {
          this.tickets = tickets;
          this.loading = false;

          this.cdr.markForCheck();
        },

        error: (err) => {
          const message = apiError(
            err,
            'Could not load tickets.',
          );

          console.error(err);

          this.error = message;
          this.loading = false;

          this.toastService.error(
            message,
            'Could not load tickets',
          );

          this.cdr.markForCheck();
        },
      });
  }

  loadCustomers(): void {
    if (this.customersLoading) {
      return;
    }

    this.customersLoading = true;

    this.api
      .getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customers) => {
          this.customers = customers;
          this.customersLoading = false;

          this.cdr.markForCheck();
        },

        error: (err) => {
          const message = apiError(
            err,
            'Could not load customers.',
          );

          console.error(err);

          this.customers = [];
          this.customersLoading = false;

          this.toastService.error(
            message,
            'Could not load customers',
          );

          this.cdr.markForCheck();
        },
      });
  }

  openCreateForm(): void {
    if (this.loading || this.deletingTicketId !== null) {
      return;
    }

    this.editing = false;
    this.selectedTicketId = null;
    this.selectedCustomerId = null;

    this.ticketForm = {
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
    };

    this.error = '';
    this.showForm = true;
  }

  editTicket(ticket: Ticket): void {
    if (this.loading || this.deletingTicketId !== null) {
      return;
    }

    this.editing = true;
    this.selectedTicketId = ticket.id;

    this.selectedCustomerId = ticket.customer?.id ?? null;

    this.ticketForm = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
    };

    this.error = '';
    this.showForm = true;
  }

  cancelForm(): void {
    if (this.loading) {
      return;
    }

    this.showForm = false;
    this.editing = false;
    this.selectedTicketId = null;
    this.selectedCustomerId = null;
    this.error = '';
  }

  saveTicket(): void {
    if (this.loading) {
      return;
    }

    const title = this.ticketForm.title.trim();
    const description = this.ticketForm.description.trim();

    if (!title) {
      this.error = 'Title is required.';

      this.toastService.warning(
        'Please enter a title for the ticket.',
        'Title required',
      );

      return;
    }

    if (!description) {
      this.error = 'Description is required.';

      this.toastService.warning(
        'Please enter a description for the ticket.',
        'Description required',
      );

      return;
    }

    if (!this.editing && this.selectedCustomerId === null) {
      this.error = 'Please select a customer.';

      this.toastService.warning(
        'Select a customer before creating the ticket.',
        'Customer required',
      );

      return;
    }

    this.loading = true;
    this.error = '';

    if (this.editing && this.selectedTicketId !== null) {
      const ticketId = this.selectedTicketId;

      this.api
        .updateTicket(ticketId, {
          title,
          description,
          status: this.ticketForm.status,
          priority: this.ticketForm.priority,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.showForm = false;
            this.editing = false;
            this.selectedTicketId = null;
            this.selectedCustomerId = null;

            this.toastService.success(
              `Ticket #${ticketId} was updated successfully.`,
              'Ticket updated',
            );

            this.loadTickets(true);
          },

          error: (err) => {
            const message = apiError(
              err,
              'Could not update ticket.',
            );

            console.error(err);

            this.error = message;
            this.loading = false;

            this.toastService.error(
              message,
              'Could not update ticket',
            );

            this.cdr.markForCheck();
          },
        });

      return;
    }

    const customerId = this.selectedCustomerId!;

    const body: TicketInput = {
      title,
      description,
      status: this.ticketForm.status,
      priority: this.ticketForm.priority,
    };

    this.api
      .createTicketForCustomer(customerId, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.showForm = false;
          this.editing = false;
          this.selectedTicketId = null;
          this.selectedCustomerId = null;

          this.ticketForm = {
            title: '',
            description: '',
            status: 'OPEN',
            priority: 'MEDIUM',
          };

          this.toastService.success(
            'The ticket was created successfully.',
            'Ticket created',
          );

          this.loadTickets(true);
        },

        error: (err) => {
          const message = apiError(
            err,
            'Could not create ticket.',
          );

          console.error(err);

          this.error = message;
          this.loading = false;

          this.toastService.error(
            message,
            'Could not create ticket',
          );

          this.cdr.markForCheck();
        },
      });
  }

  deleteTicket(id: number): void {
    if (
      this.loading ||
      this.deletingTicketId !== null ||
      this.analyzingTicketId !== null
    ) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this ticket?',
    );

    if (!confirmed) {
      return;
    }

    this.deletingTicketId = id;
    this.error = '';

    this.api
      .deleteTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingTicketId = null;

          this.toastService.success(
            `Ticket #${id} was deleted successfully.`,
            'Ticket deleted',
          );

          this.loadTickets(true);
        },

        error: (err) => {
          const message = apiError(
            err,
            'Could not delete ticket.',
          );

          console.error(err);

          this.deletingTicketId = null;
          this.error = message;

          this.toastService.error(
            message,
            'Could not delete ticket',
          );

          this.cdr.markForCheck();
        },
      });
  }

  analyzeTicket(id: number): void {
    if (
      this.analyzingTicketId !== null ||
      this.loading ||
      this.deletingTicketId !== null
    ) {
      return;
    }

    this.analysis = null;
    this.analyzingTicketId = id;
    this.error = '';

    this.api
      .analyzeTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.analysis = result;
          this.analyzingTicketId = null;

          this.toastService.success(
            `Analysis for ticket #${id} is ready.`,
            'Analysis completed',
          );

          this.cdr.markForCheck();
        },

        error: (err) => {
          const message = apiError(
            err,
            'Could not analyze ticket.',
          );

          console.error(err);

          this.error = message;
          this.analyzingTicketId = null;

          this.toastService.error(
            message,
            'Could not analyze ticket',
          );

          this.cdr.markForCheck();
        },
      });
  }

  closeAnalysis(): void {
    this.analysis = null;
  }
}
