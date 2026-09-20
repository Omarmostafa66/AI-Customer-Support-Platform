import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalPage } from '../../../shared/portal-page';
import { PortalState } from '../../../shared/portal-state';
import { Message } from '../../../models/resources';
@Component({
  selector: 'app-employee-messages',
  standalone: true,
  imports: [CommonModule, PortalState],
  styleUrls: [
    '../../../shared/portal.css',
    '../../../shared/workspace.css',
    '../../../shared/workspace-data.css',
    './messages.css',
  ],
  templateUrl: './messages.html',
})
export class EmployeeMessages extends PortalPage {
  messages: Message[] = [];
  constructor() {
    super();
    effect(() => {
      this.user.currentEmployeeId();
      this.reload();
    });
  }
  reload(): void {
    this.resetRequests();
    this.messages = [];
    if (this.user.currentEmployeeId() === null) return;
    this.loadData(
      this.api.getMessages(),
      (rows) =>
        (this.messages = [...rows].sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || ''),
        )),
    );
  }
}
