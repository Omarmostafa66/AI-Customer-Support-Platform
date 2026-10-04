import { Component, input } from '@angular/core';

@Component({
  selector: 'app-portal-state',
  standalone: true,
  template: `
    @if (loading()) {
      <p class="loading-message portal-state-message" role="status">
        <span class="state-spinner" aria-hidden="true"></span>
        <span>Loading...</span>
      </p>
    }

    @if (error()) {
      <p class="error-message portal-state-message" role="alert">
        <span class="state-icon" aria-hidden="true">!</span>
        <span>{{ error() }}</span>
      </p>
    }

    @if (notice()) {
      <p class="success-message portal-state-message" role="status">
        <span class="state-icon" aria-hidden="true">✓</span>
        <span>{{ notice() }}</span>
      </p>
    }
  `,
  styleUrl: './management.css',
})
export class PortalState {
  loading = input(false);
  error = input('');
  notice = input('');
}
