import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Employees } from './employees';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { vi } from 'vitest';

describe('Employees', () => {
  let component: Employees;
  let fixture: ComponentFixture<Employees>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;
  let confirmDialogService: ConfirmDialogService;

  const employee = {
    id: 7,
    name: 'Ahmed Employee',
    email: 'ahmed@example.com',
    role: 'Support Agent',
    age: 28,
    gender: 'Male',
    salary: 15000,
    createdAt: '2026-09-19T10:00:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Employees],
    }).compileComponents();

    fixture = TestBed.createComponent(Employees);
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees on initialization', () => {
    expect(component.loaded).toBe(true);
    expect(component.records).toEqual([]);
  });

  it('should open the create form with a clean form', () => {
    component.form = {
      name: 'Old Employee',
      email: 'old@example.com',
      password: 'OldPassword',
      role: 'Agent',
      age: 30,
      gender: 'Male',
      salary: 12000,
    };

    component.editingId = 5;

    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(null);

    expect(component.form).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      age: null,
      gender: '',
      salary: null,
    });
  });

  it('should populate the form when editing an employee', () => {
    component.edit(employee);

    expect(component.editingId).toBe(7);

    expect(component.form).toEqual({
      name: 'Ahmed Employee',
      email: 'ahmed@example.com',
      password: '',
      role: 'Support Agent',
      age: 28,
      gender: 'Male',
      salary: 15000,
    });

    expect(component.showForm).toBe(true);
  });

  it('should clear the password when editing an employee', () => {
    component.edit(employee);

    expect(component.form.password).toBe('');
  });

  it('should reject an empty employee name', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: '    ',
      email: 'employee@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Employee name is required.',
    );

    expect(warningSpy).toHaveBeenCalledWith(
      'Enter the employee name before saving.',
      'Missing employee name',
    );

    httpMock.expectNone((request) =>
      request.url.includes('/employees'),
    );
  });

  it('should reject an invalid email', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'invalid-email',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Enter a valid email address.',
    );

    expect(warningSpy).toHaveBeenCalledWith(
      'Please enter a valid employee email address.',
      'Invalid email',
    );

    httpMock.expectNone((request) =>
      request.url.includes('/employees'),
    );
  });

  it('should reject a missing password', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: '    ',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Employee password is required.',
    );

    expect(warningSpy).toHaveBeenCalledWith(
      'Enter a password before saving the employee.',
      'Missing password',
    );
  });

  it('should reject a missing role', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: '    ',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Employee role is required.',
    );

    expect(warningSpy).toHaveBeenCalled();
  });

  it('should reject an invalid age', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: -1,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Enter a valid whole-number age.',
    );

    expect(warningSpy).toHaveBeenCalledWith(
      'Age must be a valid whole number greater than or equal to 0.',
      'Invalid age',
    );
  });

  it('should reject a decimal age', () => {
    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25.5,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Enter a valid whole-number age.',
    );
  });

  it('should reject a missing gender', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: '    ',
      salary: 10000,
    };

    component.save();

    expect(component.error).toBe(
      'Employee gender is required.',
    );

    expect(warningSpy).toHaveBeenCalled();
  });

  it('should reject a negative salary', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: -100,
    };

    component.save();

    expect(component.error).toBe(
      'Enter a valid salary greater than or equal to 0.',
    );

    expect(warningSpy).toHaveBeenCalledWith(
      'Salary must be a valid number greater than or equal to 0.',
      'Invalid salary',
    );
  });

  it('should create an employee', () => {
    component.form = {
      name: '  Ahmed Employee  ',
      email: '  ahmed@example.com  ',
      password: 'Password123',
      role: '  Support Agent  ',
      age: 28,
      gender: '  Male  ',
      salary: 15000,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    expect(request.request.method).toBe('POST');

    expect(request.request.body).toEqual({
      name: 'Ahmed Employee',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Support Agent',
      age: 28,
      gender: 'Male',
      salary: 15000,
    });

    request.flush({
      ...employee,
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
    expect(component.notice).toBe('Changes saved.');
  });

  it('should update an existing employee', () => {
    component.editingId = 7;
    component.showForm = true;

    component.form = {
      name: 'Ahmed Updated',
      email: 'updated@example.com',
      password: 'NewPassword123',
      role: 'Senior Agent',
      age: 29,
      gender: 'Male',
      salary: 18000,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees/7',
    );

    expect(request.request.method).toBe('PUT');

    expect(request.request.body).toEqual({
      name: 'Ahmed Updated',
      email: 'updated@example.com',
      password: 'NewPassword123',
      role: 'Senior Agent',
      age: 29,
      gender: 'Male',
      salary: 18000,
    });

    request.flush({
      ...employee,
      name: 'Ahmed Updated',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
  });

  it('should show an error toast when loading employees fails', () => {
    const errorSpy = vi.spyOn(
      toastService,
      'error',
    );

    component.load();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    request.flush(
      {
        message: 'Employees service is unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.error).toContain(
      'Employees service is unavailable.',
    );

    expect(component.loading).toBe(false);
    expect(component.loaded).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should show an error toast when creating an employee fails', () => {
    const errorSpy = vi.spyOn(
      toastService,
      'error',
    );

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    request.flush(
      {
        message: 'Employee could not be created.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Employee could not be created.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should show an error toast when updating an employee fails', () => {
    const errorSpy = vi.spyOn(
      toastService,
      'error',
    );

    component.editingId = 7;

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'NewPassword123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees/7',
    );

    request.flush(
      {
        message: 'Employee could not be updated.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Employee could not be updated.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should delete an employee successfully', async () => {
    const confirmSpy = vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    const successSpy = vi.spyOn(
      toastService,
      'success',
    );

    await component.deleteRecord(employee);

    expect(confirmSpy).toHaveBeenCalled();

    const request = httpMock.expectOne(
      'http://localhost:8080/employees/7',
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const reload = httpMock.expectOne(
      'http://localhost:8080/employees',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.notice).toBe('Record deleted.');
    expect(successSpy).toHaveBeenCalled();
  });

  it('should not delete when confirmation is cancelled', async () => {
    const confirmSpy = vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(false);

    await component.deleteRecord(employee);

    expect(confirmSpy).toHaveBeenCalled();

    httpMock.expectNone(
      'http://localhost:8080/employees/7',
    );

    expect(component.busy).toBe(false);
  });

  it('should show an error toast when deleting an employee fails', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    const errorSpy = vi.spyOn(
      toastService,
      'error',
    );

    await component.deleteRecord(employee);

    const request = httpMock.expectOne(
      'http://localhost:8080/employees/7',
    );

    request.flush(
      {
        message: 'Employee could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Employee could not be deleted.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should block duplicate saves while busy', () => {
    component.busy = true;

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.save();

    httpMock.expectNone((request) =>
      request.url.includes('/employees'),
    );
  });

  it('should block editing while loading', () => {
    component.loading = true;

    component.edit(employee);

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBe(null);
  });

  it('should reset the form correctly', () => {
    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.resetForm();

    expect(component.form).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      age: null,
      gender: '',
      salary: null,
    });
  });

  it('should close the form when cancelling', () => {
    component.showForm = true;
    component.editingId = 7;

    component.form = {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password: 'Password123',
      role: 'Agent',
      age: 25,
      gender: 'Male',
      salary: 10000,
    };

    component.cancelForm();

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBe(null);

    expect(component.form).toEqual({
      name: '',
      email: '',
      password: '',
      role: '',
      age: null,
      gender: '',
      salary: null,
    });
  });
});
