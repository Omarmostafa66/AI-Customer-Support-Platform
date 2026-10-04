import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { Dashboard } from './pages/dashboard/dashboard';
import { Tickets } from './pages/tickets/tickets';
import { Customers } from './pages/customers/customers';
import { Incidents } from './pages/incidents/incidents';
import { Messages } from './pages/messages/messages';
import { Categories } from './pages/categories/categories';
import { Employees } from './pages/employees/employees';
import { AiMonitoring } from './pages/ai-monitoring/ai-monitoring';
import { KnowledgeBase } from './pages/knowledge-base/knowledge-base';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // =========================
  // Public routes
  // =========================

  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },

  // =========================
  // Account / Profile
  // =========================

  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account').then(
        (m) => m.AccountPage,
      ),
    canActivate: [
      authGuard,
      roleGuard(['ADMIN', 'EMPLOYEE', 'CUSTOMER']),
    ],
  },

  // =========================
  // Management / Admin routes
  // =========================

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
  },
  {
    path: 'tickets',
    component: Tickets,
    canActivate: [authGuard, roleGuard(['ADMIN', 'EMPLOYEE'])],
  },
  {
    path: 'customers',
    component: Customers,
    canActivate: [authGuard, roleGuard(['ADMIN', 'EMPLOYEE'])],
  },
  {
    path: 'incidents',
    component: Incidents,
    canActivate: [authGuard, roleGuard(['ADMIN', 'EMPLOYEE'])],
  },
  {
    path: 'messages',
    component: Messages,
    canActivate: [authGuard, roleGuard(['ADMIN', 'EMPLOYEE'])],
  },
  {
    path: 'categories',
    component: Categories,
    canActivate: [
      authGuard,
      roleGuard(['ADMIN', 'EMPLOYEE', 'CUSTOMER']),
    ],
  },
  {
    path: 'employees',
    component: Employees,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
  },
  {
    path: 'ai-monitoring',
    component: AiMonitoring,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
  },
  {
    path: 'knowledge-base',
    component: KnowledgeBase,
    canActivate: [authGuard, roleGuard(['ADMIN'])],
  },

  // =========================
  // Customer Portal
  // =========================

  {
    path: 'customer',
    canActivate: [authGuard, roleGuard(['CUSTOMER'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/customer-portal/dashboard/dashboard').then(
            (m) => m.CustomerDashboard,
          ),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./pages/customer-portal/my-tickets/my-tickets').then(
            (m) => m.MyTickets,
          ),
      },
      {
        path: 'tickets/new',
        loadComponent: () =>
          import('./pages/customer-portal/create-ticket/create-ticket').then(
            (m) => m.CustomerCreateTicket,
          ),
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./pages/customer-portal/ticket-details/ticket-details').then(
            (m) => m.CustomerTicketDetails,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/customer-portal/messages/messages').then(
            (m) => m.CustomerMessages,
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },

  // =========================
  // Employee Portal
  // =========================

  {
    path: 'employee',
    canActivate: [authGuard, roleGuard(['EMPLOYEE'])],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/employee-portal/dashboard/dashboard').then(
            (m) => m.EmployeeDashboard,
          ),
      },
      {
        path: 'incidents',
        loadComponent: () =>
          import(
            './pages/employee-portal/assigned-incidents/assigned-incidents'
          ).then((m) => m.AssignedIncidents),
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import(
            './pages/employee-portal/incident-details/incident-details'
          ).then((m) => m.EmployeeIncidentDetails),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./pages/employee-portal/tickets/tickets').then(
            (m) => m.EmployeeTickets,
          ),
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./pages/employee-portal/ticket-details/ticket-details').then(
            (m) => m.EmployeeTicketDetails,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/employee-portal/messages/messages').then(
            (m) => m.EmployeeMessages,
          ),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },

  // =========================
  // Default routes
  // =========================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
