import { HttpErrorResponse } from '@angular/common/http';
/** Keep diagnostics out of customer copy, without logging request bodies or credentials. */
export function customerError(error: unknown, fallback: string): string {
  console.error('Customer support request failed', error instanceof HttpErrorResponse ? {status:error.status, url:error.url, message:error.message} : {type:error instanceof Error ? error.name : 'Unknown error'});
  if(error instanceof HttpErrorResponse && error.status === 400) return 'Please check the information you entered and try again.';
  return fallback;
}
