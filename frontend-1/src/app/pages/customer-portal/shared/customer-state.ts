import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-customer-state',
  standalone: true,
  styleUrl: './customer-ui.css',
  template: `
    @if (loading()) {
      <p class="loading-panel" role="status">
        <span class="loading-dot" aria-hidden="true"></span>
        {{ loadingText() }}
      </p>
    }

    @if (error()) {
      <div class="notice error" role="alert">
        <p>{{ error() }}</p>

        @if (retryable()) {
          <button
            class="button secondary"
            (click)="retry.emit()"
            [disabled]="loading()">
            Try again
          </button>
        }
      </div>
    }

    @if (notice()) {
      <p class="notice success" role="status">
        {{ notice() }}
      </p>
    }
  `,
})
export class CustomerState {
  loading = input(false);
  loadingText = input('Loading your tickets...');
  error = input('');
  notice = input('');
  retryable = input(false);
  retry = output<void>();
}
