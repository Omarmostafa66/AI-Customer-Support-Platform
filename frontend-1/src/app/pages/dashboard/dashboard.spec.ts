import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';
import { ToastService } from '../../shared/toast/toast.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpMock: HttpTestingController;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
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

    const pendingRequests = httpMock.match(() => true);

    pendingRequests.forEach((request) => {
      request.flush([]);
    });

    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error toast when a dashboard resource fails', () => {
    toastService.clear();

    component.loadDashboard();

    const ticketsRequest = httpMock.expectOne(
      'http://localhost:8080/tickets',
    );

    ticketsRequest.flush(
      {
        message: 'Tickets could not be loaded.',
      },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );

    httpMock
      .match(() => true)
      .forEach((request) => request.flush([]));

    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0].type).toBe('error');
    expect(toastService.toasts()[0].title).toBe(
      'Could not load tickets',
    );
  });

  it('should clear previous errors when refreshing the dashboard', () => {
    component.errors = ['Previous dashboard error'];

    component.loadDashboard();

    expect(component.errors).toEqual([]);

    httpMock
      .match(() => true)
      .forEach((request) => request.flush([]));
  });

  it('should prevent duplicate dashboard requests while loading', () => {
    component.loading = true;

    component.loadDashboard();

    expect(component.loading).toBe(true);

    expect(
      httpMock.match(() => true),
    ).toHaveLength(0);
  });
});
