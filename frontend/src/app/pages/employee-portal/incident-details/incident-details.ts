import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, throwError } from 'rxjs';
import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';
import { Incident, Status, STATUSES } from '../../../models/resources';
@Component({
  selector: 'app-employee-incident-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PortalState],
  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './incident-details.css',
  ],
  templateUrl: './incident-details.html',
})
export class EmployeeIncidentDetails extends PortalPage {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  incident: Incident | null = null;
  status: Status = 'OPEN';
  readonly statuses = STATUSES;
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
    this.incident = null;
    const employeeId = this.user.currentEmployeeId();
    if (employeeId === null) return;
    const id = Number(this.params()?.get('id'));
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error = 'Invalid incident reference.';
      return;
    }
    this.loadData(this.api.getIncidentsByEmployee(employeeId), (rows) => {
      this.incident = rows.find((i) => i.id === id && i.employee?.id === employeeId) ?? null;
      this.status = this.incident?.status ?? 'OPEN';
    });
  }
  update(resolve = false): void {
    const employeeId = this.user.currentEmployeeId(),
      incident = this.incident,
      status = resolve ? 'RESOLVED' : this.status;
    if (employeeId === null || !incident || this.busy || this.loading) return;
    // Recheck assignment and preserve the latest sameMessage value before writing.
    // The backend still needs atomic authorization; this is only a UX check.
    const request = this.api.getIncidentsByEmployee(employeeId).pipe(
      switchMap((rows) => {
        const current = rows.find((i) => i.id === incident.id && i.employee?.id === employeeId);
        if (!current) {
          this.incident = null;
          this.notice =
            'This incident is no longer assigned to you. Refresh your assigned incidents.';
          return throwError(() => new Error('Assignment changed'));
        }
        return status === 'RESOLVED'
          ? this.api.resolveIncident(current.id)
          : this.api.updateIncident(current.id, { status, sameMessage: current.sameMessage });
      }),
    );
    this.submit(request, (updated) => {
      if (updated.employee?.id !== employeeId) {
        this.incident = null;
        this.notice = 'The incident is no longer assigned to you.';
      } else {
        this.incident = updated;
        this.status = updated.status;
        this.notice = 'Incident updated.';
      }
    });
  }
}
