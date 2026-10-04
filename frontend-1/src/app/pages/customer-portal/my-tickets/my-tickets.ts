import { Component, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerPage } from '../shared/customer-page';
import { CustomerState } from '../shared/customer-state';
import { CustomerTicketCards } from '../shared/customer-ticket-cards';
import { FormsModule } from '@angular/forms';
import { CUSTOMER_STATUS_LABELS } from '../shared/customer-status';
import { Ticket, Status, STATUSES } from '../../../models/resources';
@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [RouterLink, CustomerState, CustomerTicketCards, FormsModule],
  styleUrls: ['../shared/customer-ui.css', '../shared/customer-forms.css'],
  templateUrl: './my-tickets.html',
})
export class MyTickets extends CustomerPage {
  tickets: Ticket[] = [];
  filter: Status | '' = '';
  search = '';
  readonly statuses = STATUSES;
  readonly labels = CUSTOMER_STATUS_LABELS;
  get visible(): Ticket[] { const query=this.search.trim().toLowerCase().replace(/^#/, ''); return this.tickets.filter(ticket => (!this.filter || ticket.status===this.filter) && (!query || ticket.title.toLowerCase().includes(query) || String(ticket.id).includes(query))); }
  clearFilters(): void { this.filter=''; this.search=''; }
  constructor() {
    super();
    effect(() => {
      this.user.currentCustomerId();
      this.clearFilters();
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.tickets = [];
    const id = this.user.currentCustomerId();
    if (id === null) return;
    this.loadData(
      this.api.getTicketsByCustomer(id),
      (rows) => (this.tickets = rows.filter((ticket) => ticket.customer?.id === id)),
    );
  }
}
