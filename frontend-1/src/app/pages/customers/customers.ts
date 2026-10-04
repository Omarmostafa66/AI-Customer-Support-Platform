import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Api } from '../../services/api';
import { Customer, CustomerInput } from '../../models/resources';
import { CrudPage } from '../../shared/crud-page';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: [
    '../../shared/management.css',
    './customers.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Customers extends CrudPage<Customer> {
  private readonly api = inject(Api);

  form: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    gender: string;
    age: number | null;
  } = {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    gender: '',
    age: null,
  };

  fetchRecords() {
    return this.api.getCustomers();
  }

  removeRecord(id: number) {
    return this.api.deleteCustomer(id);
  }

  resetForm(): void {
    this.form = {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      address: '',
      gender: '',
      age: null,
    };
  }

  edit(record: Customer): void {
    if (this.busy || this.loading) return;

    this.editingId = record.id;

    this.form = {
      name: record.name ?? '',
      email: record.email ?? '',
      password: '',
      phoneNumber: record.phoneNumber ?? '',
      address: record.address ?? '',
      gender: record.gender ?? '',
      age: record.age ?? null,
    };

    this.showForm = true;
    this.error = '';
    this.notice = '';
  }

  save(): void {
    if (this.busy || this.loading) return;

    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const password = this.form.password;
    const phoneNumber = this.form.phoneNumber.trim();
    const address = this.form.address.trim();
    const gender = this.form.gender.trim();
    const age = this.form.age;

    if (!name) {
      this.error = 'Customer name is required.';
      this.toastService.warning(
        'Enter the customer name before saving.',
        'Missing customer name',
      );
      return;
    }

    if (!email) {
      this.error = 'Customer email is required.';
      this.toastService.warning(
        'Enter the customer email before saving.',
        'Missing customer email',
      );
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Enter a valid email address.';
      this.toastService.warning(
        'Please enter a valid email address.',
        'Invalid email',
      );
      return;
    }

    if (!password) {
      this.error = 'Customer password is required.';
      this.toastService.warning(
        'Enter a password before saving the customer.',
        'Missing password',
      );
      return;
    }

    if (!phoneNumber) {
      this.error = 'Customer phone number is required.';
      this.toastService.warning(
        'Enter the customer phone number before saving.',
        'Missing phone number',
      );
      return;
    }

    if (!address) {
      this.error = 'Customer address is required.';
      this.toastService.warning(
        'Enter the customer address before saving.',
        'Missing address',
      );
      return;
    }

    if (!gender) {
      this.error = 'Customer gender is required.';
      this.toastService.warning(
        'Enter the customer gender before saving.',
        'Missing gender',
      );
      return;
    }

    if (
      age === null ||
      !Number.isFinite(age) ||
      age < 0 ||
      !Number.isInteger(age)
    ) {
      this.error = 'Enter a valid whole-number age.';
      this.toastService.warning(
        'Age must be a valid whole number greater than or equal to 0.',
        'Invalid age',
      );
      return;
    }

    const body: CustomerInput = {
      name,
      email,
      password,
      phoneNumber,
      address,
      gender,
      age,
    };

    this.saveRequest(
      this.editingId !== null
        ? this.api.updateCustomer(this.editingId, body)
        : this.api.createCustomer(body),
    );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
