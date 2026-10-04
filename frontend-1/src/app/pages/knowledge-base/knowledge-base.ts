import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { ToastService } from '../../shared/toast/toast.service';
import { apiError } from '../../shared/api-error';
import { KnowledgeArticle, KnowledgeArticleRequest } from '../../models/resources';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knowledge-base.html',
  styleUrls: [
    '../../shared/management.css',
    '../../shared/workspace-data.css',
    './knowledge-base.css'
  ]
})
export class KnowledgeBase implements OnInit {
  private readonly api = inject(Api);
  private readonly toast = inject(ToastService);

  loading = false;
  articles: KnowledgeArticle[] = [];
  searchQuery = '';

  showEditor = false;
  editingArticleId: number | null = null;
  articleForm: KnowledgeArticleRequest = this.emptyForm();

  ngOnInit(): void {
    this.loadArticles();
  }

  emptyForm(): KnowledgeArticleRequest {
    return {
      title: '',
      content: '',
      category: '',
      status: 'DRAFT',
      tags: []
    };
  }

  loadArticles(): void {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.api.searchKnowledgeArticles(this.searchQuery).subscribe({
        next: (data) => {
          this.articles = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(apiError(err, 'Failed to search articles.'));
        }
      });
    } else {
      this.api.getKnowledgeArticles().subscribe({
        next: (data) => {
          this.articles = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toast.error(apiError(err, 'Failed to load articles.'));
        }
      });
    }
  }

  openEditor(article?: KnowledgeArticle): void {
    if (article) {
      this.editingArticleId = article.id;
      this.articleForm = {
        title: article.title,
        content: article.content,
        category: article.category,
        status: article.status,
        tags: article.tags || []
      };
    } else {
      this.editingArticleId = null;
      this.articleForm = this.emptyForm();
    }
    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingArticleId = null;
  }

  saveArticle(): void {
    if (!this.articleForm.title || !this.articleForm.content) {
      this.toast.error('Title and content are required.');
      return;
    }
    
    this.loading = true;
    
    const request = this.editingArticleId
      ? this.api.updateKnowledgeArticle(this.editingArticleId, this.articleForm)
      : this.api.createKnowledgeArticle(this.articleForm);

    request.subscribe({
      next: () => {
        this.toast.success(`Article ${this.editingArticleId ? 'updated' : 'created'} successfully.`);
        this.closeEditor();
        this.loadArticles();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(apiError(err, 'Failed to save article.'));
      }
    });
  }

  deleteArticle(id: number): void {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    this.loading = true;
    this.api.deleteKnowledgeArticle(id).subscribe({
      next: () => {
        this.toast.success('Article deleted successfully.');
        this.loadArticles();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(apiError(err, 'Failed to delete article.'));
      }
    });
  }
}
