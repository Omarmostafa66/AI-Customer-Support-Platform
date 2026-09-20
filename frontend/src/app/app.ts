import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth.service';

import { CustomerHeader } from './layout/customer-header/customer-header';
import { EmployeeSidebar } from './layout/employee-sidebar/employee-sidebar';
import { Sidebar } from './layout/sidebar/sidebar';

import { ToastComponent } from './shared/toast/toast.component';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    Sidebar,
    CustomerHeader,
    EmployeeSidebar,
    ToastComponent,
    ConfirmDialog,
  ],

  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly auth = inject(AuthService);
}
