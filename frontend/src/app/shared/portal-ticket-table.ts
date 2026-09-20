import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ticket } from '../models/resources';
@Component({
  selector: 'app-portal-ticket-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./management.css', './workspace.css', './workspace-data.css'],
  template: `<div class="table-card">
    @if (tickets().length === 0) {
      <p class="empty-message">No tickets found.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th scope="col">ID / Title</th>
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            @if (support()) {
              <th scope="col">Customer</th>
            }
            <th scope="col">Created</th>
            <th scope="col">Updated</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (ticket of tickets(); track ticket.id) {
            <tr>
              <td>#{{ ticket.id }} — {{ ticket.title }}</td>
              <td>
                <span class="badge" [attr.data-status]="ticket.status">{{ ticket.status }}</span>
              </td>
              <td>{{ ticket.priority }}</td>
              @if (support()) {
                <td>{{ ticket.customer?.name || 'Unlinked' }}</td>
              }
              <td>{{ (ticket.createdAt | date: 'medium') || '—' }}</td>
              <td>{{ (ticket.updatedAt | date: 'medium') || '—' }}</td>
              <td>
                <a [routerLink]="[support() ? '/employee/tickets' : '/customer/tickets', ticket.id]"
                  >View Details</a
                >
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>`,
})
export class PortalTicketTable {
  tickets = input<Ticket[]>([]);
  support = input(false);
}
