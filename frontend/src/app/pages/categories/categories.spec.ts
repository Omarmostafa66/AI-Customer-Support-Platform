import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Categories } from './categories';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { vi } from 'vitest';

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;
  let confirmDialogService: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Categories],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
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

  it('should load categories on initialization', () => {
    expect(component.loaded).toBe(true);
    expect(component.records).toEqual([]);
  });

  it('should open the create form with a clean form', () => {
    component.form = {
      name: 'Old Category',
      description: 'Old description',
    };

    component.editingId = 15;

    component.openCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.editingId).toBe(null);
    expect(component.form).toEqual({
      name: '',
      description: '',
    });
  });

  it('should populate the form when editing a category', () => {
    const category = {
      id: 7,
      name: 'Billing',
      description: 'Payment related issues',
      createdAt: '2026-09-19T10:00:00',
    };

    component.edit(category);

    expect(component.editingId).toBe(7);
    expect(component.form).toEqual({
      name: 'Billing',
      description: 'Payment related issues',
    });
    expect(component.showForm).toBe(true);
  });

  it('should reject an empty category name', () => {
    const warningSpy = vi.spyOn(toastService, 'warning');

    component.form = {
      name: '   ',
      description: 'Description',
    };

    component.save();

    expect(component.error).toBe('Category name is required.');
    expect(warningSpy).toHaveBeenCalledWith(
      'Enter the category name before saving.',
      'Missing category name',
    );

    httpMock.expectNone((request) =>
      request.url.includes('/categories'),
    );
  });

  it('should create a category', () => {
    component.form = {
      name: 'Technical Support',
      description: 'Technical issues',
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Technical Support',
      description: 'Technical issues',
    });

    request.flush({
      id: 10,
      name: 'Technical Support',
      description: 'Technical issues',
      createdAt: '2026-09-19T10:00:00',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    expect(reload.request.method).toBe('GET');

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
    expect(component.notice).toBe('Changes saved.');

    expect(toastService.toasts().some(
      (toast) =>
        toast.type === 'success' &&
        toast.title === 'Changes saved',
    )).toBe(true);
  });

  it('should update an existing category', () => {
    component.editingId = 12;
    component.showForm = true;

    component.form = {
      name: 'Updated Billing',
      description: 'Updated description',
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories/12',
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      name: 'Updated Billing',
      description: 'Updated description',
    });

    request.flush({
      id: 12,
      name: 'Updated Billing',
      description: 'Updated description',
      createdAt: '2026-09-19T10:00:00',
    });

    const reload = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    reload.flush([]);

    expect(component.busy).toBe(false);
    expect(component.showForm).toBe(false);
  });

  it('should trim category values before saving', () => {
    component.form = {
      name: '  Billing  ',
      description: '  Payment issues  ',
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    expect(request.request.body).toEqual({
      name: 'Billing',
      description: 'Payment issues',
    });

    request.flush({
      id: 13,
      name: 'Billing',
      description: 'Payment issues',
      createdAt: '2026-09-19T10:00:00',
    });

    httpMock
      .expectOne('http://localhost:8080/categories')
      .flush([]);
  });

  it('should show an error toast when loading categories fails', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    component.load();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    request.flush(
      {
        message: 'Categories service is unavailable.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.error).toContain(
      'Categories service is unavailable.',
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.loaded).toBe(false);
  });

  it('should show an error toast when creating a category fails', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    component.form = {
      name: 'Billing',
      description: 'Payment issues',
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories',
    );

    request.flush(
      {
        message: 'Category could not be created.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Category could not be created.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should show an error toast when updating a category fails', () => {
    const errorSpy = vi.spyOn(toastService, 'error');

    component.editingId = 8;
    component.form = {
      name: 'Updated',
      description: '',
    };

    component.save();

    const request = httpMock.expectOne(
      'http://localhost:8080/categories/8',
    );

    request.flush(
      {
        message: 'Category could not be updated.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Category could not be updated.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should delete a category successfully', async () => {
    const confirmSpy = vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    const successSpy = vi.spyOn(
      toastService,
      'success',
    );

    const category = {
      id: 20,
      name: 'Shipping',
      description: 'Shipping issues',
      createdAt: '2026-09-19T10:00:00',
    };

    component.records = [category];

    await component.deleteRecord(category);

    expect(confirmSpy).toHaveBeenCalledWith({
      title: 'Delete record?',
      message:
        'Are you sure you want to delete record #20? ' +
        'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });

    const request = httpMock.expectOne(
      'http://localhost:8080/categories/20',
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    const reload = httpMock.expectOne(
      'http://localhost:8080/categories',
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

    const category = {
      id: 30,
      name: 'Returns',
      description: 'Return requests',
      createdAt: '2026-09-19T10:00:00',
    };

    await component.deleteRecord(category);

    expect(confirmSpy).toHaveBeenCalled();

    httpMock.expectNone(
      'http://localhost:8080/categories/30',
    );

    expect(component.busy).toBe(false);
  });

  it('should show an error toast when deleting a category fails', async () => {
    vi
      .spyOn(confirmDialogService, 'confirm')
      .mockResolvedValue(true);

    const errorSpy = vi.spyOn(
      toastService,
      'error',
    );

    const category = {
      id: 31,
      name: 'Refunds',
      description: 'Refund requests',
      createdAt: '2026-09-19T10:00:00',
    };

    await component.deleteRecord(category);

    const request = httpMock.expectOne(
      'http://localhost:8080/categories/31',
    );

    request.flush(
      {
        message: 'Category could not be deleted.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    expect(component.busy).toBe(false);
    expect(component.error).toContain(
      'Category could not be deleted.',
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should block duplicate saves while busy', () => {
    component.form = {
      name: 'Billing',
      description: '',
    };

    component.busy = true;

    component.save();

    httpMock.expectNone(
      'http://localhost:8080/categories',
    );
  });

  it('should block editing while loading', () => {
    component.loading = true;

    component.edit({
      id: 1,
      name: 'Billing',
      description: 'Payment',
      createdAt: '2026-09-19T10:00:00',
    });

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBe(null);
  });

  it('should reset the form correctly', () => {
    component.form = {
      name: 'Billing',
      description: 'Payment',
    };

    component.resetForm();

    expect(component.form).toEqual({
      name: '',
      description: '',
    });
  });

  it('should close the form when cancelling', () => {
    component.showForm = true;
    component.editingId = 4;
    component.form = {
      name: 'Billing',
      description: 'Payment',
    };

    component.cancelForm();

    expect(component.showForm).toBe(false);
    expect(component.editingId).toBe(null);
    expect(component.form).toEqual({
      name: '',
      description: '',
    });
  });
});
