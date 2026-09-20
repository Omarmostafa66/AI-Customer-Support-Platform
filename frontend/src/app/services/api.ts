import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
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

  getTicketById(
    id: number,
  ): Observable<Ticket> {
    return this.get(
      '/tickets/' + id,
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
}
