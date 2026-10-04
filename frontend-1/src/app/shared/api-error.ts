import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown, action: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return (
        action +
        ' The API could not be reached by your browser. Check the server connection and backend CORS permission for http://localhost:4200.'
      );
    }

    const body: unknown = error.error;

    // Handle validation errors returned by the backend.
    if (
      body &&
      typeof body === 'object' &&
      'errors' in body &&
      body.errors &&
      typeof body.errors === 'object'
    ) {
      const messages = Object.values(body.errors).filter(
        (value): value is string => typeof value === 'string',
      );

      if (messages.length) {
        return action + ' ' + messages.join(' ');
      }
    }

    // Handle a direct string response from the backend.
    if (typeof body === 'string' && body.trim()) {
      return action + ' ' + body.trim();
    }

    // Handle common backend error fields.
    if (body && typeof body === 'object') {
      if ('message' in body && typeof body.message === 'string' && body.message.trim()) {
        return action + ' ' + body.message.trim();
      }

      if ('detail' in body && typeof body.detail === 'string' && body.detail.trim()) {
        return action + ' ' + body.detail.trim();
      }
    }

    if (error.status === 400) {
      // PostgreSQL foreign-key violations may currently reach the frontend
      // as HTTP 400 when deleting a record that is still referenced.
      if (action.toLowerCase().includes('delete')) {
        return (
          action +
          ' This record cannot be deleted because it is still linked to other records such as tickets or messages.'
        );
      }

      return action + ' Check the entered values and try again (HTTP 400).';
    }

    if (error.status === 401) {
      return action + ' Your session has expired or you are not authenticated. Please log in again.';
    }

    if (error.status === 403) {
      return action + ' You do not have permission to perform this action.';
    }

    if (error.status === 404) {
      return (
        action +
        ' The API rejected this request or the record is no longer available. Refresh and check the values.'
      );
    }

    if (error.status === 409) {
      return (
        action +
        ' This operation conflicts with existing data. Check for duplicate values or linked records, then retry.'
      );
    }

    if (error.status >= 500) {
      return (
        action +
        ' The server could not complete this operation. Check the backend logs and try again.'
      );
    }

    return action + ' Check the entered values and try again (HTTP ' + error.status + ').';
  }

  return (
    action +
    ' The request timed out or failed. Refresh to check whether the change was saved before retrying.'
  );
}
