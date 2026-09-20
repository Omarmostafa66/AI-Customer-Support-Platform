import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomerPage } from '../shared/customer-page';
import { CustomerState } from '../shared/customer-state';
import { CustomerStatus, CUSTOMER_STATUS_LABELS } from '../shared/customer-status';
import { Ticket } from '../../../models/resources';
@Component({
  selector: 'app-customer-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerState, CustomerStatus],
  styleUrls: ['../shared/customer-ui.css', '../shared/customer-forms.css'],
  templateUrl: './ticket-details.html',
})
export class CustomerTicketDetails extends CustomerPage {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  ticket: Ticket | null = null;
  readonly labels=CUSTOMER_STATUS_LABELS;
  get steps(): string[] { return ['Submitted','In Progress',this.ticket?.status==='CLOSED' ? 'Closed' : 'Resolved']; }
  get stage():number { return this.ticket?.status==='OPEN' ? 0 : this.ticket?.status==='IN_PROGRESS' ? 1 : 2; }
  constructor() {
    super();
    effect(() => {
      this.params();
      this.user.currentCustomerId();
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.ticket = null;
    const customerId = this.user.currentCustomerId();
    if (customerId === null) return;
    const id = Number(this.params()?.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error = 'Invalid ticket reference.';
      return;
    }
    this.loadData(this.api.getTicketsByCustomer(customerId), (rows) => {
      this.ticket = rows.find((t) => t.id === id && t.customer?.id === customerId) ?? null;
    });
  }
}
