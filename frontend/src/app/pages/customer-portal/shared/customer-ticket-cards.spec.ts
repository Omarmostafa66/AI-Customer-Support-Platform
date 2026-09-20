import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CustomerTicketCards } from './customer-ticket-cards';
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
    customer: null,
    category: null,
    ...overrides,
  };
}

describe('CustomerTicketCards', () => {
  let fixture: ComponentFixture<CustomerTicketCards>;
  let component: CustomerTicketCards;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTicketCards],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTicketCards);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  function setTickets(tickets: Ticket[]): void {
    fixture.componentRef.setInput('tickets', tickets);
    fixture.detectChanges();
  }

  function setCompact(compact: boolean): void {
    fixture.componentRef.setInput('compact', compact);
    fixture.detectChanges();
  }

  function text(): string {
    return fixture.nativeElement.textContent ?? '';
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an empty ticket list', () => {
    expect(component.tickets()).toEqual([]);
  });

  it('should start in normal mode', () => {
    expect(component.compact()).toBe(false);
  });

  it('should render no cards when the ticket list is empty', () => {
    setTickets([]);

    const cards =
      fixture.nativeElement.querySelectorAll('.ticket-card');

    expect(cards.length).toBe(0);
  });

  it('should render the ticket number', () => {
    setTickets([createTicket()]);

    const element: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-number');

    expect(element).toBeTruthy();
    expect(element.textContent).toContain('Ticket #101');
  });

  it('should render the ticket title', () => {
    setTickets([
      createTicket({
        title: 'Billing problem',
      }),
    ]);

    const title: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-card h3');

    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Billing problem');
  });

  it('should render the priority in readable format', () => {
    setTickets([
      createTicket({
        priority: 'URGENT',
      }),
    ]);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Urgent');
  });

  it('should render the created date', () => {
    setTickets([createTicket()]);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Sep 19, 2026');
  });

  it('should render the updated date', () => {
    setTickets([createTicket()]);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Sep 19, 2026');
  });

  it('should use createdAt when updatedAt is not available', () => {
    setTickets([
      createTicket({
        updatedAt: null,
      }),
    ]);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Sep 19, 2026');
  });

  it('should show Not recorded when createdAt is unavailable', () => {
    setTickets([
      createTicket({
        createdAt: null,
        updatedAt: null,
      }),
    ]);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Not recorded');
  });

  it('should render the View Details button', () => {
    setTickets([createTicket()]);

    const button: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.details-button');

    expect(button).toBeTruthy();
    expect(button.textContent).toContain('View Details');
  });

  it('should set the correct details aria-label', () => {
    setTickets([createTicket()]);

    const button: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.details-button');

    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe(
      'View Details for ticket 101',
    );
  });

  it('should render the ticket title as a details link', () => {
    setTickets([createTicket()]);

    const titleLink: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.ticket-card h3 a');

    expect(titleLink).toBeTruthy();
    expect(titleLink.textContent).toContain(
      'Unable to access my account',
    );
  });

  it('should render multiple tickets', () => {
    setTickets([
      createTicket({
        id: 101,
        title: 'Login issue',
      }),
      createTicket({
        id: 102,
        title: 'Billing issue',
      }),
      createTicket({
        id: 103,
        title: 'Account locked',
      }),
    ]);

    const cards =
      fixture.nativeElement.querySelectorAll('.ticket-card');

    expect(cards.length).toBe(3);

    expect(text()).toContain('Login issue');
    expect(text()).toContain('Billing issue');
    expect(text()).toContain('Account locked');
  });

  it('should display the full ticket facts in normal mode', () => {
    setTickets([createTicket()]);
    setCompact(false);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Priority');
    expect(facts.textContent).toContain('Created');
    expect(facts.textContent).toContain('Last updated');
  });

  it('should hide Priority in compact mode', () => {
    setTickets([createTicket()]);
    setCompact(true);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).not.toContain('Priority');
  });

  it('should hide Created in compact mode', () => {
    setTickets([createTicket()]);
    setCompact(true);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).not.toContain('Created');
  });

  it('should keep Last updated visible in compact mode', () => {
    setTickets([createTicket()]);
    setCompact(true);

    const facts: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-facts');

    expect(facts).toBeTruthy();
    expect(facts.textContent).toContain('Last updated');
  });

  it('should add the compact class when compact mode is enabled', () => {
    setTickets([createTicket()]);
    setCompact(true);

    const grid: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-grid');

    expect(grid).toBeTruthy();
    expect(grid.classList.contains('compact')).toBe(true);
  });

  it('should not add the compact class in normal mode', () => {
    setTickets([createTicket()]);
    setCompact(false);

    const grid: HTMLElement =
      fixture.nativeElement.querySelector('.ticket-grid');

    expect(grid).toBeTruthy();
    expect(grid.classList.contains('compact')).toBe(false);
  });
});
