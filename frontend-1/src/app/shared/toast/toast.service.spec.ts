import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService],
    });

    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should show a success toast', () => {
    service.success('Operation completed.');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toEqual({
      id: 1,
      type: 'success',
      title: 'Success',
      message: 'Operation completed.',
    });
  });

  it('should show an error toast', () => {
    service.error('Something failed.');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toEqual({
      id: 1,
      type: 'error',
      title: 'Something went wrong',
      message: 'Something failed.',
    });
  });

  it('should show a warning toast', () => {
    service.warning('Please check your input.');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toEqual({
      id: 1,
      type: 'warning',
      title: 'Warning',
      message: 'Please check your input.',
    });
  });

  it('should show an info toast', () => {
    service.info('Your session is active.');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toEqual({
      id: 1,
      type: 'info',
      title: 'Information',
      message: 'Your session is active.',
    });
  });

  it('should support custom titles', () => {
    service.success(
      'Your account was created.',
      'Account created'
    );

    expect(service.toasts()[0]).toEqual({
      id: 1,
      type: 'success',
      title: 'Account created',
      message: 'Your account was created.',
    });
  });

  it('should assign unique ids to multiple toasts', () => {
    service.success('First');
    service.error('Second');
    service.info('Third');

    const toasts = service.toasts();

    expect(toasts).toHaveLength(3);
    expect(toasts.map((toast) => toast.id)).toEqual([1, 2, 3]);
  });

  it('should remove a specific toast', () => {
    service.success('First');
    service.error('Second');

    const firstId = service.toasts()[0].id;

    service.remove(firstId);

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Second');
  });

  it('should clear all toasts', () => {
    service.success('First');
    service.warning('Second');
    service.info('Third');

    service.clear();

    expect(service.toasts()).toEqual([]);
  });

  it('should automatically remove a toast after its duration', () => {
    vi.useFakeTimers();

    try {
      service.show(
        'success',
        'Saved',
        'Changes saved.',
        1000
      );

      expect(service.toasts()).toHaveLength(1);

      vi.advanceTimersByTime(999);

      expect(service.toasts()).toHaveLength(1);

      vi.advanceTimersByTime(1);

      expect(service.toasts()).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
