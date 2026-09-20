import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);

    fixture.detectChanges();
  });

  afterEach(() => {
    toastService.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a success toast', () => {
    toastService.success(
      'Your changes have been saved.',
      'Changes saved'
    );

    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.toast');
    const title = fixture.nativeElement.querySelector('.toast-title');
    const message =
      fixture.nativeElement.querySelector('.toast-message');

    expect(toast).toBeTruthy();
    expect(toast.classList.contains('success')).toBe(true);
    expect(title.textContent.trim()).toBe('Changes saved');
    expect(message.textContent.trim()).toBe(
      'Your changes have been saved.'
    );
  });

  it('should render an error toast', () => {
    toastService.error(
      'Unable to save your changes.',
      'Save failed'
    );

    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.toast');

    expect(toast).toBeTruthy();
    expect(toast.classList.contains('error')).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.toast-title')
        .textContent
        .trim()
    ).toBe('Save failed');
  });

  it('should render a warning toast', () => {
    toastService.warning(
      'Please check your information.',
      'Warning'
    );

    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.toast');

    expect(toast).toBeTruthy();
    expect(toast.classList.contains('warning')).toBe(true);
  });

  it('should render an info toast', () => {
    toastService.info(
      'You have been signed out.',
      'Signed out'
    );

    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.toast');

    expect(toast).toBeTruthy();
    expect(toast.classList.contains('info')).toBe(true);
  });

  it('should render multiple toasts', () => {
    toastService.success('First message');
    toastService.error('Second message');
    toastService.info('Third message');

    fixture.detectChanges();

    const toasts =
      fixture.nativeElement.querySelectorAll('.toast');

    expect(toasts.length).toBe(3);
  });

  it('should remove a toast when the close button is clicked', () => {
    toastService.success(
      'This message can be closed.',
      'Closable'
    );

    fixture.detectChanges();

    const closeButton =
      fixture.nativeElement.querySelector('.toast-close');

    expect(closeButton).toBeTruthy();
    expect(toastService.toasts()).toHaveLength(1);

    closeButton.click();
    fixture.detectChanges();

    expect(toastService.toasts()).toHaveLength(0);
    expect(
      fixture.nativeElement.querySelector('.toast')
    ).toBeNull();
  });

  it('should return the correct icon for each toast type', () => {
    expect(component.icon('success')).toBe('✓');
    expect(component.icon('error')).toBe('!');
    expect(component.icon('warning')).toBe('⚠');
    expect(component.icon('info')).toBe('i');
    expect(component.icon('unknown')).toBe('i');
  });
});
