import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Incidents } from './incidents';
import { ToastService } from '../../shared/toast/toast.service';
import { Incident, Category, Employee } from '../../models/resources';

describe('Incidents', () => {
  let component: Incidents;
  let fixture: ComponentFixture<Incidents>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;

  const category: Category = {
    id: 7,
    name: 'Technical Support',
    description: 'Technical support incidents',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const employee: Employee = {
    id: 3,
    name: 'Support Employee',
    email: 'employee@example.com',
    role: 'SUPPORT',
    age: 30,
    gender: 'MALE',
    salary: 5000,
  };

  const incident: Incident = {
    id: 25,
    status: 'OPEN',
    sameMessage: true,
    fingerprint: 'fp-123',
    createdAt: '2026-09-19T10:00:00',
    resolvedAt: null,
    employee,
    category,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Incidents],
    }).compileComponents();

    fixture = TestBed.createComponent(Incidents);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);

    fixture.detectChanges();

    httpMock
      .match(() => true)
      .forEach((request) => request.flush([]));

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  function flushInitialRequests(): void {
    httpMock
      .match(() => true)
      .forEach((request) => request.flush([]));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load incidents and lookup data on initialization', () => {
    expect(component.loaded).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.employeesLoading).toBe(false);
    expect(component.categoriesLoading).toBe(false);
  });

  it('should reset the create form', () => {
    component.form = {
      status: 'CLOSED',
      sameMessage: true,
      employeeId: 3,
      categoryId: 7,
    };

    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.form).toEqual({
      status: 'OPEN',
      sameMessage: false,
      employeeId: null,
      categoryId: null,
    });
  });

  it('should populate the edit form', () => {
    component.edit(incident);

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(25);

    expect(component.form).toEqual({
      status: 'OPEN',
      sameMessage: true,
      employeeId: null,
      categoryId: null,
    });
  });

  it('should create an unassigned incident', () => {
    component.openCreateForm();

    component.form = {
      status: 'OPEN',
      sameMessage: true,
      employeeId: null,
      categoryId: null,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      status: 'OPEN',
      sameMessage: true,
    });

    request.flush(incident);

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([incident]);

    expect(component.showForm).toBe(false);
    expect(component.busy).toBe(false);
    expect(component.records).toEqual([incident]);
  });

  it('should create an incident for an employee with a category', () => {
    component.openCreateForm();

    component.form = {
      status: 'OPEN',
      sameMessage: false,
      employeeId: 3,
      categoryId: 7,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/employee/3',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      status: 'OPEN',
      sameMessage: false,
      category: {
        id: 7,
      },
    });

    request.flush(incident);

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([incident]);

    expect(component.showForm).toBe(false);
    expect(component.busy).toBe(false);
  });

  it('should update an existing incident', () => {
    component.edit(incident);

    component.form.status = 'IN_PROGRESS';
    component.form.sameMessage = false;

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25',
    );

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual({
      status: 'IN_PROGRESS',
      sameMessage: false,
    });

    request.flush({
      ...incident,
      status: 'IN_PROGRESS',
      sameMessage: false,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);

    expect(component.showForm).toBe(false);
    expect(component.busy).toBe(false);
  });

  it('should load incident details', () => {
    component.view(incident);

    expect(component.detailLoading).toBe(true);

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25',
    );

    expect(request.request.method).toBe('GET');

    request.flush(incident);

    expect(component.detailLoading).toBe(false);
    expect(component.selected).toEqual(incident);
    expect(component.assignmentEmployee).toBeNull();
    expect(component.assignmentCategory).toBeNull();
  });

  it('should show a toast when incident details fail to load', () => {
    component.view(incident);

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25',
    );

    request.flush(
      {
        message: 'Incident details unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.detailLoading).toBe(false);
    expect(component.error).toContain(
      'Incident details unavailable.',
    );

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'error');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Could not load incident');
  });

  it('should assign an employee', () => {
    component.selected = incident;
    component.assignmentEmployee = 3;

    component.assignEmployee();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25/assign/3',
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({});

    request.flush({
      ...incident,
      employee,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);

    expect(component.selected?.employee).toEqual(employee);
    expect(component.assignmentEmployee).toBeNull();
    expect(component.busy).toBe(false);

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'success');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Incident updated');
  });

  it('should not assign an employee when no employee is selected', () => {
    component.selected = incident;
    component.assignmentEmployee = null;

    component.assignEmployee();

    httpMock.expectNone(
      'http://localhost:8080/incidents/25/assign/3',
    );

    expect(component.busy).toBe(false);
  });

  it('should assign a category', () => {
    component.selected = incident;
    component.assignmentCategory = 7;

    component.assignCategory();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25/category/7',
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({});

    request.flush({
      ...incident,
      category,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);

    expect(component.selected?.category).toEqual(category);
    expect(component.assignmentCategory).toBeNull();
    expect(component.busy).toBe(false);
  });

  it('should not assign a category when no category is selected', () => {
    component.selected = incident;
    component.assignmentCategory = null;

    component.assignCategory();

    httpMock.expectNone(
      'http://localhost:8080/incidents/25/category/7',
    );

    expect(component.busy).toBe(false);
  });

  it('should resolve an open incident', () => {
    component.resolve(incident);

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25/resolve',
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({});

    request.flush({
      ...incident,
      status: 'RESOLVED',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);

    expect(component.selected?.status).toBe('RESOLVED');
    expect(component.busy).toBe(false);
  });

  it('should not resolve an already resolved incident', () => {
    const resolvedIncident: Incident = {
      ...incident,
      status: 'RESOLVED',
    };

    component.resolve(resolvedIncident);

    httpMock.expectNone(
      'http://localhost:8080/incidents/25/resolve',
    );

    expect(component.busy).toBe(false);
  });

  it('should not resolve a closed incident', () => {
    const closedIncident: Incident = {
      ...incident,
      status: 'CLOSED',
    };

    component.resolve(closedIncident);

    httpMock.expectNone(
      'http://localhost:8080/incidents/25/resolve',
    );

    expect(component.busy).toBe(false);
  });

  it('should show a toast when an incident action fails', () => {
    component.resolve(incident);

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25/resolve',
    );

    request.flush(
      {
        message: 'Incident could not be resolved.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Incident could not be resolved.',
    );

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'error');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Could not update incident');
  });

  it('should show a toast when employee lookup fails', () => {
    component.loadLookups();

    const employeeRequest = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    employeeRequest.flush(
      {
        message: 'Employee service unavailable.',
      },
      {
        status: 503,
        statusText: 'Service Unavailable',
      },
    );

    const categoryRequest = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    categoryRequest.flush([]);

    expect(component.employeesLoading).toBe(false);
    expect(component.employeeError).toContain(
      'Employee service unavailable.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not load employees',
      );

    expect(toast).toBeTruthy();
  });

  it('should show a toast when category lookup fails', () => {
    component.loadLookups();

    const employeeRequest = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    employeeRequest.flush([]);

    const categoryRequest = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    categoryRequest.flush(
      {
        message: 'Category service unavailable.',
      },
      {
        status: 503,
        statusText: 'Service Unavailable',
      },
    );

    expect(component.categoriesLoading).toBe(false);
    expect(component.categoryError).toContain(
      'Category service unavailable.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not load categories',
      );

    expect(toast).toBeTruthy();
  });

  it('should filter visible records by status', () => {
    const records: Incident[] = [
      incident,
      {
        ...incident,
        id: 26,
        status: 'RESOLVED',
      },
    ];

    component.records = records;

    component.filterStatus = 'OPEN';

    expect(component.visibleRecords).toEqual([
      incident,
    ]);
  });

  it('should filter visible records by employee', () => {
    const otherEmployee: Employee = {
      id: 9,
      name: 'Other Employee',
      email: 'other@example.com',
      role: 'SUPPORT',
      age: 28,
      gender: 'FEMALE',
      salary: 5500,
    };

    const records: Incident[] = [
      incident,
      {
        ...incident,
        id: 26,
        employee: otherEmployee,
      },
    ];

    component.records = records;

    component.filterEmployee = 3;

    expect(component.visibleRecords).toEqual([
      incident,
    ]);
  });

  it('should filter visible records by same-message flag', () => {
    const records: Incident[] = [
      incident,
      {
        ...incident,
        id: 26,
        sameMessage: false,
      },
    ];

    component.records = records;

    component.filterSameMessage = true;

    expect(component.visibleRecords).toEqual([
      incident,
    ]);
  });

  it('should ignore duplicate detail requests', () => {
    component.view(incident);
    component.view(incident);

    const requests = httpMock.match(
      'http://localhost:8080/incidents/25',
    );

    expect(requests.length).toBe(1);

    requests[0].flush(incident);
  });

  it('should ignore duplicate actions while busy', () => {
    component.resolve(incident);
    component.resolve(incident);

    const requests = httpMock.match(
      'http://localhost:8080/incidents/25/resolve',
    );

    expect(requests.length).toBe(1);

    requests[0].flush({
      ...incident,
      status: 'RESOLVED',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);
  });

  it('should not save while another operation is busy', () => {
    component.busy = true;

    component.save();

    httpMock.expectNone(
      'http://localhost:8080/incidents',
    );

    expect(component.busy).toBe(true);
  });

  it('should not edit while the page is loading', () => {
    component.loading = true;

    component.edit(incident);

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBeNull();
  });

  it('should keep selected incident when delete confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.selected = incident;
    component.records = [incident];

    component.deleteRecord(incident);

    expect(component.selected).toEqual(incident);
    expect(component.busy).toBe(false);

    httpMock.expectNone(
      'http://localhost:8080/incidents/25',
    );
  });

  it('should delete an incident after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.selected = incident;
    component.records = [incident];

    component.deleteRecord(incident);

    expect(component.selected).toBeNull();

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25',
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const reload = httpMock.expectOne(
      'http://localhost:8080/incidents',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.records).toEqual([]);

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'success');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Incident deleted');
  });

  it('should show a toast when deleting an incident fails', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.records = [incident];

    component.deleteRecord(incident);

    const request = httpMock.expectOne(
      'http://localhost:8080/incidents/25',
    );

    request.flush(
      {
        message: 'Incident could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Incident could not be deleted.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not delete incident',
      );

    expect(toast).toBeTruthy();
  });
});
