import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';

import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly dialogService = inject(ConfirmDialogService);

  @ViewChild('confirmButton')
  private confirmButton?: ElementRef<HTMLButtonElement>;

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (!this.dialogService.state().visible) {
      return;
    }

    this.dialogService.cancel();
  }

  approve(): void {
    this.dialogService.approve();
  }

  cancel(): void {
    this.dialogService.cancel();
  }
}
