import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Api } from '../../services/api';
import { Category, CategoryInput } from '../../models/resources';
import { CrudPage } from '../../shared/crud-page';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: [
    '../../shared/management.css',
    './categories.css',
    '../../shared/workspace.css',
    '../../shared/workspace-data.css',
  ],
})
export class Categories extends CrudPage<Category> {
  private readonly api = inject(Api);

  form: {
    name: string;
    description: string;
  } = {
    name: '',
    description: '',
  };

  fetchRecords() {
    return this.api.getCategories();
  }

  removeRecord(id: number) {
    return this.api.deleteCategory(id);
  }

  resetForm(): void {
    this.form = {
      name: '',
      description: '',
    };
  }

  edit(record: Category): void {
    if (this.busy || this.loading) {
      return;
    }

    this.editingId = record.id;

    this.form = {
      name: record.name ?? '',
      description: record.description ?? '',
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
    const description = this.form.description.trim();

    if (!name) {
      this.error = 'Category name is required.';

      this.toastService.warning(
        'Enter the category name before saving.',
        'Missing category name',
      );

      return;
    }

    const body: CategoryInput = {
      name,
      description,
    };

    const request =
      this.editingId !== null
        ? this.api.updateCategory(this.editingId, body)
        : this.api.createCategory(body);

    this.saveRequest(request);
  }
}
