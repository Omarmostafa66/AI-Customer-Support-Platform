import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { Api } from '../../services/api';
import {
  Incident,
  IncidentInput,
  Employee,
  Category,
  Status,
  STATUSES,
} from '../../models/resources';
import { CrudPage } from '../../shared/crud-page';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incidents.html',
  styleUrls: [
    '../../shared/management.css',
    './incidents.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Incidents extends CrudPage<Incident> {
  private readonly api = inject(Api);

  readonly statuses = STATUSES;

  employees: Employee[] = [];
  categories: Category[] = [];

  employeesLoading = false;
  categoriesLoading = false;

  employeeError = '';
  categoryError = '';

  selected: Incident | null = null;
  detailLoading = false;

  assignmentEmployee: number | null = null;
  assignmentCategory: number | null = null;

  filterStatus: Status | '' = '';
  filterEmployee: number | null = null;
  filterSameMessage: boolean | null = null;

  form: {
    status: Status;
    sameMessage: boolean;
    employeeId: number | null;
    categoryId: number | null;
  } = {
    status: 'OPEN',
    sameMessage: false,
    employeeId: null,
    categoryId: null,
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadLookups();
  }

  fetchRecords(): Observable<Incident[]> {
    if (this.filterEmployee !== null) {
      return this.api.getIncidentsByEmployee(this.filterEmployee);
    }

    if (this.filterStatus) {
      return this.api.getIncidentsByStatus(this.filterStatus);
    }

    if (this.filterSameMessage !== null) {
      return this.api.getIncidentsBySameMessage(this.filterSameMessage);
    }

    return this.api.getIncidents();
  }

  get visibleRecords(): Incident[] {
    return this.records.filter(
      (record) =>
        (!this.filterStatus || record.status === this.filterStatus) &&
        (this.filterEmployee === null ||
          record.employee?.id === this.filterEmployee) &&
        (this.filterSameMessage === null ||
          record.sameMessage === this.filterSameMessage),
    );
  }

  removeRecord(id: number) {
    return this.api.deleteIncident(id);
  }

  override async deleteRecord(record: Incident): Promise<void> {
    if (
      this.busy ||
      this.loading ||
      !confirm(
        'Delete incident #' +
          record.id +
          '? This cannot be undone.',
      )
    ) {
      return;
    }

    if (this.selected?.id === record.id) {
      this.selected = null;
    }

    this.busy = true;
    this.error = '';
    this.notice = '';

    this.removeRecord(record.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy = false;
          this.notice = 'Incident deleted.';

          this.toastService.success(
            `Incident #${record.id} was deleted successfully.`,
            'Incident deleted',
          );

          this.load();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.busy = false;

          const message = apiError(
            error,
            'Could not delete incident.',
          );

          this.error = message;

          this.toastService.error(
            message,
            'Could not delete incident',
          );

          this.cdr.markForCheck();
        },
      });
  }

  resetForm(): void {
    this.form = {
      status: 'OPEN',
      sameMessage: false,
      employeeId: null,
      categoryId: null,
    };
  }

  loadLookups(): void {
    if (!this.employeesLoading) {
      this.employeesLoading = true;
      this.employeeError = '';

      this.api
        .getEmployees()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (rows) => {
            this.employees = rows;
            this.employeesLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            const message = apiError(
              error,
              'Could not load employee choices.',
            );

            this.employeeError = message;
            this.employeesLoading = false;

            this.toastService.error(
              message,
              'Could not load employees',
            );

            this.cdr.markForCheck();
          },
        });
    }

    if (!this.categoriesLoading) {
      this.categoriesLoading = true;
      this.categoryError = '';

      this.api
        .getCategories()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (rows) => {
            this.categories = rows;
            this.categoriesLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            const message = apiError(
              error,
              'Could not load category choices.',
            );

            this.categoryError = message;
            this.categoriesLoading = false;

            this.toastService.error(
              message,
              'Could not load categories',
            );

            this.cdr.markForCheck();
          },
        });
    }
  }

  edit(record: Incident): void {
    if (this.busy || this.loading || this.detailLoading) {
      return;
    }

    this.editingId = record.id;

    this.form = {
      status: record.status,
      sameMessage: record.sameMessage,
      employeeId: null,
      categoryId: null,
    };

    this.showForm = true;
    this.error = '';
    this.notice = '';
    this.selected = null;
  }

  save(): void {
    if (this.busy || this.loading) {
      return;
    }

    const body: IncidentInput = {
      status: this.form.status,
      sameMessage: this.form.sameMessage,
    };

    if (this.editingId !== null) {
      this.selected = null;

      this.saveRequest(
        this.api.updateIncident(
          this.editingId,
          body,
        ),
      );

      return;
    }

    if (this.form.categoryId !== null) {
      body.category = {
        id: this.form.categoryId,
      };
    }

    this.saveRequest(
      this.form.employeeId !== null
        ? this.api.createIncidentForEmployee(
            this.form.employeeId,
            body,
          )
        : this.api.createIncident(body),
    );
  }

  view(record: Incident): void {
    if (
      this.detailLoading ||
      this.busy ||
      this.loading
    ) {
      return;
    }

    this.detailLoading = true;
    this.error = '';
    this.notice = '';
    this.selected = null;

    this.api
      .getIncidentById(record.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (incident) => {
          this.selected = incident;
          this.assignmentEmployee = null;
          this.assignmentCategory = null;
          this.detailLoading = false;

          this.cdr.markForCheck();
        },
        error: (error) => {
          const message = apiError(
            error,
            'Could not load incident details.',
          );

          this.error = message;
          this.detailLoading = false;

          this.toastService.error(
            message,
            'Could not load incident',
          );

          this.cdr.markForCheck();
        },
      });
  }

  private action(request: Observable<Incident>): void {
    if (this.busy || this.loading || this.detailLoading) {
      return;
    }

    this.busy = true;
    this.error = '';
    this.notice = '';

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (incident) => {
          this.selected = incident;
          this.busy = false;

          this.assignmentEmployee = null;
          this.assignmentCategory = null;

          this.notice = 'Incident updated.';

          this.toastService.success(
            `Incident #${incident.id} was updated successfully.`,
            'Incident updated',
          );

          this.load();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.busy = false;

          const message = apiError(
            error,
            'Could not update incident.',
          );

          this.error = message;

          this.toastService.error(
            message,
            'Could not update incident',
          );

          this.cdr.markForCheck();
        },
      });
  }

  assignEmployee(): void {
    if (
      this.selected &&
      this.assignmentEmployee !== null
    ) {
      this.action(
        this.api.assignIncident(
          this.selected.id,
          this.assignmentEmployee,
        ),
      );
    }
  }

  assignCategory(): void {
    if (
      this.selected &&
      this.assignmentCategory !== null
    ) {
      this.action(
        this.api.assignIncidentCategory(
          this.selected.id,
          this.assignmentCategory,
        ),
      );
    }
  }

  resolve(record: Incident): void {
    if (
      this.busy ||
      this.loading ||
      this.detailLoading ||
      record.status === 'RESOLVED' ||
      record.status === 'CLOSED'
    ) {
      return;
    }

    this.action(
      this.api.resolveIncident(record.id),
    );
  }
}
