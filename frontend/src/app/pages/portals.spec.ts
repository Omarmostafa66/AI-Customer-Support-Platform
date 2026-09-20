import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthService, AuthResponse } from '../services/auth.service';
import { CustomerDashboard } from './customer-portal/dashboard/dashboard';
import { CustomerTicketDetails } from './customer-portal/ticket-details/ticket-details';
import { CustomerCreateTicket } from './customer-portal/create-ticket/create-ticket';
import { CustomerMessages } from './customer-portal/messages/messages';
import { AssignedIncidents } from './employee-portal/assigned-incidents/assigned-incidents';
import { EmployeeIncidentDetails } from './employee-portal/incident-details/incident-details';
import { EmployeeTicketDetails } from './employee-portal/ticket-details/ticket-details';
import { EmployeeMessages } from './employee-portal/messages/messages';
import { App } from '../app';
import { routes } from '../app.routes';

// Isolated HTTP fixtures only; never inserted into the application or live backend.
const customer = {
  id: 17,
  name: 'Customer One',
  email: 'one@example.test',
};

const employee = {
  id: 23,
  name: 'Agent One',
};

const ticket = {
  id: 31,
  title: 'Account question',
  description: 'Details',
  status: 'OPEN',
  priority: 'MEDIUM',
  customer,
  category: null,
  createdAt: '2026-09-10T10:00:00',
  updatedAt: '2026-09-10T10:00:00',
};

const incident = {
  id: 41,
  status: 'OPEN',
  sameMessage: true,
  employee,
  category: { id: 51, name: 'Billing' },
  createdAt: null,
  resolvedAt: null,
};

const base = 'http://localhost:8080';

const customerAuth: AuthResponse = {
  token: 'customer-test-token',
  userId: 17,
  email: customer.email,
  role: 'CUSTOMER',
};

const employeeAuth: AuthResponse = {
  token: 'employee-test-token',
  userId: 23,
  email: 'agent@example.test',
  role: 'EMPLOYEE',
};

const adminAuth: AuthResponse = {
  token: 'admin-test-token',
  userId: 1,
  email: 'admin@example.test',
  role: 'ADMIN',
};

describe('Portal workflows', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id: '31' }));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params },
        },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function authenticate(user: AuthResponse): void {
    localStorage.setItem('auth_token', user.token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params },
        },
      ],
    });

    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  }

  it('starts without an authenticated session', () => {
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.getRole()).toBeNull();
    expect(auth.getUserId()).toBeNull();
  });

  it('customer dashboard starts with the AI assistant and does not make ticket requests', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerDashboard);
    fixture.detectChanges();

    const page = fixture.componentInstance;

    expect(page.messages).toHaveLength(1);
    expect(page.messages[0].sender).toBe('assistant');
    expect(page.quickPrompts).toHaveLength(4);

    http.expectNone(() => true);

    expect(fixture.nativeElement.textContent).toContain('AI Support Assistant');
    expect(fixture.nativeElement.textContent).toContain('How can we help');
    expect(fixture.nativeElement.textContent).toContain('Common topics');
  });

  it('customer dashboard adds a customer message locally and clears the composer', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerDashboard);
    fixture.detectChanges();

    const page = fixture.componentInstance;

    page.messageText = '  I cannot log in  ';
    page.sendMessage();

    expect(page.messages).toHaveLength(2);
    expect(page.messages[1].sender).toBe('customer');
    expect(page.messages[1].text).toBe('I cannot log in');
    expect(page.messageText).toBe('');

    http.expectNone(() => true);
  });

  it('customer dashboard ignores empty messages', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerDashboard);
    fixture.detectChanges();

    const page = fixture.componentInstance;

    page.messageText = '   ';
    page.sendMessage();

    expect(page.messages).toHaveLength(1);
    expect(page.messageText).toBe('   ');

    http.expectNone(() => true);
  });

  it('customer dashboard selects quick prompts without sending them', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerDashboard);
    fixture.detectChanges();

    const page = fixture.componentInstance;

    const prompt = "I can't log in to my account";
    page.selectQuickPrompt(prompt);

    expect(page.messageText).toBe(prompt);
    expect(page.messages).toHaveLength(1);

    http.expectNone(() => true);
  });

  it('customer dashboard can append assistant and ticket-created messages', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerDashboard);
    fixture.detectChanges();

    const page = fixture.componentInstance;

    page.addAssistantMessage('Please try resetting your password.');
    page.addTicketCreatedMessage(31);

    expect(page.messages).toHaveLength(3);
    expect(page.messages[1].sender).toBe('assistant');
    expect(page.messages[1].text).toContain('resetting your password');
    expect(page.messages[2].sender).toBe('system');
    expect(page.messages[2].text).toContain('#31');
  });

  it('does not fetch a guessed customer ticket from the global detail endpoint', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerTicketDetails);
    fixture.detectChanges();

    http
      .expectOne(base + '/tickets/customer/17')
      .flush([{ ...ticket, customer: { ...customer, id: 99 } }]);

    expect(fixture.componentInstance.ticket).toBeNull();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'not available for the selected customer',
    );

    http.expectNone(base + '/tickets/31');
  });

  it('creates a ticket with workflow defaults and selected category, then navigates to its detail', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerCreateTicket);
    fixture.detectChanges();

    http
      .expectOne(base + '/categories')
      .flush([{ id: 51, name: 'Billing' }]);

    const page = fixture.componentInstance;

    page.form = {
      title: ' Billing ',
      description: ' Help ',
      categoryId: 51,
    };

    page.save();
    page.save();

    const req = http.expectOne(base + '/tickets/customer/17/category/51');

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      title: 'Billing',
      description: 'Help',
      status: 'OPEN',
      priority: 'MEDIUM',
    });

    req.flush(ticket);

    expect(page.form.title).toBe('');
    expect(page.submitted?.id).toBe(31);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Your ticket has been submitted.',
    );
  });

  it('allows creation without category after a lookup error and retains a failed draft', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerCreateTicket);
    fixture.detectChanges();

    http
      .expectOne(base + '/categories')
      .error(new ProgressEvent('error'));

    const page = fixture.componentInstance;

    expect(page.loading).toBe(false);

    page.form = {
      title: 'Question',
      description: 'Please help',
      categoryId: null,
    };

    page.save();

    http
      .expectOne(base + '/tickets/customer/17')
      .flush({}, {
        status: 400,
        statusText: 'Bad Request',
      });

    expect(page.busy).toBe(false);
    expect(page.form.title).toBe('Question');
    expect(page.error).toContain('Please check');
  });

  it('customer messages never load the global inbox and only show confirmed submissions', () => {
    authenticate(customerAuth);

    const fixture = TestBed.createComponent(CustomerMessages);
    fixture.detectChanges();

    http.expectNone(() => true);

    const page = fixture.componentInstance;

    page.text = 'Help';
    page.send();

    const req = http.expectOne(base + '/messages/customer/17');

    expect(req.request.body).toEqual({
      txt: 'Help',
    });

    req.flush({
      id: 61,
      txt: 'Help',
      customer,
      createdAt: null,
    });

    expect(page.sent).toHaveLength(1);
    expect(page.text).toBe('');

    http.expectNone(base + '/messages');
  });

  it('loads assigned incidents and intersects status/category filters locally', () => {
    authenticate(employeeAuth);

    const fixture = TestBed.createComponent(AssignedIncidents);
    fixture.detectChanges();

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([
        incident,
        { ...incident, id: 42, status: 'RESOLVED' },
        { ...incident, id: 43, employee: { id: 24 } },
      ]);

    const page = fixture.componentInstance;

    expect(page.incidents).toHaveLength(2);

    page.status = 'RESOLVED';
    page.categoryId = 51;

    expect(page.visible.map((i) => i.id)).toEqual([42]);

    http.expectNone(base + '/incidents');
  });

  it('rechecks assignment and preserves the newest sameMessage when updating status', () => {
    authenticate(employeeAuth);

    params.next(convertToParamMap({ id: '41' }));

    const fixture = TestBed.createComponent(EmployeeIncidentDetails);
    fixture.detectChanges();

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([incident]);

    const page = fixture.componentInstance;

    page.status = 'IN_PROGRESS';
    page.update();

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([{ ...incident, sameMessage: false }]);

    const req = http.expectOne(base + '/incidents/41');

    expect(req.request.method).toBe('PUT');

    expect(req.request.body).toEqual({
      status: 'IN_PROGRESS',
      sameMessage: false,
    });

    req.flush({
      ...incident,
      status: 'IN_PROGRESS',
      sameMessage: false,
    });

    expect(page.busy).toBe(false);
    expect(page.incident?.status).toBe('IN_PROGRESS');
  });

  it('uses the dedicated resolve action after checking current assignment', () => {
    authenticate(employeeAuth);

    params.next(convertToParamMap({ id: '41' }));

    const fixture = TestBed.createComponent(EmployeeIncidentDetails);
    fixture.detectChanges();

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([incident]);

    fixture.componentInstance.update(true);

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([incident]);

    const req = http.expectOne(base + '/incidents/41/resolve');

    expect(req.request.method).toBe('PUT');

    req.flush({
      ...incident,
      status: 'RESOLVED',
    });

    expect(fixture.componentInstance.status).toBe('RESOLVED');
  });

  it('does not mutate an incident reassigned since it was opened', () => {
    authenticate(employeeAuth);

    params.next(convertToParamMap({ id: '41' }));

    const fixture = TestBed.createComponent(EmployeeIncidentDetails);
    fixture.detectChanges();

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([incident]);

    const page = fixture.componentInstance;

    page.update(true);

    http
      .expectOne(base + '/incidents/employee/23')
      .flush([]);

    http.expectNone((req) => req.method === 'PUT');

    expect(page.incident).toBeNull();
    expect(page.busy).toBe(false);
  });

  it('employee ticket analysis uses the existing endpoint without CRUD controls', () => {
    authenticate(employeeAuth);

    const fixture = TestBed.createComponent(EmployeeTicketDetails);
    fixture.detectChanges();

    http
      .expectOne(base + '/tickets/31')
      .flush(ticket);

    fixture.componentInstance.analyze();

    http
      .expectOne(base + '/tickets/31/analyze')
      .flush({
        category: 'Billing',
        suggestedPriority: 'LOW',
        suggestedResponse: 'Review',
      });

    expect(fixture.componentInstance.analysis?.category).toBe('Billing');
    expect(fixture.componentInstance.busy).toBe(false);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Delete');
  });

  it('employee inbox is read-only and clears loading on failures', () => {
    authenticate(employeeAuth);

    const fixture = TestBed.createComponent(EmployeeMessages);
    fixture.detectChanges();

    http
      .expectOne(base + '/messages')
      .error(new ProgressEvent('error'));

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.componentInstance.error).toContain('CORS');

    fixture.componentInstance.reload();

    http
      .expectOne(base + '/messages')
      .flush([]);

    expect(fixture.componentInstance.error).toBe('');
  });
});

describe('Admin and portal routing', () => {
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('preserves Admin routes and renders separate sidebars for every new route', async () => {
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);

    localStorage.setItem('auth_token', adminAuth.token);
    localStorage.setItem('auth_user', JSON.stringify(adminAuth));

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const paths = [
      '/dashboard',
      '/tickets',
      '/customers',
      '/incidents',
      '/messages',
      '/categories',
      '/employees',
    ];

    for (const url of paths) {
      await router.navigateByUrl(url);

      fixture.detectChanges();

      http
        .match(() => true)
        .forEach((req) => {
          const p = req.request.url;

          req.flush(
            p.endsWith('/tickets/31')
              ? ticket
              : p.includes('/tickets')
                ? [ticket]
                : p.includes('/incidents')
                  ? [incident]
                  : [],
          );
        });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(router.url).toBe(url);
      expect(fixture.nativeElement.querySelector('main h1')).toBeTruthy();

      const navigation = fixture.nativeElement.querySelector('aside');

      expect(navigation).toBeTruthy();

      const text = navigation.textContent;

      expect(text).toContain('Customers');
      expect(text).toContain('Employees');
    }
  });

  it('redirects unauthenticated users to login', async () => {
    const router = TestBed.inject(Router);

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    await router.navigateByUrl('/dashboard');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/login');
  });

  it('blocks customers from Admin routes', async () => {
    const router = TestBed.inject(Router);

    localStorage.setItem('auth_token', customerAuth.token);
    localStorage.setItem('auth_user', JSON.stringify(customerAuth));

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    await router.navigateByUrl('/dashboard');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/customer/dashboard');
  });

  it('blocks employees from Admin routes', async () => {
    const router = TestBed.inject(Router);

    localStorage.setItem('auth_token', employeeAuth.token);
    localStorage.setItem('auth_user', JSON.stringify(employeeAuth));

    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    await router.navigateByUrl('/dashboard');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/employee/dashboard');
  });
});
