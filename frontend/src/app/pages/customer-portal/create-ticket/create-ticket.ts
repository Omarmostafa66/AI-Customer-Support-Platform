import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerPage } from '../shared/customer-page';
import { CustomerState } from '../shared/customer-state';
import { Category, TicketInput, Ticket } from '../../../models/resources';
@Component({
  selector: 'app-customer-create-ticket',
  standalone: true,
  imports: [FormsModule, RouterLink, CustomerState],
  styleUrls: ['../shared/customer-ui.css', '../shared/customer-forms.css'],
  templateUrl: './create-ticket.html',
})
export class CustomerCreateTicket extends CustomerPage {
  submitted: Ticket | null = null;
  categories: Category[] = [];
  form: { title: string; description: string; categoryId: number | null } = {
    title: '',
    description: '',
    categoryId: null,
  };
  constructor() {
    super();
    effect(() => {
      this.user.currentCustomerId();
      this.resetRequests();
      this.submitted=null;
      this.form = { title: '', description: '', categoryId: null };
      this.loadCategories();
    });
  }
  loadCategories(): void {
    this.categories = [];
    if (this.user.currentCustomerId() !== null)
      this.loadData(this.api.getCategories(), (rows) => (this.categories = rows));
  }
  save(): void {
    const id = this.user.currentCustomerId();
    if (this.busy || this.submitted || id === null) return;
    if (!this.form.title.trim() || !this.form.description.trim()) {
      this.error = 'Title and description are required.';
      return;
    }
    // The backend requires both enums and has no ticket defaults. Keep workflow
    // defaults here; customers never choose system status or priority.
    const body: TicketInput = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      status: 'OPEN',
      priority: 'MEDIUM',
    };
    const request =
      this.form.categoryId === null
        ? this.api.createTicketForCustomer(id, body)
        : this.api.createTicketForCustomerAndCategory(id, this.form.categoryId, body);
    this.submit(request, (ticket) => {
      this.form = { title: '', description: '', categoryId: null };
      this.submitted=ticket;
    });
  }
}
