import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { ToastService } from '../../shared/toast/toast.service';
import { apiError } from '../../shared/api-error';

@Component({
  selector: 'app-ai-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-monitoring.html',
  styleUrls: [
    '../../shared/management.css',
    '../../shared/workspace-data.css',
    './ai-monitoring.css'
  ]
})
export class AiMonitoring implements OnInit {
  private readonly api = inject(Api);
  private readonly toast = inject(ToastService);

  loadingMetrics = false;
  loadingLogs = false;

  metrics: any = null;
  logsPage: any = null;

  currentPage = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.loadMetrics();
    this.loadLogs();
  }

  loadMetrics(): void {
    this.loadingMetrics = true;
    this.api.getAiMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loadingMetrics = false;
      },
      error: (err) => {
        this.loadingMetrics = false;
        this.toast.error(apiError(err, 'Failed to load AI metrics.'));
      }
    });
  }

  loadLogs(): void {
    this.loadingLogs = true;
    this.api.getAiInteractionLogs(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.logsPage = data;
        this.loadingLogs = false;
      },
      error: (err) => {
        this.loadingLogs = false;
        this.toast.error(apiError(err, 'Failed to load AI logs.'));
      }
    });
  }

  nextPage(): void {
    if (this.logsPage && !this.logsPage.last) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLogs();
    }
  }
}
