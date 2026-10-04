import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';
import {
  Customer,
  CustomerInput,
  Category,
  CategoryInput,
  Employee,
  EmployeeInput,
  Incident,
  IncidentInput,
  Message,
  MessageInput,
  Ticket,
  TicketInput,
  TicketAnalysis,
  Status,
  Account,
  UpdateAccountRequest,
  ChangePasswordRequest,
  AvatarResponse,
  AiChatRequest,
  AiChatResponse, KnowledgeArticle, KnowledgeArticleRequest,
  AiResolutionResponse,
  SlaMetrics,
  AttentionQueue,
  CustomerSatisfaction,
  CustomerSatisfactionMetrics,
  CustomerSatisfactionRequest,
  Notification,
} from '../models/resources';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private get<T>(path: string): Observable<T> {
    return this.http
      .get<T>(this.baseUrl + path)
      .pipe(timeout(20000));
  }

  private post<T>(
    path: string,
    body: unknown,
  ): Observable<T> {
    return this.http
      .post<T>(
        this.baseUrl + path,
        body,
      )
      .pipe(timeout(20000));
  }

  private put<T>(
    path: string,
    body: unknown,
  ): Observable<T> {
    return this.http
      .put<T>(
        this.baseUrl + path,
        body,
      )
      .pipe(timeout(20000));
  }

  private remove(
    path: string,
  ): Observable<void> {
    return this.http
      .delete<void>(
        this.baseUrl + path,
      )
      .pipe(timeout(20000));
  }

  getTickets(): Observable<Ticket[]> {
    return this.get('/tickets');
  }

  getSlaMetrics(): Observable<SlaMetrics> {
    return this.get('/tickets/sla/metrics');
  }

  getCustomerSatisfactionMetrics(): Observable<CustomerSatisfactionMetrics> {
    return this.http
      .get<CustomerSatisfactionMetrics>(
        this.baseUrl + '/admin/customer-satisfaction/metrics',
      )
      .pipe(timeout(20000));
  }

  // =========================================================
  // AI Monitoring
  // =========================================================

  getAiMetrics(): Observable<any> {
    return this.http
      .get<any>(this.baseUrl + '/admin/ai-monitoring/metrics')
      .pipe(timeout(20000));
  }

  getAiInteractionLogs(page: number = 0, size: number = 20): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/admin/ai-monitoring/logs?page=${page}&size=${size}`)
      .pipe(timeout(20000));
  }

  getAttentionQueue(): Observable<AttentionQueue> {
    return this.get('/tickets/attention');
  }

  getTicketsByEmployee(
    employeeId: number,
  ): Observable<Ticket[]> {
    return this.get(
      '/tickets/assigned/' +
        employeeId,
    );
  }

  getTicketById(
    id: number,
  ): Observable<Ticket> {
    return this.get(
      '/tickets/' + id,
    );
  }

  assignTicket(
    ticketId: number,
    employeeId: number,
  ): Observable<Ticket> {
    return this.put(
      '/tickets/' +
        ticketId +
        '/assign/' +
        employeeId,
      {},
    );
  }

  createTicket(
    body: TicketInput,
  ): Observable<Ticket> {
    return this.post(
      '/tickets',
      body,
    );
  }

  updateTicket(
    id: number,
    body: TicketInput,
  ): Observable<Ticket> {
    return this.put(
      '/tickets/' + id,
      body,
    );
  }

  updateTicketStatus(
    id: number,
    status: Status,
    resolutionNote?: string,
  ): Observable<Ticket> {
    return this.http
      .patch<Ticket>(
        this.baseUrl +
          '/tickets/' +
          id +
          '/status',
        {
          status,
          resolutionNote,
        },
      )
      .pipe(timeout(20000));
  }

  deleteTicket(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/tickets/' + id,
    );
  }

  getCustomers(): Observable<Customer[]> {
    return this.get('/customers');
  }

  getCustomerById(
    id: number,
  ): Observable<Customer> {
    return this.get(
      '/customers/' + id,
    );
  }

  createCustomer(
    body: CustomerInput,
  ): Observable<Customer> {
    return this.post(
      '/customers',
      body,
    );
  }

  updateCustomer(
    id: number,
    body: CustomerInput,
  ): Observable<Customer> {
    return this.put(
      '/customers/' + id,
      body,
    );
  }

  deleteCustomer(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/customers/' + id,
    );
  }

  getCategories(): Observable<Category[]> {
    return this.get('/categories');
  }

  getCategoryById(
    id: number,
  ): Observable<Category> {
    return this.get(
      '/categories/' + id,
    );
  }

  createCategory(
    body: CategoryInput,
  ): Observable<Category> {
    return this.post(
      '/categories',
      body,
    );
  }

  updateCategory(
    id: number,
    body: CategoryInput,
  ): Observable<Category> {
    return this.put(
      '/categories/' + id,
      body,
    );
  }

  deleteCategory(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/categories/' + id,
    );
  }

  getEmployees(): Observable<Employee[]> {
    return this.get('/employees');
  }

  getEmployeeById(
    id: number,
  ): Observable<Employee> {
    return this.get(
      '/employees/' + id,
    );
  }

  createEmployee(
    body: EmployeeInput,
  ): Observable<Employee> {
    return this.post(
      '/employees',
      body,
    );
  }

  updateEmployee(
    id: number,
    body: EmployeeInput,
  ): Observable<Employee> {
    return this.put(
      '/employees/' + id,
      body,
    );
  }

  deleteEmployee(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/employees/' + id,
    );
  }

  getIncidents(): Observable<Incident[]> {
    return this.get('/incidents');
  }

  getIncidentById(
    id: number,
  ): Observable<Incident> {
    return this.get(
      '/incidents/' + id,
    );
  }

  createIncident(
    body: IncidentInput,
  ): Observable<Incident> {
    return this.post(
      '/incidents',
      body,
    );
  }

  updateIncident(
    id: number,
    body: IncidentInput,
  ): Observable<Incident> {
    return this.put(
      '/incidents/' + id,
      body,
    );
  }

  deleteIncident(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/incidents/' + id,
    );
  }

  getMessages(): Observable<Message[]> {
    return this.get('/messages');
  }

  getMessageById(
    id: number,
  ): Observable<Message> {
    return this.get(
      '/messages/' + id,
    );
  }

  createMessage(
    body: MessageInput,
  ): Observable<Message> {
    return this.post(
      '/messages',
      body,
    );
  }

  updateMessage(
    id: number,
    body: MessageInput,
  ): Observable<Message> {
    return this.put(
      '/messages/' + id,
      body,
    );
  }

  deleteMessage(
    id: number,
  ): Observable<void> {
    return this.remove(
      '/messages/' + id,
    );
  }

  analyzeTicket(
    id: number,
  ): Observable<TicketAnalysis> {
    return this.http
      .get<TicketAnalysis>(
        this.baseUrl +
          '/tickets/' +
          id +
          '/analyze',
      )
      .pipe(timeout(120000));
  }

  getSavedTicketAnalysis(
    id: number,
  ): Observable<TicketAnalysis | null> {
    return this.get<TicketAnalysis | null>(
      '/tickets/' + id + '/ai-analysis',
    );
  }

  getResolutionAssessment(
    ticketId: number,
  ): Observable<AiResolutionResponse> {
    return this.http
      .get<AiResolutionResponse>(
        this.baseUrl +
          '/tickets/' +
          ticketId +
          '/resolution-assessment',
      )
      .pipe(timeout(120000));
  }

  confirmTicketResolution(
    ticketId: number,
  ): Observable<Ticket> {
    return this.http
      .post<Ticket>(
        this.baseUrl +
          '/tickets/' +
          ticketId +
          '/confirm-resolution',
        {},
      )
      .pipe(timeout(20000));
  }

  submitTicketSatisfaction(
    ticketId: number,
    request: CustomerSatisfactionRequest,
  ): Observable<CustomerSatisfaction> {
    return this.http
      .post<CustomerSatisfaction>(
        this.baseUrl + '/tickets/' + ticketId + '/satisfaction',
        request,
      )
      .pipe(timeout(20000));
  }

  // =========================================================
  // Customer Satisfaction - Get Existing Rating
  // =========================================================
  getTicketSatisfaction(
    ticketId: number,
  ): Observable<CustomerSatisfaction | null> {
    return this.http
      .get<CustomerSatisfaction | null>(
        this.baseUrl +
          '/tickets/' +
          ticketId +
          '/satisfaction',
      )
      .pipe(timeout(20000));
  }

  chatWithAi(
    request: AiChatRequest,
  ): Observable<AiChatResponse> {
    return this.http
      .post<AiChatResponse>(
        this.baseUrl + '/ai/chat',
        request,
      )
      .pipe(timeout(120000));
  }

  getTicketsByCustomer(
    customerId: number,
  ): Observable<Ticket[]> {
    return this.get(
      '/tickets/customer/' +
        customerId,
    );
  }

  createTicketForCustomer(
    customerId: number,
    body: TicketInput,
  ): Observable<Ticket> {
    return this.post(
      '/tickets/customer/' +
        customerId,
      body,
    );
  }

  createTicketForCustomerAndCategory(
    customerId: number,
    categoryId: number,
    body: TicketInput,
  ): Observable<Ticket> {
    return this.post(
      '/tickets/customer/' +
        customerId +
        '/category/' +
        categoryId,
      body,
    );
  }

  createMessageForCustomer(
    customerId: number,
    body: MessageInput,
  ): Observable<Message> {
    return this.post(
      '/messages/customer/' +
        customerId,
      body,
    );
  }

  // =========================================================
  // Ticket Conversation
  // =========================================================

  getMessagesByTicket(
    ticketId: number,
  ): Observable<Message[]> {
    return this.get(
      '/messages/ticket/' +
        ticketId,
    );
  }

  createMessageForTicket(
    ticketId: number,
    txt: string,
  ): Observable<Message> {
    return this.post(
      '/messages/ticket/' +
        ticketId,
      {
        txt,
      },
    );
  }

  createIncidentForEmployee(
    employeeId: number,
    body: IncidentInput,
  ): Observable<Incident> {
    return this.post(
      '/incidents/employee/' +
        employeeId,
      body,
    );
  }

  getIncidentsByEmployee(
    employeeId: number,
  ): Observable<Incident[]> {
    return this.get(
      '/incidents/employee/' +
        employeeId,
    );
  }

  getIncidentsByStatus(
    status: Status,
  ): Observable<Incident[]> {
    return this.get(
      '/incidents/status/' +
        status,
    );
  }

  getIncidentsBySameMessage(
    sameMessage: boolean,
  ): Observable<Incident[]> {
    return this.get(
      '/incidents/same-message/' +
        sameMessage,
    );
  }

  assignIncident(
    id: number,
    employeeId: number,
  ): Observable<Incident> {
    return this.put(
      '/incidents/' +
        id +
        '/assign/' +
        employeeId,
      {},
    );
  }

  assignIncidentCategory(
    id: number,
    categoryId: number,
  ): Observable<Incident> {
    return this.put(
      '/incidents/' +
        id +
        '/category/' +
        categoryId,
      {},
    );
  }

  resolveIncident(
    id: number,
  ): Observable<Incident> {
    return this.put(
      '/incidents/' +
        id +
        '/resolve',
      {},
    );
  }

  // =========================================================
  // Customer Notifications
  // =========================================================

  getNotifications(): Observable<Notification[]> {
    return this.get('/notifications');
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.get('/notifications/unread-count');
  }

  markNotificationAsRead(
    notificationId: number,
  ): Observable<Notification> {
    return this.http
      .patch<Notification>(
        this.baseUrl +
          '/notifications/' +
          notificationId +
          '/read',
        {},
      )
      .pipe(timeout(20000));
  }

  // =========================================================
  // Account
  // =========================================================

  getMyAccount(): Observable<Account> {
    return this.get('/account/me');
  }

  updateMyAccount(
    body: UpdateAccountRequest,
  ): Observable<Account> {
    return this.put(
      '/account/me',
      body,
    );
  }

  changePassword(
    body: ChangePasswordRequest,
  ): Observable<{ message: string }> {
    return this.put(
      '/account/me/password',
      body,
    );
  }

  uploadAvatar(
    file: File,
  ): Observable<AvatarResponse> {
    const formData = new FormData();

    formData.append(
      'file',
      file,
    );

    /*
     * Do NOT manually set Content-Type here.
     *
     * Browser automatically creates:
     * multipart/form-data; boundary=...
     *
     * The authentication interceptor will also
     * attach the JWT Authorization header.
     */
    return this.http
      .post<AvatarResponse>(
        this.baseUrl +
          '/account/me/avatar',
        formData,
      )
      .pipe(timeout(20000));
  }

  deleteAvatar(): Observable<void> {
    return this.remove(
      '/account/me/avatar',
    );
  }

  /*
   * Load the avatar through HttpClient instead
   * of using a normal <img src="..."> request.
   *
   * This is important because HttpClient passes
   * through auth.interceptor.ts and therefore
   * sends the JWT Authorization header.
   */
  getAvatar(): Observable<Blob> {
    return this.http
      .get(
        this.baseUrl +
          '/account/me/avatar',
        {
          responseType: 'blob',
        },
      )
      .pipe(timeout(20000));
  }

  getHealth(): Observable<{ status: string }> {
    return this.get('/health');
  }

  // =========================================================
  // Knowledge Base
  // =========================================================

  getKnowledgeArticles(): Observable<KnowledgeArticle[]> {
    return this.get('/admin/knowledge-base');
  }

  getPublishedKnowledgeArticles(): Observable<KnowledgeArticle[]> {
    return this.get('/admin/knowledge-base/published');
  }

  getKnowledgeArticle(id: number): Observable<KnowledgeArticle> {
    return this.get('/admin/knowledge-base/' + id);
  }

  createKnowledgeArticle(
    request: KnowledgeArticleRequest,
  ): Observable<KnowledgeArticle> {
    return this.post('/admin/knowledge-base', request);
  }

  updateKnowledgeArticle(
    id: number,
    request: KnowledgeArticleRequest,
  ): Observable<KnowledgeArticle> {
    return this.put('/admin/knowledge-base/' + id, request);
  }

  deleteKnowledgeArticle(id: number): Observable<void> {
    return this.remove('/admin/knowledge-base/' + id);
  }

  searchKnowledgeArticles(query: string): Observable<KnowledgeArticle[]> {
    return this.get('/admin/knowledge-base/search?query=' + encodeURIComponent(query));
  }

}