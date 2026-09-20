import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmDialogState extends ConfirmDialogConfig {
  visible: boolean;
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState>({
    visible: false,
    loading: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: true,
  });

  private resolver: ((confirmed: boolean) => void) | null = null;

  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    this.state.set({
      visible: true,
      loading: false,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText ?? 'Confirm',
      cancelText: config.cancelText ?? 'Cancel',
      danger: config.danger ?? true,
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  setLoading(loading: boolean): void {
    this.state.update((state) => ({
      ...state,
      loading,
    }));
  }

  approve(): void {
    if (this.state().loading) {
      return;
    }

    this.close(true);
  }

  cancel(): void {
    if (this.state().loading) {
      return;
    }

    this.close(false);
  }

  private close(result: boolean): void {
    this.state.update((state) => ({
      ...state,
      visible: false,
      loading: false,
    }));

    const resolver = this.resolver;
    this.resolver = null;

    resolver?.(result);
  }
}
