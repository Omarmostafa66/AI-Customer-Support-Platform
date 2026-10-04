export const STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export type Status = (typeof STATUSES)[number];

export const PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
] as const;

export type Priority = (typeof PRIORITIES)[number];


// =========================================================
// Customer
// =========================================================

export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  age: number;
}

export type CustomerInput =
  Omit<Customer, 'id'> & {
    password: string;
  };


// =========================================================
// Account
// =========================================================

export interface Account {
  id: number;
  name: string;
  email: string;
  role: string;

  phoneNumber: string | null;
  address: string | null;

  gender: string;
  age: number;

  employeeRole: string | null;
  salary: number | null;

  hasAvatar: boolean;
}

export interface UpdateAccountRequest {
  name: string;
  email: string;

  phoneNumber?: string;
  address?: string;

  gender: string;
  age: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AvatarResponse {
  hasAvatar: boolean;
  avatarUrl: string | null;
}


// =========================================================
// Category
// =========================================================

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
}

export type CategoryInput =
  Pick<Category, 'name' | 'description'>;


// =========================================================
// Employee
// =========================================================

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  age: number;
  gender: string;
  salary: number;
}

export type EmployeeInput =
  Omit<Employee, 'id'> & {
    password: string;
  };


// =========================================================
// Incident
// =========================================================

export interface Incident {
  id: number;
  sameMessage: boolean;
  status: Status;
  fingerprint: string;
  createdAt: string | null;
  resolvedAt: string | null;
  category: Category | null;
  employee: Employee | null;
}

export interface IncidentInput {
  sameMessage: boolean;
  status: Status;
  category?: {
    id: number;
  };
}


// =========================================================
// Message
// =========================================================

export type MessageSenderType = 'CUSTOMER' | 'EMPLOYEE';

export interface Message {
  id: number;
  txt: string;
  createdAt: string | null;
  customer: Customer | null;
  ticket: Ticket | null;
  senderType: MessageSenderType | null;
}

export interface MessageInput {
  txt: string;
}


// =========================================================
// Ticket
// =========================================================

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  resolutionNote?: string | null;
  fingerprint: string;
  createdAt: string | null;
  updatedAt: string | null;
  slaDueAt?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  slaStatus?:
    | 'WITHIN_SLA'
    | 'BREACHED'
    | 'RESOLVED_WITHIN_SLA'
    | 'RESOLVED_AFTER_SLA'
    | null;
  customer: Customer | null;
  category: Category | null;
  employee: Employee | null;
}

export type TicketInput =
  Pick<
    Ticket,
    'title' | 'description' | 'status' | 'priority'
  >;


// =========================================================
// Ticket Analysis
// =========================================================

export interface TicketAnalysis {
  category: string;
  suggestedPriority: string;
  suggestedResponse: string;

  sentiment: string;
  confidence: number;

  risk: string;
  recommendedAction: string;
  summary?: string;

  canAnswer: boolean;
  canResolve: boolean;
  escalate: boolean;
}


// =========================================================
// AI Chat
// =========================================================

export interface AiChatMessage {
  sender: 'assistant' | 'customer' | 'system';
  text: string;
}

export interface AiChatRequest {
  conversationId: number | null;
  message: string;
  conversation: AiChatMessage[];
}

export interface AiChatResponse {
  conversationId: number | null;
  message: string;
  category: string;
  suggestedPriority: string;
  sentiment: string;
  confidence: number;
  risk: string;
  canAnswer: boolean;
  canResolve: boolean;
  escalate: boolean;
  ticketCreated: boolean;
  ticketId: number | null;
}

export interface AiResolutionResponse {
  resolved: boolean;
  confidence: number;
  reason: string;
}


// =========================================================
// SLA Metrics
// =========================================================

export interface SlaMetrics {
  totalTickets: number;
  withinSla: number;
  breached: number;
  resolvedWithinSla: number;
  resolvedAfterSla: number;
  averageFirstResponseMinutes: number;
  averageResolutionMinutes: number;
  slaCompliancePercentage: number;
}


// =========================================================
// Attention Queue
// =========================================================

export interface AttentionQueue {
  urgentTickets: number;
  highPriorityTickets: number;
  slaBreachedTickets: number;
  tickets: Ticket[];
}


// =========================================================
// Customer Satisfaction (CSAT)
// =========================================================

export interface CustomerSatisfaction {
  id: number;
  ticket: Ticket;
  rating: number;
  feedback: string | null;
  createdAt: string | null;
}

export interface CustomerSatisfactionMetrics {
  totalRatings: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

export interface CustomerSatisfactionRequest {
  rating: number;
  feedback?: string | null;
}


// =========================================================
// Notifications
// =========================================================

export interface Notification {
  id: number;
  customer: Customer;
  ticket: Ticket | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | null;
}

// =========================================================
// Knowledge Base
// =========================================================

export type KnowledgeArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  status: KnowledgeArticleStatus;
  createdBy?: Employee;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
  active: boolean;
}

export interface KnowledgeArticleRequest {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  status: KnowledgeArticleStatus;
}
