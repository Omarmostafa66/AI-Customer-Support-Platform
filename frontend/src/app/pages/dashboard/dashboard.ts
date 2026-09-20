import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, Observable, of } from 'rxjs';

import { Api } from '../../services/api';
import { Ticket } from '../../models/resources';
import { apiError } from '../../shared/api-error';
import { ToastService } from '../../shared/toast/toast.service';

interface SummaryCard {
  label: string;
  count: number | null;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../shared/management.css',
    './dashboard.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Dashboard implements OnInit {
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  loading = false;
  errors: string[] = [];
  cards: SummaryCard[] = [];
  recentTickets: Ticket[] = [];
  ticketsAvailable = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  private available<T>(
    request: Observable<T[]>,
    resource: string,
  ): Observable<T[] | null> {
    return request.pipe(
      catchError((error) => {
        const message = apiError(
          error,
          'Could not load ' + resource + '.',
        );

        this.errors.push(message);

        this.toastService.error(
          message,
          'Could not load ' + resource,
        );

        return of(null);
      }),
    );
  }

  loadDashboard(): void {
    if (this.loading) return;

    this.loading = true;
    this.errors = [];

    forkJoin({
      tickets: this.available(
        this.api.getTickets(),
        'tickets',
      ),
      customers: this.available(
        this.api.getCustomers(),
        'customers',
      ),
      incidents: this.available(
        this.api.getIncidents(),
        'incidents',
      ),
      employees: this.available(
        this.api.getEmployees(),
        'employees',
      ),
      categories: this.available(
        this.api.getCategories(),
        'categories',
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.cards = [
          {
            label: 'Total Tickets',
            count: data.tickets?.length ?? null,
            route: '/tickets',
          },
          {
            label: 'Open Tickets',
            count:
              data.tickets?.filter(
                (t) => t.status === 'OPEN',
              ).length ?? null,
            route: '/tickets',
          },
          {
            label: 'In Progress Tickets',
            count:
              data.tickets?.filter(
                (t) => t.status === 'IN_PROGRESS',
              ).length ?? null,
            route: '/tickets',
          },
          {
            label: 'Resolved Tickets',
            count:
              data.tickets?.filter(
                (t) => t.status === 'RESOLVED',
              ).length ?? null,
            route: '/tickets',
          },
          {
            label: 'Customers',
            count: data.customers?.length ?? null,
            route: '/customers',
          },
          {
            label: 'Open Incidents',
            count:
              data.incidents?.filter(
                (i) => i.status === 'OPEN',
              ).length ?? null,
            route: '/incidents',
          },
          {
            label: 'Employees',
            count: data.employees?.length ?? null,
            route: '/employees',
          },
          {
            label: 'Categories',
            count: data.categories?.length ?? null,
            route: '/categories',
          },
        ];

        this.ticketsAvailable = data.tickets !== null;

        this.recentTickets = [...(data.tickets ?? [])]
          .filter((t) => t.updatedAt || t.createdAt)
          .sort((a, b) =>
            (
              b.updatedAt ||
              b.createdAt ||
              ''
            ).localeCompare(
              a.updatedAt ||
                a.createdAt ||
                '',
            ),
          )
          .slice(0, 5);

        this.loading = false;
        this.cdr.markForCheck();
      });
  }
}
