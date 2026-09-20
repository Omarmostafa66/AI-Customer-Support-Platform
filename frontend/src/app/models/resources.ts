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

export interface Message {
  id: number;
  txt: string;
  createdAt: string | null;
  customer: Customer | null;
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
  fingerprint: string;
  createdAt: string | null;
  updatedAt: string | null;
  customer: Customer | null;
  category: Category | null;
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
}
