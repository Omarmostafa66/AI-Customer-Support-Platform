import { Component, effect } from '@angular/core';
import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';
import { PortalTicketTable } from '../../../shared/portal-ticket-table';
import { Ticket } from '../../../models/resources';
@Component({
  selector: 'app-employee-tickets',
  standalone: true,
  imports: [PortalState, PortalTicketTable],
  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './tickets.css',
  ],
  templateUrl: './tickets.html',
})
export class EmployeeTickets extends PortalPage {
  tickets: Ticket[] = [];
  constructor() {
    super();
    effect(() => {
      this.user.currentEmployeeId();
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.tickets = [];
    if (this.user.currentEmployeeId() === null) return;
    this.loadData(this.api.getTickets(), (rows) => (this.tickets = rows));
  }
}
