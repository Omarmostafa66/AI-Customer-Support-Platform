import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { vi } from 'vitest';

import { Messages } from './messages';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import {
  Message,
  Customer,
} from '../../models/resources';

describe('Messages', () => {
  let component: Messages;
  let fixture: ComponentFixture<Messages>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;
  let confirmDialogService: ConfirmDialogService;

  const customer: Customer = {
    id: 17,
    name: 'Test Customer',
    email: 'customer@example.com',
    phoneNumber: '01000000000',
    address: 'Cairo',
    gender: 'MALE',
    age: 25,
  };

  const message: Message = {
    id: 25,
    txt: 'I need help with my account.',
    createdAt: '2026-09-19T10:00:00Z',
    customer,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Messages],
    }).compileComponents();

    fixture = TestBed.createComponent(Messages);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);
    confirmDialogService = TestBed.inject(ConfirmDialogService);

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages and customers on initialization', () => {
    expect(component.loaded).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.customersLoading).toBe(false);
  });

  it('should reset the create form', () => {
    component.form = {
      txt: 'Old message',
      customerId: 17,
    };

    component.editingCustomer = 'Old Customer';

    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBeNull();

    expect(component.form).toEqual({
      txt: '',
      customerId: null,
    });

    expect(component.editingCustomer).toBe('');
  });

  it('should populate the edit form and preserve customer association', () => {
    component.edit(message);

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(25);

    expect(component.form).toEqual({
      txt: message.txt,
      customerId: 17,
    });

    expect(component.editingCustomer).toBe(
      'Test Customer — customer@example.com',
    );
  });

  it('should edit a message without allowing customer reassignment', () => {
    component.edit(message);

    component.form.customerId = 99;
    component.form.txt = 'Updated message';

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/messages/25',
    );

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual({
      txt: 'Updated message',
    });

    request.flush({
      ...message,
      txt: 'Updated message',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
  });

  it('should validate empty message text', () => {
    component.openCreateForm();

    component.form.txt = '    ';

    component.save();

    expect(component.error).toBe(
      'Message text is required.',
    );

    expect(component.busy).toBe(false);

    httpMock.expectNone(
      'http://localhost:8080/messages',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'warning' &&
          item.title === 'Missing message text',
      );

    expect(toast).toBeTruthy();
  });

  it('should create an unlinked message', () => {
    component.openCreateForm();

    component.form = {
      txt: '  New customer message  ',
      customerId: null,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      txt: 'New customer message',
    });

    request.flush(message);

    const reload = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    reload.flush([message]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
    expect(component.records).toEqual([message]);
  });

  it('should create a message for a selected customer', () => {
    component.openCreateForm();

    component.form = {
      txt: '  Customer-specific message  ',
      customerId: 17,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/messages/customer/17',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      txt: 'Customer-specific message',
    });

    request.flush(message);

    const reload = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    reload.flush([message]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
  });

  it('should show a toast when loading messages fails', () => {
    component.load();

    const request = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    request.flush(
      {
        message: 'Messages service unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.loading).toBe(false);
    expect(component.loaded).toBe(false);

    expect(component.error).toContain(
      'Messages service unavailable.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not load records',
      );

    expect(toast).toBeTruthy();
  });

  it('should show a toast when customer lookup fails', () => {
    component.loadCustomers();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    request.flush(
      {
        message: 'Customer service unavailable.',
      },
      {
        status: 503,
        statusText: 'Service Unavailable',
      },
    );

    expect(component.customersLoading).toBe(false);

    expect(component.customerError).toContain(
      'Customer service unavailable.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not load customers',
      );

    expect(toast).toBeTruthy();
  });

  it('should ignore duplicate customer lookup requests', () => {
    component.loadCustomers();
    component.loadCustomers();

    const requests = httpMock.match(
      'http://localhost:8080/customers',
    );

    expect(requests.length).toBe(1);

    requests[0].flush([]);
  });

  it('should ignore duplicate message loading requests', () => {
    component.load();
    component.load();

    const requests = httpMock.match(
      'http://localhost:8080/messages',
    );

    expect(requests.length).toBe(1);

    requests[0].flush([]);
  });

  it('should not save while busy', () => {
    component.busy = true;

    component.form.txt = 'Blocked message';

    component.save();

    httpMock.expectNone(
      'http://localhost:8080/messages',
    );

    expect(component.busy).toBe(true);
  });

  it('should not save while loading', () => {
    component.loading = true;

    component.form.txt = 'Blocked message';

    component.save();

    httpMock.expectNone(
      'http://localhost:8080/messages',
    );

    expect(component.loading).toBe(true);
  });

  it('should not edit while the page is loading', () => {
    component.loading = true;

    component.edit(message);

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBeNull();
  });

  it('should delete a message successfully', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    component.records = [message];

    await component.deleteRecord(message);

    const request = httpMock.expectOne(
      'http://localhost:8080/messages/25',
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const reload = httpMock.expectOne(
      'http://localhost:8080/messages',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.records).toEqual([]);

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'success' &&
          item.title === 'Record deleted',
      );

    expect(toast).toBeTruthy();
  });

  it('should keep the message when delete is cancelled', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(false);

    component.records = [message];

    await component.deleteRecord(message);

    expect(component.records).toEqual([message]);
    expect(component.busy).toBe(false);

    httpMock.expectNone(
      'http://localhost:8080/messages/25',
    );
  });

  it('should show a toast when deleting a message fails', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    component.records = [message];

    await component.deleteRecord(message);

    const request = httpMock.expectOne(
      'http://localhost:8080/messages/25',
    );

    request.flush(
      {
        message: 'Message could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);

    expect(component.error).toContain(
      'Message could not be deleted.',
    );

    const toast = toastService
      .toasts()
      .find(
        (item) =>
          item.type === 'error' &&
          item.title === 'Could not delete record',
      );

    expect(toast).toBeTruthy();
  });

  it('should load customer choices after refresh', () => {
    component.loadCustomers();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    request.flush([customer]);

    expect(component.customers).toEqual([customer]);
    expect(component.customersLoading).toBe(false);
  });

  it('should not load customers while busy', () => {
    component.busy = true;

    component.loadCustomers();

    httpMock.expectNone(
      'http://localhost:8080/customers',
    );

    expect(component.customersLoading).toBe(false);
  });

  it('should preserve the customer display when editing an unlinked message', () => {
    const unlinkedMessage: Message = {
      ...message,
      customer: null,
    };

    component.edit(unlinkedMessage);

    expect(component.form.customerId).toBeNull();
    expect(component.editingCustomer).toBe(
      'No customer linked',
    );
  });
});
