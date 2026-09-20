import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Customers } from './customers';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';

describe('Customers', () => {
  let component: Customers;
  let fixture: ComponentFixture<Customers>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;
  let confirmDialogService: ConfirmDialogService;

  const customer = {
    id: 1,
    name: 'Omar Mostafa',
    email: 'omar@example.com',
    phoneNumber: '01000000000',
    address: 'Cairo',
    gender: 'Male',
    age: 22,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Customers],
    }).compileComponents();

    fixture = TestBed.createComponent(Customers);
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

  function validForm(): void {
    component.form = {
      name: 'Omar Mostafa',
      email: 'omar@example.com',
      password: 'Password@123',
      phoneNumber: '01000000000',
      address: 'Cairo',
      gender: 'Male',
      age: 22,
    };
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on initialization', () => {
    expect(component.loaded).toBe(true);
    expect(component.records).toEqual([]);
    expect(component.loading).toBe(false);
  });

  it('should open create form with an empty form', () => {
    component.form.name = 'Old value';

    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBeNull();
    expect(component.form.name).toBe('');
    expect(component.form.email).toBe('');
    expect(component.form.password).toBe('');
    expect(component.error).toBe('');
    expect(component.notice).toBe('');
  });

  it('should populate the form when editing a customer', () => {
    component.edit(customer);

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(1);
    expect(component.form.name).toBe('Omar Mostafa');
    expect(component.form.email).toBe('omar@example.com');
    expect(component.form.password).toBe('');
    expect(component.form.phoneNumber).toBe('01000000000');
    expect(component.form.address).toBe('Cairo');
    expect(component.form.gender).toBe('Male');
    expect(component.form.age).toBe(22);
  });

  it('should reject an empty customer name', () => {
    validForm();
    component.form.name = '';

    component.save();

    expect(component.error).toBe('Customer name is required.');
    expect(toastService.toasts()[0].title).toBe('Missing customer name');
  });

  it('should reject an empty email', () => {
    validForm();
    component.form.email = '';

    component.save();

    expect(component.error).toBe('Customer email is required.');
    expect(toastService.toasts()[0].title).toBe('Missing customer email');
  });

  it('should reject an invalid email', () => {
    validForm();
    component.form.email = 'invalid-email';

    component.save();

    expect(component.error).toBe('Enter a valid email address.');
    expect(toastService.toasts()[0].title).toBe('Invalid email');
  });

  it('should reject an empty password', () => {
    validForm();
    component.form.password = '';

    component.save();

    expect(component.error).toBe('Customer password is required.');
    expect(toastService.toasts()[0].title).toBe('Missing password');
  });

  it('should reject an empty phone number', () => {
    validForm();
    component.form.phoneNumber = '';

    component.save();

    expect(component.error).toBe('Customer phone number is required.');
    expect(toastService.toasts()[0].title).toBe('Missing phone number');
  });

  it('should reject an empty address', () => {
    validForm();
    component.form.address = '';

    component.save();

    expect(component.error).toBe('Customer address is required.');
    expect(toastService.toasts()[0].title).toBe('Missing address');
  });

  it('should reject an empty gender', () => {
    validForm();
    component.form.gender = '';

    component.save();

    expect(component.error).toBe('Customer gender is required.');
    expect(toastService.toasts()[0].title).toBe('Missing gender');
  });

  it('should reject an invalid age', () => {
    validForm();
    component.form.age = 22.5;

    component.save();

    expect(component.error).toBe('Enter a valid whole-number age.');
    expect(toastService.toasts()[0].title).toBe('Invalid age');
  });

  it('should create a customer with trimmed text fields', () => {
    component.openCreateForm();

    component.form = {
      name: '  Omar Mostafa  ',
      email: '  omar@example.com  ',
      password: 'Password@123',
      phoneNumber: ' 01000000000 ',
      address: ' Cairo ',
      gender: ' Male ',
      age: 22,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      name: 'Omar Mostafa',
      email: 'omar@example.com',
      password: 'Password@123',
      phoneNumber: '01000000000',
      address: 'Cairo',
      gender: 'Male',
      age: 22,
    });

    request.flush({
      ...customer,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    expect(reload.request.method).toBe('GET');

    reload.flush([customer]);

    expect(component.records).toEqual([customer]);
    expect(component.showForm).toBe(false);
    expect(component.busy).toBe(false);

    expect(
      toastService.toasts().some((toast) => toast.type === 'success'),
    ).toBe(true);
  });

  it('should update an existing customer', () => {
    component.edit(customer);
    component.form.password = 'NewPassword@123';

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers/1',
    );

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual({
      name: 'Omar Mostafa',
      email: 'omar@example.com',
      password: 'NewPassword@123',
      phoneNumber: '01000000000',
      address: 'Cairo',
      gender: 'Male',
      age: 22,
    });

    request.flush({
      ...customer,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    reload.flush([customer]);

    expect(component.editingId).toBeNull();
    expect(component.showForm).toBe(false);
    expect(component.busy).toBe(false);
  });

  it('should show a toast when loading customers fails', () => {
    component.load();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    request.flush(
      {
        message: 'Customers service is unavailable.',
      },
      {
        status: 503,
        statusText: 'Service Unavailable',
      },
    );

    expect(component.error).toContain(
      'Customers service is unavailable.',
    );

    expect(component.loaded).toBe(false);

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'error');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Could not load records');
  });

  it('should show a toast when creating a customer fails', () => {
    component.openCreateForm();
    validForm();

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    request.flush(
      {
        message: 'Email already exists.',
      },
      {
        status: 409,
        statusText: 'Conflict',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain('Email already exists.');

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'error');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Could not save changes');
  });

  it('should delete a customer after confirmation', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    component.records = [customer];
    component.loaded = true;

    await component.deleteRecord(customer);

    const request = httpMock.expectOne(
      'http://localhost:8080/customers/1',
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const reload = httpMock.expectOne(
      'http://localhost:8080/customers',
    );

    reload.flush([]);

    expect(component.records).toEqual([]);
    expect(component.busy).toBe(false);

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'success');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Record deleted');
  });

  it('should not delete a customer when confirmation is cancelled', async () => {
    const confirmSpy = vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(false);

    component.records = [customer];

    await component.deleteRecord(customer);

    expect(confirmSpy).toHaveBeenCalled();

    httpMock.expectNone(
      'http://localhost:8080/customers/1',
    );

    expect(component.busy).toBe(false);
    expect(component.records).toEqual([customer]);
  });

  it('should show a toast when deleting a customer fails', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    component.records = [customer];

    await component.deleteRecord(customer);

    const request = httpMock.expectOne(
      'http://localhost:8080/customers/1',
    );

    request.flush(
      {
        message: 'Customer could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Customer could not be deleted.',
    );

    const toast = toastService
      .toasts()
      .find((item) => item.type === 'error');

    expect(toast).toBeTruthy();
    expect(toast?.title).toBe('Could not delete record');
  });

  it('should ignore duplicate load requests while loading', () => {
    component.load();
    component.load();

    const requests = httpMock.match(
      'http://localhost:8080/customers',
    );

    expect(requests.length).toBe(1);

    requests[0].flush([]);
  });

  it('should prevent save while another operation is busy', () => {
    validForm();

    component.busy = true;

    component.save();

    httpMock.expectNone(
      'http://localhost:8080/customers',
    );

    expect(component.busy).toBe(true);
  });

  it('should close the form when cancelForm is called', () => {
    component.openCreateForm();

    expect(component.showForm).toBe(true);

    component.cancelForm();

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBeNull();
    expect(component.form.name).toBe('');
    expect(component.form.email).toBe('');
  });
});
