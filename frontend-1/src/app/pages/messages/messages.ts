import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Api } from '../../services/api';
import { Message, Customer, MessageInput } from '../../models/resources';
import { CrudPage } from '../../shared/crud-page';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: [
    '../../shared/management.css',
    './messages.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Messages extends CrudPage<Message> {
  private readonly api = inject(Api);

  customers: Customer[] = [];
  customersLoading = false;
  customerError = '';

  editingCustomer = '';

  form: {
    txt: string;
    customerId: number | null;
  } = {
    txt: '',
    customerId: null,
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadCustomers();
  }

  fetchRecords() {
    return this.api.getMessages();
  }

  removeRecord(id: number) {
    return this.api.deleteMessage(id);
  }

  resetForm(): void {
    this.form = {
      txt: '',
      customerId: null,
    };

    this.editingCustomer = '';
  }

  loadCustomers(): void {
    if (this.customersLoading || this.busy) {
      return;
    }

    this.customersLoading = true;
    this.customerError = '';

    this.api
      .getCustomers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.customers = records;
          this.customersLoading = false;

          this.cdr.markForCheck();
        },

        error: (error) => {
          const message = apiError(
            error,
            'Could not load customer choices.',
          );

          this.customerError = message;
          this.customersLoading = false;

          this.toastService.error(
            message,
            'Could not load customers',
          );

          this.cdr.markForCheck();
        },
      });
  }

  edit(record: Message): void {
    if (this.busy || this.loading || this.customersLoading) {
      return;
    }

    this.editingId = record.id;

    this.form = {
      txt: record.txt ?? '',
      customerId: record.customer?.id ?? null,
    };

    this.editingCustomer = record.customer
      ? record.customer.name + ' — ' + record.customer.email
      : 'No customer linked';

    this.showForm = true;
    this.error = '';
    this.notice = '';
  }

  save(): void {
    if (this.busy || this.loading) {
      return;
    }

    const text = this.form.txt.trim();

    if (!text) {
      this.error = 'Message text is required.';

      this.toastService.warning(
        'Enter the message text before saving.',
        'Missing message text',
      );

      return;
    }

    const body: MessageInput = {
      txt: text,
    };

    const request =
      this.editingId !== null
        ? this.api.updateMessage(this.editingId, body)
        : this.form.customerId !== null
          ? this.api.createMessageForCustomer(
              this.form.customerId,
              body,
            )
          : this.api.createMessage(body);

    this.saveRequest(request);
  }
}
