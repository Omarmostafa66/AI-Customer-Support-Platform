import {
  Component,
  OnDestroy,
  input,
  signal,
} from '@angular/core';
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
            <th scope="col">SLA</th>

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
                <span
                  class="badge"
                  [attr.data-status]="ticket.status"
                >
                  {{ ticket.status }}
                </span>
              </td>

              <td>{{ ticket.priority }}</td>

              <td>
                <div class="sla-cell">

                  <span
                    class="badge sla-badge"
                    [attr.data-sla-status]="ticket.slaStatus"
                  >
                    {{
                      ticket.slaStatus === 'WITHIN_SLA'
                        ? 'Within SLA'
                        : ticket.slaStatus === 'BREACHED'
                          ? 'Breached'
                          : ticket.slaStatus === 'RESOLVED_WITHIN_SLA'
                            ? 'Resolved'
                            : ticket.slaStatus === 'RESOLVED_AFTER_SLA'
                              ? 'Resolved Late'
                              : '—'
                    }}
                  </span>

                  @if (ticket.slaStatus === 'WITHIN_SLA') {
                    <span class="sla-time sla-time-within">
                      {{ getSlaTimeText(ticket) }}
                    </span>
                  }

                  @if (ticket.slaStatus === 'BREACHED') {
                    <span class="sla-time sla-time-breached">
                      {{ getSlaTimeText(ticket) }}
                    </span>
                  }

                  @if (ticket.slaStatus === 'RESOLVED_WITHIN_SLA') {
                    <span class="sla-time sla-time-resolved">
                      Resolved within SLA
                    </span>
                  }

                  @if (ticket.slaStatus === 'RESOLVED_AFTER_SLA') {
                    <span class="sla-time sla-time-late">
                      Resolved after SLA
                    </span>
                  }

                </div>
              </td>

              @if (support()) {
                <td>
                  {{ ticket.customer?.name || 'Unlinked' }}
                </td>
              }

              <td>
                {{ (ticket.createdAt | date: 'medium') || '—' }}
              </td>

              <td>
                {{ (ticket.updatedAt | date: 'medium') || '—' }}
              </td>

              <td>
                <a
                  [routerLink]="[
                    support()
                      ? '/employee/tickets'
                      : '/customer/tickets',
                    ticket.id
                  ]"
                >
                  View Details
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>`,
})
export class PortalTicketTable implements OnDestroy {

  tickets = input<Ticket[]>([]);
  support = input(false);

  /*
   * Current time used by the SLA countdown.
   * It updates every second so the remaining time
   * changes automatically without refreshing the page.
   */
  private readonly currentTime = signal(Date.now());

  private readonly timerId = window.setInterval(() => {
    this.currentTime.set(Date.now());
  }, 1000);

  getSlaTimeText(ticket: Ticket): string {

    if (!ticket.slaDueAt) {
      return 'Time unavailable';
    }

    const dueAt =
      new Date(ticket.slaDueAt).getTime();

    const now =
      this.currentTime();

    const difference =
      dueAt - now;

    /*
     * SLA is still active.
     */
    if (difference > 0) {

      return `${this.formatDuration(difference)} left`;
    }

    /*
     * SLA has been breached.
     */
    return `${this.formatDuration(Math.abs(difference))} overdue`;
  }

  private formatDuration(
    milliseconds: number
  ): string {

    const totalMinutes =
      Math.floor(
        milliseconds / (1000 * 60)
      );

    const days =
      Math.floor(totalMinutes / (60 * 24));

    const hours =
      Math.floor(
        (totalMinutes % (60 * 24)) / 60
      );

    const minutes =
      totalMinutes % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timerId);
  }
}
