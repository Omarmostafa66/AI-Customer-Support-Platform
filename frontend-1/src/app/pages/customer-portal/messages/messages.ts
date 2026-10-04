import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerPage } from '../shared/customer-page';
import { CustomerState } from '../shared/customer-state';
import { Message } from '../../../models/resources';
@Component({
  selector: 'app-customer-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomerState],
  styleUrls: ['../shared/customer-ui.css', '../shared/customer-forms.css'],
  templateUrl: './messages.html',
})
export class CustomerMessages extends CustomerPage {
  text = '';
  sent: Message[] = [];
  constructor() {
    super();
    effect(() => {
      this.user.currentCustomerId();
      this.resetRequests();
      this.text = '';
      this.sent = [];
    });
  }
  send(): void {
    const id = this.user.currentCustomerId();
    if (id === null || this.busy) return;
    if (!this.text.trim()) {
      this.error = 'Message text is required.';
      return;
    }
    this.submit(this.api.createMessageForCustomer(id, { txt: this.text.trim() }), (message) => {
      this.sent = [message, ...this.sent];
      this.text = '';
      this.notice = 'Message submitted.';
    });
  }
}
