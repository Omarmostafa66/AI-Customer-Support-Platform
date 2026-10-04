import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Api } from '../../services/api';
import { Employee, EmployeeInput } from '../../models/resources';
import { CrudPage } from '../../shared/crud-page';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrls: [
    '../../shared/management.css',
    './employees.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Employees extends CrudPage<Employee> {
  private readonly api = inject(Api);

  form: {
    name: string;
    email: string;
    password: string;
    role: string;
    age: number | null;
    gender: string;
    salary: number | null;
  } = {
    name: '',
    email: '',
    password: '',
    role: '',
    age: null,
    gender: '',
    salary: null,
  };

  fetchRecords() {
    return this.api.getEmployees();
  }

  removeRecord(id: number) {
    return this.api.deleteEmployee(id);
  }

  resetForm(): void {
    this.form = {
      name: '',
      email: '',
      password: '',
      role: '',
      age: null,
      gender: '',
      salary: null,
    };
  }

  edit(record: Employee): void {
    if (this.busy || this.loading) {
      return;
    }

    this.editingId = record.id;

    this.form = {
      name: record.name ?? '',
      email: record.email ?? '',
      password: '',
      role: record.role ?? '',
      age: record.age ?? null,
      gender: record.gender ?? '',
      salary: record.salary ?? null,
    };

    this.showForm = true;
    this.error = '';
    this.notice = '';
  }

  save(): void {
    if (this.busy || this.loading) {
      return;
    }

    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const password = this.form.password;
    const role = this.form.role.trim();
    const age = this.form.age;
    const gender = this.form.gender.trim();
    const salary = this.form.salary;

    if (!name) {
      this.error = 'Employee name is required.';

      this.toastService.warning(
        'Enter the employee name before saving.',
        'Missing employee name',
      );

      return;
    }

    if (!email) {
      this.error = 'Employee email is required.';

      this.toastService.warning(
        'Enter the employee email before saving.',
        'Missing employee email',
      );

      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Enter a valid email address.';

      this.toastService.warning(
        'Please enter a valid employee email address.',
        'Invalid email',
      );

      return;
    }

    if (!password.trim()) {
      this.error = 'Employee password is required.';

      this.toastService.warning(
        'Enter a password before saving the employee.',
        'Missing password',
      );

      return;
    }

    if (!role) {
      this.error = 'Employee role is required.';

      this.toastService.warning(
        'Enter the employee role before saving.',
        'Missing role',
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

    if (!gender) {
      this.error = 'Employee gender is required.';

      this.toastService.warning(
        'Enter the employee gender before saving.',
        'Missing gender',
      );

      return;
    }

    if (
      salary === null ||
      !Number.isFinite(salary) ||
      salary < 0
    ) {
      this.error = 'Enter a valid salary greater than or equal to 0.';

      this.toastService.warning(
        'Salary must be a valid number greater than or equal to 0.',
        'Invalid salary',
      );

      return;
    }

    const body: EmployeeInput = {
      name,
      email,
      password,
      role,
      age,
      gender,
      salary,
    };

    const request =
      this.editingId !== null
        ? this.api.updateEmployee(this.editingId, body)
        : this.api.createEmployee(body);

    this.saveRequest(request);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
