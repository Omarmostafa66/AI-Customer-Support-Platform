import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Customers } from './customers/customers';
import { Categories } from './categories/categories';
import { Employees } from './employees/employees';
import { Incidents } from './incidents/incidents';
import { Messages } from './messages/messages';
import { Dashboard } from './dashboard/dashboard';
import { Incident } from '../models/resources';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { vi } from 'vitest';

describe('Management workflows', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });
  const customer = {
    id: 8,
    name: 'Customer',
    email: 'customer@example.test',
    phoneNumber: '123',
    address: 'Office',
    gender: 'Other',
    age: 30,
  };
  const incident: Incident = {
    id: 12,
    status: 'OPEN',
    sameMessage: false,
    fingerprint: 'test',
    createdAt: null,
    resolvedAt: null,
    employee: null,
    category: null,
  };
  it('requires a replacement password when editing a customer and resets after saving', () => {
    const fixture = TestBed.createComponent(Customers);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/customers').flush([customer]);
    const page = fixture.componentInstance;
    page.edit(customer);
    page.save();
    expect(page.error).toContain('required');
    http.expectNone((req) => req.method === 'PUT');
    page.form.password = 'replacement';
    page.save();
    const req = http.expectOne('http://localhost:8080/customers/8');
    expect(req.request.body.password).toBe('replacement');
    expect(req.request.body.id).toBeUndefined();
    req.flush(customer);
    http.expectOne('http://localhost:8080/customers').flush([customer]);
    expect(page.showForm).toBe(false);
    expect(page.form.password).toBe('');
    expect(page.busy).toBe(false);
  });
  it('preserves a category draft after failure and allows retry', () => {
    const fixture = TestBed.createComponent(Categories);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/categories').flush([]);
    const page = fixture.componentInstance;
    page.openCreateForm();
    page.form = { name: 'Billing', description: 'Questions' };
    page.save();
    http
      .expectOne('http://localhost:8080/categories')
      .flush({}, { status: 500, statusText: 'Error' });
    expect(page.busy).toBe(false);
    expect(page.showForm).toBe(true);
    expect(page.form.name).toBe('Billing');
    expect(page.error).toContain('Could not save');
  });
  it('shows a CORS/network failure without an empty-success state and recovers on refresh', () => {
    const fixture = TestBed.createComponent(Employees);
    fixture.detectChanges();
    http.expectOne('http://localhost:8080/employees').error(new ProgressEvent('error'));
    const page = fixture.componentInstance;
    expect(page.loading).toBe(false);
    expect(page.loaded).toBe(false);
    expect(page.error).toContain('CORS');
    page.load();
    http.expectOne('http://localhost:8080/employees').flush([]);
    expect(page.loaded).toBe(true);
    expect(page.error).toBe('');
  });
  it('requires delete confirmation and finishes a failed deletion', async () => {
    const fixture = TestBed.createComponent(Customers);
    fixture.detectChanges();

    http
      .expectOne('http://localhost:8080/customers')
      .flush([customer]);

    const page = fixture.componentInstance;

    const confirmDialog = TestBed.inject(
      ConfirmDialogService,
    );

    const confirmSpy = vi
      .spyOn(confirmDialog, 'confirm')
      .mockResolvedValue(false);

    await page.deleteRecord(customer);

    expect(confirmSpy).toHaveBeenCalled();

    http.expectNone((req) => req.method === 'DELETE');

    confirmSpy.mockResolvedValue(true);

    await page.deleteRecord(customer);

    http
      .expectOne('http://localhost:8080/customers/8')
      .flush(
        {},
        {
          status: 409,
          statusText: 'Conflict',
        },
      );

    expect(page.busy).toBe(false);
    expect(page.records).toHaveLength(1);
  });
  it('creates an incident using selected relationship IDs and edits only supported fields', () => {
    const fixture = TestBed.createComponent(Incidents);
    fixture.detectChanges();
    http.match((req) => req.method === 'GET').forEach((req) => req.flush([]));
    const page = fixture.componentInstance;
    page.openCreateForm();
    page.form = { status: 'OPEN', sameMessage: true, employeeId: 7, categoryId: 4 };
    page.save();
    const create = http.expectOne('http://localhost:8080/incidents/employee/7');
    expect(create.request.body).toEqual({ status: 'OPEN', sameMessage: true, category: { id: 4 } });
    create.flush(incident);
    http.expectOne('http://localhost:8080/incidents').flush([incident]);
    page.edit(incident);
    page.form.status = 'IN_PROGRESS';
    page.save();
    const update = http.expectOne('http://localhost:8080/incidents/12');
    expect(update.request.body).toEqual({ status: 'IN_PROGRESS', sameMessage: false });
    update.flush(incident);
    http.expectOne('http://localhost:8080/incidents').flush([incident]);
  });
  it('combines incident filters without inventing a combined endpoint', () => {
    const fixture = TestBed.createComponent(Incidents);
    fixture.detectChanges();
    http.match(() => true).forEach((req) => req.flush([]));
    const page = fixture.componentInstance;
    page.filterStatus = 'OPEN';
    page.filterSameMessage = true;
    page.load();
    http
      .expectOne('http://localhost:8080/incidents/status/OPEN')
      .flush([incident, { ...incident, id: 13, sameMessage: true }]);
    expect(page.visibleRecords.map((row) => row.id)).toEqual([13]);
  });
  it('edits message text without trying to reassign its customer', () => {
    const fixture = TestBed.createComponent(Messages);
    fixture.detectChanges();
    http.match(() => true).forEach((req) => req.flush([]));
    const page = fixture.componentInstance;
    page.edit({ id: 3, txt: 'Before', customer, createdAt: null });
    page.form.txt = 'After';
    page.save();
    const req = http.expectOne('http://localhost:8080/messages/3');
    expect(req.request.body).toEqual({ txt: 'After' });
    req.flush({});
    http.expectOne('http://localhost:8080/messages').flush([]);
    expect(page.showForm).toBe(false);
  });
  it('waits for every dashboard resource and distinguishes unavailable from zero', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    http.expectOne('http://localhost:8080/tickets').flush([
      { id: 1, title: 'Earlier', status: 'OPEN', updatedAt: '2026-01-01T10:00:00' },
      { id: 2, title: 'Later', status: 'RESOLVED', updatedAt: '2026-01-02T10:00:00' },
    ]);
    http.expectOne('http://localhost:8080/customers').flush([]);
    http.expectOne('http://localhost:8080/incidents').flush([]);
    http.expectOne('http://localhost:8080/employees').error(new ProgressEvent('error'));
    expect(page.loading).toBe(true);
    http.expectOne('http://localhost:8080/categories').flush([]);
    expect(page.loading).toBe(false);
    expect(page.cards.find((c) => c.label === 'Employees')?.count).toBeNull();
    expect(page.cards.find((c) => c.label === 'Customers')?.count).toBe(0);
    expect(page.recentTickets.map((t) => t.id)).toEqual([2, 1]);
  });
});
