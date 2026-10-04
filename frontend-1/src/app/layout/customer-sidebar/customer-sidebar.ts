import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrl: '../sidebar/sidebar.css',
  template: `<aside class="sidebar">
    <div class="brand">
      <h2>AI Customer Support</h2>
      <p>Customer Portal</p>
    </div>
    <nav class="nav-links" aria-label="Customer Portal">
      <a
        routerLink="/customer/dashboard"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
        ariaCurrentWhenActive="page"
        >Dashboard</a
      ><a
        routerLink="/customer/tickets"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        ariaCurrentWhenActive="page"
        >My Tickets</a
      ><a
        routerLink="/customer/tickets/new"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
        ariaCurrentWhenActive="page"
        >Create Ticket</a
      ><a
        routerLink="/customer/messages"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
        ariaCurrentWhenActive="page"
        >Messages</a
      >
    </nav>
  </aside>`,
})
export class CustomerSidebar {}
