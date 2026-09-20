import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';
import { PortalIncidentTable } from '../../../shared/portal-incident-table';
import { Incident, Status, STATUSES } from '../../../models/resources';
@Component({
  selector: 'app-employee-assigned-incidents',
  standalone: true,
  imports: [FormsModule, PortalState, PortalIncidentTable],
  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './assigned-incidents.css',
  ],
  templateUrl: './assigned-incidents.html',
})
export class AssignedIncidents extends PortalPage {
  incidents: Incident[] = [];
  readonly statuses = STATUSES;
  status: Status | '' = '';
  categoryId: number | null = null;
  constructor() {
    super();
    effect(() => {
      this.user.currentEmployeeId();
      this.status = '';
      this.categoryId = null;
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.incidents = [];
    const id = this.user.currentEmployeeId();
    if (id === null) return;
    this.loadData(
      this.api.getIncidentsByEmployee(id),
      (rows) => (this.incidents = rows.filter((i) => i.employee?.id === id)),
    );
  }
  get visible(): Incident[] {
    return this.incidents.filter(
      (i) =>
        (!this.status || i.status === this.status) &&
        (this.categoryId === null || i.category?.id === this.categoryId),
    );
  }
  get categories() {
    return [
      ...new Map(
        this.incidents.flatMap((i) => (i.category ? [[i.category.id, i.category] as const] : [])),
      ).values(),
    ];
  }
}
