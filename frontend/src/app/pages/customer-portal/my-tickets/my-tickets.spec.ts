import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { MyTickets } from './my-tickets';
import { Api } from '../../../services/api';
import { AuthService } from '../../../services/auth.service';
import { Ticket } from '../../../models/resources';

function createTicket(
  overrides: Partial<Ticket> = {},
): Ticket {
  return {
    id: 101,
    title: 'Unable to access my account',
    description: 'The customer cannot log in.',
    status: 'OPEN',
    priority: 'HIGH',
    fingerprint: 'ticket-101',
    createdAt: '2026-09-19T10:00:00',
    updatedAt: '2026-09-19T12:30:00',
    customer: {
      id: 17,
      name: 'Test Customer',
      email: 'customer@example.com',
      phoneNumber: '01000000000',
      address: 'Cairo',
      gender: 'Male',
      age: 22,
    },
    category: null,
    ...overrides,
  };
}

describe('MyTickets', () => {
  let fixture: ComponentFixture<MyTickets>;
  let component: MyTickets;

  let apiMock: {
    getTicketsByCustomer: ReturnType<typeof vi.fn>;
  };

  let authMock: {
    currentCustomerId: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      getTicketsByCustomer: vi.fn(),
    };

    authMock = {
      currentCustomerId: vi.fn().mockReturnValue(17),
    };

    apiMock.getTicketsByCustomer.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [MyTickets],
      providers: [
        provideRouter([]),
        {
          provide: Api,
          useValue: apiMock,
        },
        {
          provide: AuthService,
          useValue: authMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTickets);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  /**
   * Load specific tickets through the same API path used
   * by the real component.
   */
  function loadTickets(tickets: Ticket[]): void {
    apiMock.getTicketsByCustomer.mockReturnValue(of(tickets));

    component.reload();

    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty filter', () => {
    expect(component.filter).toBe('');
  });

  it('should start with an empty search', () => {
    expect(component.search).toBe('');
  });

  it('should load tickets for the authenticated customer', () => {
    expect(apiMock.getTicketsByCustomer).toHaveBeenCalledWith(17);
  });

  it('should display tickets belonging to the authenticated customer', () => {
    const ticket = createTicket();

    loadTickets([ticket]);

    expect(component.tickets.length).toBe(1);
    expect(component.tickets[0].id).toBe(101);
  });

  it('should filter out tickets belonging to another customer', () => {
    const ownTicket = createTicket({
      id: 101,
      title: 'My ticket',
    });

    const otherTicket = createTicket({
      id: 202,
      title: 'Other customer ticket',
      customer: {
        id: 99,
        name: 'Other Customer',
        email: 'other@example.com',
        phoneNumber: '01111111111',
        address: 'Giza',
        gender: 'Female',
        age: 25,
      },
    });

    loadTickets([ownTicket, otherTicket]);

    expect(component.tickets.length).toBe(1);
    expect(component.tickets[0].id).toBe(101);
  });

  it('should return all tickets when no status filter is selected', () => {
    component.tickets = [
      createTicket({ id: 101, status: 'OPEN' }),
      createTicket({ id: 102, status: 'RESOLVED' }),
    ];

    expect(component.visible.length).toBe(2);
  });

  it('should filter tickets by status', () => {
    component.tickets = [
      createTicket({ id: 101, status: 'OPEN' }),
      createTicket({ id: 102, status: 'RESOLVED' }),
      createTicket({ id: 103, status: 'OPEN' }),
    ];

    component.filter = 'OPEN';

    expect(component.visible.length).toBe(2);

    expect(
      component.visible.every(
        (ticket) => ticket.status === 'OPEN',
      ),
    ).toBe(true);
  });

  it('should search tickets by title', () => {
    component.tickets = [
      createTicket({
        id: 101,
        title: 'Cannot login',
      }),
      createTicket({
        id: 102,
        title: 'Billing problem',
      }),
    ];

    component.search = 'billing';

    expect(component.visible.length).toBe(1);
    expect(component.visible[0].id).toBe(102);
  });

  it('should search ticket titles case-insensitively', () => {
    component.tickets = [
      createTicket({
        title: 'Cannot Login',
      }),
    ];

    component.search = 'LOGIN';

    expect(component.visible.length).toBe(1);
  });

  it('should search tickets by ticket id', () => {
    component.tickets = [
      createTicket({ id: 101 }),
      createTicket({ id: 202 }),
    ];

    component.search = '202';

    expect(component.visible.length).toBe(1);
    expect(component.visible[0].id).toBe(202);
  });

  it('should search tickets using a leading hash', () => {
    component.tickets = [
      createTicket({ id: 101 }),
      createTicket({ id: 202 }),
    ];

    component.search = '#202';

    expect(component.visible.length).toBe(1);
    expect(component.visible[0].id).toBe(202);
  });

  it('should trim the search query', () => {
    component.tickets = [
      createTicket({
        title: 'Billing problem',
      }),
    ];

    component.search = '  billing  ';

    expect(component.visible.length).toBe(1);
  });

  it('should combine status filtering and search', () => {
    component.tickets = [
      createTicket({
        id: 101,
        title: 'Billing problem',
        status: 'OPEN',
      }),
      createTicket({
        id: 102,
        title: 'Billing problem',
        status: 'RESOLVED',
      }),
      createTicket({
        id: 103,
        title: 'Login problem',
        status: 'OPEN',
      }),
    ];

    component.filter = 'OPEN';
    component.search = 'billing';

    expect(component.visible.length).toBe(1);
    expect(component.visible[0].id).toBe(101);
  });

  it('should return no tickets when nothing matches', () => {
    component.tickets = [
      createTicket({
        title: 'Billing problem',
      }),
    ];

    component.search = 'something else';

    expect(component.visible.length).toBe(0);
  });

  it('should clear the filters', () => {
    component.filter = 'OPEN';
    component.search = '#101';

    component.clearFilters();

    expect(component.filter).toBe('');
    expect(component.search).toBe('');
  });

  it('should not load tickets when there is no authenticated customer', () => {
    authMock.currentCustomerId.mockReturnValue(null);

    component.reload();

    expect(apiMock.getTicketsByCustomer).toHaveBeenCalledTimes(1);
  });

  it('should clear the current ticket list before reloading', () => {
    component.tickets = [createTicket()];

    apiMock.getTicketsByCustomer.mockReturnValue(of([]));

    component.reload();

    expect(component.tickets.length).toBe(0);
  });

  it('should handle a ticket loading error', () => {
    apiMock.getTicketsByCustomer.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    component.reload();

    expect(component.loading).toBe(false);

    expect(component.error).toBe(
      'We couldn’t load your information right now. Please try again.',
    );
  });

  it('should expose loading while the request is pending', () => {
    const pendingRequest = new Subject<Ticket[]>();

    apiMock.getTicketsByCustomer.mockReturnValue(
      pendingRequest.asObservable(),
    );

    component.reload();

    expect(component.loading).toBe(true);

    pendingRequest.next([]);
    pendingRequest.complete();

    expect(component.loading).toBe(false);
  });

  it('should render the empty state when there are no tickets', () => {
    loadTickets([]);

    expect(
      fixture.nativeElement.textContent,
    ).toContain('No tickets yet');
  });

  it('should render the filter bar when tickets exist', () => {
    loadTickets([
      createTicket(),
    ]);

    expect(
      fixture.nativeElement.querySelector('.filter-bar'),
    ).toBeTruthy();
  });

  it('should show the correct number of visible tickets', () => {
    loadTickets([
      createTicket({ id: 101 }),
      createTicket({ id: 102 }),
    ]);

    expect(
      fixture.nativeElement.textContent,
    ).toContain('2 tickets found');
  });

  it('should show the singular ticket count', () => {
    loadTickets([
      createTicket(),
    ]);

    expect(
      fixture.nativeElement.textContent,
    ).toContain('1 ticket found');
  });

  it('should show no matching tickets when filters exclude everything', () => {
    component.tickets = [
      createTicket({
        title: 'Billing problem',
      }),
    ];

    component.search = 'login';

    expect(component.visible.length).toBe(0);

    fixture.detectChanges();

    expect(component.visible.length).toBe(0);
  });

  it('should clear filters from the no-results state', () => {
    component.tickets = [
      createTicket({
        title: 'Billing problem',
      }),
    ];

    component.search = 'login';

    expect(component.visible.length).toBe(0);

    component.clearFilters();

    expect(component.search).toBe('');
    expect(component.filter).toBe('');

    expect(component.visible.length).toBe(1);
  });

  it('should keep loading active while Refresh is waiting for a response', () => {
    const pendingRequest = new Subject<Ticket[]>();

    apiMock.getTicketsByCustomer.mockReturnValue(
      pendingRequest.asObservable(),
    );

    component.reload();

    expect(component.loading).toBe(true);

    pendingRequest.next([]);
    pendingRequest.complete();

    expect(component.loading).toBe(false);
  });
});
