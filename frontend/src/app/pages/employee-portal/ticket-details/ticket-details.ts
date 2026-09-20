import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';
import { Ticket, TicketAnalysis } from '../../../models/resources';
@Component({
  selector: 'app-employee-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterLink, PortalState],
  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './ticket-details.css',
  ],
  templateUrl: './ticket-details.html',
})
export class EmployeeTicketDetails extends PortalPage {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  ticket: Ticket | null = null;
  analysis: TicketAnalysis | null = null;
  constructor() {
    super();
    effect(() => {
      this.params();
      this.user.currentEmployeeId();
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.ticket = null;
    this.analysis = null;
    if (this.user.currentEmployeeId() === null) return;
    const id = Number(this.params()?.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error = 'Invalid ticket reference.';
      return;
    }
    this.loadData(this.api.getTicketById(id), (ticket) => (this.ticket = ticket));
  }
  analyze(): void {
    if (!this.ticket || this.busy || !this.user.currentEmployeeId()) return;
    this.analysis = null;
    this.submit(this.api.analyzeTicket(this.ticket.id), (result) => (this.analysis = result));
  }
}
