import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tickets } from './tickets';
import { ToastService } from '../../shared/toast/toast.service';

describe('Tickets', () => {
  let component: Tickets;
  let fixture: ComponentFixture<Tickets>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Tickets],
    }).compileComponents();

    fixture = TestBed.createComponent(Tickets);
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
    toastService.clear();

    httpMock
      .match(() => true)
      .forEach((request) => request.flush([]));

    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tickets and customers on initialization', () => {
    expect(component.tickets).toEqual([]);
    expect(component.customers).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.customersLoading).toBe(false);
  });

  it('should open a clean create form', () => {
    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editing).toBe(false);
    expect(component.selectedTicketId).toBeNull();
    expect(component.selectedCustomerId).toBeNull();

    expect(component.ticketForm).toEqual({
      title: '',
      description: '',
      status: 'OPEN',
      priority: 'MEDIUM',
    });
  });

  it('should populate the form when editing a ticket', () => {
    const ticket = {
      id: 17,
      title: 'Login problem',
      description: 'Customer cannot log in.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      customer: {
        id: 5,
        name: 'John Doe',
        email: 'john@example.com',
      },
    } as any;

    component.editTicket(ticket);

    expect(component.showForm).toBe(true);
    expect(component.editing).toBe(true);
    expect(component.selectedTicketId).toBe(17);
    expect(component.selectedCustomerId).toBe(5);

    expect(component.ticketForm.title).toBe('Login problem');
    expect(component.ticketForm.description).toBe(
      'Customer cannot log in.',
    );
    expect(component.ticketForm.status).toBe('IN_PROGRESS');
    expect(component.ticketForm.priority).toBe('HIGH');
  });

  it('should reject creating a ticket without a title', () => {
    component.openCreateForm();

    component.ticketForm.title = '   ';
    component.ticketForm.description = 'Valid description';
    component.selectedCustomerId = 1;

    component.saveTicket();

    expect(component.error).toBe('Title is required.');
    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Title required',
    );
  });

  it('should reject creating a ticket without a description', () => {
    component.openCreateForm();

    component.ticketForm.title = 'Valid title';
    component.ticketForm.description = '   ';
    component.selectedCustomerId = 1;

    component.saveTicket();

    expect(component.error).toBe(
      'Description is required.',
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Description required',
    );
  });

  it('should require a customer when creating a ticket', () => {
    component.openCreateForm();

    component.ticketForm.title = 'Valid title';
    component.ticketForm.description = 'Valid description';
    component.selectedCustomerId = null;

    component.saveTicket();

    expect(component.error).toBe(
      'Please select a customer.',
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Customer required',
    );
  });

  it('should clear the form when canceling', () => {
    component.openCreateForm();

    component.ticketForm.title = 'Test ticket';
    component.ticketForm.description = 'Test description';
    component.selectedCustomerId = 4;

    component.cancelForm();

    expect(component.showForm).toBe(false);
    expect(component.editing).toBe(false);
    expect(component.selectedTicketId).toBeNull();
    expect(component.selectedCustomerId).toBeNull();
    expect(component.error).toBe('');
  });

  it('should show an error toast when loading tickets fails', () => {
    component.loadTickets();

    const request = httpMock.expectOne(
      'http://localhost:8080/tickets',
    );

    request.flush(
      {
        message: 'Tickets service is unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.loading).toBe(false);
    expect(component.error).toBe(
      'Could not load tickets. Tickets service is unavailable.',
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].type).toBe('error');
    expect(toastService.toasts()[0].title).toBe(
      'Could not load tickets',
    );
  });

  it('should show an error toast when loading customers fails', () => {
    component.loadCustomers();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    request.flush(
      {
        message: 'Customers service is unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.customers).toEqual([]);
    expect(component.customersLoading).toBe(false);

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Could not load customers',
    );
  });

  it('should not start another ticket load while already loading', () => {
    component.loading = true;

    component.loadTickets();

    expect(
      httpMock.match(() => true),
    ).toHaveLength(0);
  });

  it('should create a ticket for the selected customer', () => {
    component.openCreateForm();

    component.selectedCustomerId = 7;

    component.ticketForm = {
      title: 'Payment issue',
      description: 'Customer cannot complete payment.',
      status: 'OPEN',
      priority: 'HIGH',
    };

    component.saveTicket();

    const createRequest = httpMock.expectOne(
      'http://localhost:8080/tickets/customer/7',
    );

    expect(createRequest.request.method).toBe('POST');

    expect(createRequest.request.body).toEqual({
      title: 'Payment issue',
      description: 'Customer cannot complete payment.',
      status: 'OPEN',
      priority: 'HIGH',
    });

    createRequest.flush({
      id: 25,
      title: 'Payment issue',
      description: 'Customer cannot complete payment.',
      status: 'OPEN',
      priority: 'HIGH',
    });

    const reloadRequest = httpMock.expectOne(
      'http://localhost:8080/tickets',
    );

    expect(reloadRequest.request.method).toBe('GET');

    reloadRequest.flush([]);

    expect(component.showForm).toBe(false);
    expect(component.editing).toBe(false);
    expect(component.selectedTicketId).toBeNull();
    expect(component.selectedCustomerId).toBeNull();

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].type).toBe('success');
    expect(toastService.toasts()[0].title).toBe(
      'Ticket created',
    );
  });

  it('should update an existing ticket', () => {
    component.editTicket({
      id: 25,
      title: 'Old title',
      description: 'Old description',
      status: 'OPEN',
      priority: 'MEDIUM',
      customer: {
        id: 7,
        name: 'John Doe',
        email: 'john@example.com',
      },
    } as any);

    component.ticketForm.title = 'Updated title';
    component.ticketForm.description = 'Updated description';
    component.ticketForm.status = 'RESOLVED';
    component.ticketForm.priority = 'HIGH';

    component.saveTicket();

    const updateRequest = httpMock.expectOne(
      'http://localhost:8080/tickets/25',
    );

    expect(updateRequest.request.method).toBe('PUT');

    expect(updateRequest.request.body).toEqual({
      title: 'Updated title',
      description: 'Updated description',
      status: 'RESOLVED',
      priority: 'HIGH',
    });

    updateRequest.flush({
      id: 25,
      title: 'Updated title',
      description: 'Updated description',
      status: 'RESOLVED',
      priority: 'HIGH',
    });

    const reloadRequest = httpMock.expectOne(
      'http://localhost:8080/tickets',
    );

    reloadRequest.flush([]);

    expect(component.showForm).toBe(false);
    expect(component.editing).toBe(false);
    expect(component.selectedTicketId).toBeNull();

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Ticket updated',
    );
  });

  it('should delete a ticket after confirmation', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteTicket(25);

    const deleteRequest = httpMock.expectOne(
      'http://localhost:8080/tickets/25',
    );

    expect(deleteRequest.request.method).toBe('DELETE');

    deleteRequest.flush(null);

    const reloadRequest = httpMock.expectOne(
      'http://localhost:8080/tickets',
    );

    reloadRequest.flush([]);

    expect(component.deletingTicketId).toBeNull();

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Ticket deleted',
    );

    confirmSpy.mockRestore();
  });

  it('should not delete a ticket when confirmation is cancelled', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(false);

    component.deleteTicket(25);

    expect(
      httpMock.match(() => true),
    ).toHaveLength(0);

    expect(component.deletingTicketId).toBeNull();

    confirmSpy.mockRestore();
  });

  it('should show an error toast when deleting a ticket fails', () => {
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockReturnValue(true);

    component.deleteTicket(25);

    const request = httpMock.expectOne(
      'http://localhost:8080/tickets/25',
    );

    request.flush(
      {
        message: 'Ticket could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.deletingTicketId).toBeNull();
    expect(component.error).toBe(
      'Could not delete ticket. Ticket could not be deleted.',
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Could not delete ticket',
    );

    confirmSpy.mockRestore();
  });

  it('should analyze a ticket successfully', () => {
    component.analyzeTicket(25);

    expect(component.analyzingTicketId).toBe(25);

    const request = httpMock.expectOne(
      'http://localhost:8080/tickets/25/analyze',
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      category: 'Technical',
      suggestedPriority: 'HIGH',
      suggestedResponse:
        'Please restart the application and try again.',
    });

    expect(component.analyzingTicketId).toBeNull();
    expect(component.analysis).toEqual({
      category: 'Technical',
      suggestedPriority: 'HIGH',
      suggestedResponse:
        'Please restart the application and try again.',
    });

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Analysis completed',
    );
  });

  it('should show an error toast when ticket analysis fails', () => {
    component.analyzeTicket(25);

    const request = httpMock.expectOne(
      'http://localhost:8080/tickets/25/analyze',
    );

    request.flush(
      {
        message: 'Analysis service is unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.analyzingTicketId).toBeNull();
    expect(component.error).toBe(
      'Could not analyze ticket. Analysis service is unavailable.',
    );

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].title).toBe(
      'Could not analyze ticket',
    );
  });

  it('should not start another analysis while one is already running', () => {
    component.analyzingTicketId = 25;

    component.analyzeTicket(26);

    expect(
      httpMock.match(() => true),
    ).toHaveLength(0);

    expect(component.analyzingTicketId).toBe(25);
  });

  it('should close the analysis panel', () => {
    component.analysis = {
      category: 'Technical',
      suggestedPriority: 'HIGH',
      suggestedResponse:
        'Please restart the application.',
    };

    component.closeAnalysis();

    expect(component.analysis).toBeNull();
  });
});
