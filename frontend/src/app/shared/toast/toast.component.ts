import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  icon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';

      case 'error':
        return '!';

      case 'warning':
        return '⚠';

      default:
        return 'i';
    }
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}
