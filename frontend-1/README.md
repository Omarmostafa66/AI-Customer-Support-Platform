<div align="center">

# 🤖 AI Customer Support Platform — Frontend

**Modern Angular Frontend for an Intelligent Customer Support Ecosystem**

Customer Support • Employee Workspace • Admin Management • AI Support •
Ticket Management • Notifications • Knowledge Base • AI Monitoring

</div>

---

## 📌 Overview

The **AI Customer Support Platform Frontend** is a modern Angular application designed to provide a complete, role-based customer support experience.

The frontend is not just a collection of pages. It acts as the main interaction layer between users and the intelligent support platform, providing dedicated experiences for:

- 👤 Customers
- 🧑‍💼 Employees
- 🛡️ Administrators

The application connects users with the backend REST APIs and provides the complete user interface for:

- 🤖 AI Customer Support
- 💬 Persistent conversations
- 🎫 Ticket management
- 🧑‍💼 Employee support workflows
- 🛡️ Administrative management
- 📚 Knowledge Base
- 📊 AI Monitoring
- 🔔 Notifications
- 😊 Customer Satisfaction
- 👤 Account & Profile management

---

## 🎯 Frontend Vision

The main goal of the frontend is to transform a complex customer-support backend into a clear and intuitive user experience.

```text
                AI CUSTOMER SUPPORT PLATFORM
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         👤 CUSTOMER   🧑‍💼 EMPLOYEE   🛡️ ADMIN
             │             │             │
             ▼             ▼             ▼
        AI Support      Support       Management
        Tickets         Workspace     Dashboard
        Notifications   Tickets       AI Monitoring
        CSAT            AI Analysis   Knowledge Base
        Account         SLA           Customers
                        Incidents     Employees
```

Each role gets a dedicated workspace based on its responsibilities.

---

## ✨ Main Frontend Features

### 🤖 AI Customer Support

The frontend provides a dedicated AI Support experience where customers can communicate directly with the AI assistant. The interface handles:

- 💬 Customer messages
- 🤖 AI responses
- ⏳ Loading states
- ❌ Error states
- 🎫 Ticket creation notifications
- 🔗 Ticket navigation
- 🧠 Conversation persistence
- 🔄 Conversation continuity
- 📌 Conversation state

The frontend sends the conversation context to the backend and receives structured AI responses.

### 💬 Persistent AI Conversation

One of the most important frontend features is conversation persistence. The AI Support interface maintains the active conversation state using a conversation identifier.

```text
Customer opens AI Support
          ↓
Start Conversation
          ↓
Backend creates Conversation
          ↓
Frontend receives conversationId
          ↓
Store active conversation
          ↓
Customer continues chatting
          ↓
Same conversation context
```

This prevents the chat from behaving like a completely new conversation every time the user navigates between pages. The frontend also preserves the visible chat experience during navigation using browser session state.

### 🎫 AI → Ticket Experience

When the AI determines that human support is required, the frontend reflects that transition to the customer:

```text
AI Support
    ↓
AI identifies escalation
    ↓
Support Ticket Created
    ↓
Customer receives confirmation
    ↓
View Ticket
    ↓
Ticket Details
```

This creates a smooth transition between **AI Support → Human Support** without forcing the customer to manually repeat the problem.

---

## 👤 Customer Portal

The Customer Portal provides a dedicated support experience focused on self-service.

### 🤖 AI Support
Customers can communicate with the AI assistant and continue their support conversation.

### 🎫 My Tickets
Customers can:

- View their tickets
- Open ticket details
- Follow ticket status
- View ticket conversations
- Track support progress

### 🔔 Notifications
Customers can:

- View notifications
- Check unread notifications
- Mark notifications as read
- Receive support-related updates

### 😊 Resolution & CSAT
Customers can:

- Review AI resolution assessment
- Confirm that an issue has been resolved
- Submit a rating
- Submit optional feedback

### 👤 Account
Customers can manage their:

- Profile information
- Account information
- Profile image
- Password
- Personal details

---

## 🧑‍💼 Employee Portal

The Employee Portal is designed as a dedicated support workspace. The frontend provides employees with tools for handling customer support cases.

### Employee Dashboard

The dashboard provides visibility into:

- Assigned workload
- Support statistics
- Recent assigned incidents
- Support activity

The interface is designed around the concept of a **support workspace** rather than a generic dashboard.

### 🎫 Employee Ticket Details

The Employee Ticket Details page is one of the main operational screens. It brings together:

```text
Ticket Information
       +
Customer Information
       +
Conversation
       +
AI Analysis
       +
Suggested Response
       +
Ticket Workflow
       +
Resolution
```

Employees can work with the ticket without leaving the support workspace.

### 🤖 AI Ticket Analysis UI

The frontend exposes AI-generated ticket analysis to employees. The interface can present information such as:

- 🏷️ Category
- 🚨 Risk
- 📊 Confidence
- ⭐ Suggested Priority
- 🧠 AI Analysis
- 💡 Recommended Action
- 💬 Suggested Response

The goal is to help employees understand the case faster:

```text
Ticket
   ↓
AI Analysis
   ↓
Employee understands the case
   ↓
Employee decides what to do
```

### 💬 Suggested Response

The Employee Ticket Details interface supports AI-generated suggested responses:

```text
Ticket
   ↓
AI Analysis
   ↓
Suggested Response
   ↓
Employee Reviews
   ↓
Employee Uses Response
   ↓
Ticket Conversation
```

The AI assists the employee while the employee remains responsible for the final customer communication.

---

## 🛡️ Admin / Management Frontend

The management interface provides administrative functionality for the support platform. The Admin workspace includes pages for:

- 📊 Dashboard
- 🎫 Tickets
- 👥 Customers
- 🧑‍💼 Employees
- 🚨 Incidents
- 💬 Messages
- 🏷️ Categories
- 🤖 AI Monitoring
- 📚 Knowledge Base

These pages provide a centralized management experience for support operations.

### 📊 AI Monitoring

The frontend includes a dedicated AI Monitoring area. This allows administrators to visualize AI-related operational information such as:

- AI interactions
- AI activity
- Escalations
- Confidence
- Risk
- AI availability
- AI performance information
- Failure / fallback information

The purpose is to make the AI system observable from the management interface instead of treating AI as a black box:

```text
AI Activity
    ↓
Backend Metrics
    ↓
Angular API Service
    ↓
AI Monitoring Page
    ↓
Admin Visibility
```

### 📚 Knowledge Base

The frontend contains a dedicated Knowledge Base management interface. Administrators and authorized users can work with support knowledge through the UI. It is designed around:

- 📄 Knowledge articles
- 🔎 Article search
- 🟢 Active content
- 🔴 Inactive content
- ✏️ Article management
- 📚 Support knowledge organization

This gives the support platform a structured knowledge-management layer.

---

## 🔔 Notifications UI

Notifications are integrated into the user experience rather than existing as a separate page only.

```text
Backend Event
      ↓
Notification
      ↓
Angular Service
      ↓
Header / Notification UI
      ↓
Unread Count
      ↓
Mark as Read
      ↓
UI Refresh
```

The goal is to make important support events visible without requiring the user to manually refresh the application.

---

## 👤 Account & Profile

The frontend contains a dedicated Account page accessible by authenticated users. The account experience supports:

- Personal information
- Profile information
- Profile image
- Password management
- Account-related actions

The UI follows the same visual language used throughout the application.

---

## 🔐 Frontend Authentication

The frontend includes an authentication layer responsible for maintaining the logged-in user experience. It is integrated with:

- Login
- Registration
- Protected routes
- JWT storage
- API authentication
- Role-based navigation

### 🛡️ Route Protection

The Angular application uses route guards to control access. Two important guards are used:

```text
authGuard
roleGuard
```

The routing system distinguishes between:

| Route Type | Routes |
|------------|--------|
| **Public** | `/login`, `/register` |
| **Authenticated** | `/account` |
| **Admin** | `/dashboard` |
| **Employee / Admin** | `/tickets`, `/customers`, `/incidents`, `/messages`, `/categories`, `/employees` |
| **AI Monitoring** | `/ai-monitoring` |
| **Knowledge Base** | `/knowledge-base` |

The application checks authentication and role before allowing access to protected pages.

### 🔑 JWT HTTP Interceptor

The frontend uses an HTTP interceptor to automatically attach the authentication token to API requests:

```text
Angular HTTP Request
        ↓
Auth Interceptor
        ↓
Check JWT Token
        ↓
Attach: Authorization: Bearer <token>
        ↓
Backend API
```

Authentication endpoints such as `/auth/login` and `/auth/register` are excluded from adding the existing JWT token. This keeps authentication handling centralized instead of repeating authorization logic inside every service.

### 🧭 Angular Routing Architecture

The application uses Angular Router. The routing architecture separates:

```text
Public
   ↓
Authentication
   ↓
Account
   ↓
Customer
   ↓
Employee
   ↓
Admin
```

Routes are protected according to the user's role. This provides a clear navigation architecture and prevents unauthorized access to role-specific pages.

---

## 🧩 Frontend Architecture

The Angular application follows a structured component/service architecture.

```text
Page / Component
       ↓
Angular Service
       ↓
HTTP Client
       ↓
REST API
       ↓
Backend
```

For example:

```text
AI Support Component
       ↓
API Service
       ↓
POST /ai/chat
       ↓
Backend
       ↓
AI Response
       ↓
Angular UI
```

### 🧱 Frontend Layers

#### 1. Pages

Application pages represent complete user experiences. Examples include:

```text
Login
Register
Dashboard
Tickets
Customers
Employees
Incidents
Messages
Categories
AI Monitoring
Knowledge Base
Account
```

The project also contains dedicated Customer and Employee portal experiences.

#### 2. Components

Components are responsible for:

- UI rendering
- User interactions
- Forms
- Tables
- Cards
- Modals
- Loading states
- Error states
- Success states

#### 3. Services

Angular services handle communication with the backend. Instead of placing API calls directly inside every UI element:

```text
Component
    ↓
Service
    ↓
HTTP Client
```

This keeps the frontend easier to maintain.

#### 4. Models

The application contains shared TypeScript models representing backend resources and API responses, such as:

- Users
- Customers
- Employees
- Tickets
- Messages
- AI responses
- AI analysis
- Notifications
- Satisfaction
- Knowledge articles

This provides consistent typing across the application.

#### 5. Guards

```text
authGuard
roleGuard
```

These control access to protected routes.

#### 6. Interceptors

```text
auth.interceptor.ts
```

The authentication interceptor centralizes JWT handling for HTTP requests.

---

## 🎨 UI / UX Design

The frontend follows a modern management-dashboard style. The UI focuses on:

- ✨ Clean layouts
- 📐 Consistent spacing
- 🧩 Reusable cards
- 🗂️ Structured tables
- 🔘 Clear action buttons
- 💬 Toast notifications
- ⏳ Loading states
- ❌ Error states
- 📱 Responsive layouts
- 🎞️ Smooth transitions
- ♿ Accessible focus states

The design system is shared across different workspaces to maintain visual consistency.

### 📱 Responsive Design

The frontend is designed to work across:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Tablet
- 📱 Mobile

Responsive behavior includes:

- Flexible layouts
- Stacked sections
- Responsive forms
- Mobile-friendly buttons
- Flexible information grids
- Responsive tables
- Mobile navigation
- Responsive profile sections

The frontend also includes reduced-motion handling for users who prefer less animation.

### 🔄 UI State Management

The application consistently handles different UI states.

**Loading**

```text
Request Started
     ↓
Loading State
     ↓
Display Progress
```

**Success**

```text
API Success
     ↓
Update UI
     ↓
Display Success Feedback
```

**Error**

```text
API Error
     ↓
Handle Error
     ↓
Display User-Friendly Message
```

**Empty State**

When no data exists, the UI provides an appropriate empty state instead of showing a broken or blank screen.

---

## 🔗 Frontend ↔ Backend Integration

The frontend communicates with the backend through REST APIs.

```text
┌──────────────────────────┐
│        Angular UI        │
│                          │
│    Pages / Components    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Angular Services     │
│                          │
│    API calls / Models    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│         REST API         │
│                          │
│   Spring Boot Backend    │
└──────────────────────────┘
```

This keeps the frontend independent from backend implementation details while maintaining a clear API contract.

---

## 🗂️ Frontend Project Structure

```text
frontend-1/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   │
│   │   ├── layout/
│   │   │
│   │   ├── models/
│   │   │   └── resources.ts
│   │   │
│   │   ├── pages/
│   │   │   │
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── account/
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   ├── customers/
│   │   │   ├── employees/
│   │   │   ├── incidents/
│   │   │   ├── messages/
│   │   │   ├── categories/
│   │   │   ├── ai-monitoring/
│   │   │   ├── knowledge-base/
│   │   │   │
│   │   │   ├── customer-portal/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── ai-support/
│   │   │   │   └── ticket-details/
│   │   │   │
│   │   │   └── employee-portal/
│   │   │       ├── dashboard/
│   │   │       └── ticket-details/
│   │   │
│   │   ├── services/
│   │   │
│   │   ├── shared/
│   │   │   ├── portal.css
│   │   │   ├── workspace.css
│   │   │   ├── workspace-data.css
│   │   │   └── ...
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   │
│   ├── assets/
│   ├── styles.css
│   └── index.html
│
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── .gitignore
```

---

## 🧭 Main Frontend Workspaces

### 👤 Customer Workspace

```text
Customer Portal
│
├── Dashboard
├── AI Support
├── My Tickets
├── Ticket Details
├── Notifications
├── Account
└── CSAT / Resolution
```

### 🧑‍💼 Employee Workspace

```text
Employee Portal
│
├── Support Dashboard
├── Assigned Tickets
├── Ticket Details
├── Customer Conversation
├── AI Assessment
├── Suggested Response
├── Incidents
└── Support Workflow
```

### 🛡️ Admin Workspace

```text
Management Portal
│
├── Dashboard
├── Tickets
├── Customers
├── Employees
├── Categories
├── Incidents
├── Messages
├── AI Monitoring
└── Knowledge Base
```

---

## 🤖 AI Support Frontend Flow

```text
Customer
   ↓
AI Support Page
   ↓
Enter Message
   ↓
Angular Component
   ↓
AI API Service
   ↓
POST /ai/chat
   ↓
Backend AI Processing
   ↓
AI Response
   ↓
Angular UI
   ↓
┌────────────────────────────┐
│                            │
▼                            ▼
AI Answer                 Escalation
                              ↓
                         Ticket Created
                              ↓
                         View Ticket
```

## 🎫 Ticket Frontend Flow

```text
Ticket
   ↓
Ticket List
   ↓
Ticket Details
   ↓
Conversation
   ↓
AI Analysis
   ↓
Suggested Response
   ↓
Employee Action
   ↓
Status Update
   ↓
Resolution
```

## 🔐 Frontend Security Architecture

```text
Login
  ↓
JWT Token
  ↓
Authentication State
  ↓
Auth Guard
  ↓
Role Guard
  ↓
Protected Route
  ↓
HTTP Interceptor
  ↓
Authorization Header
  ↓
Backend
```

This provides multiple layers of protection on the client side while the backend remains responsible for actual authorization enforcement.

---

## 🧪 Frontend Verification

The frontend should be verified through both build validation and functional testing.

```bash
# Install dependencies
npm install

# Run development server
ng serve

# Production build
ng build
```

The frontend should compile successfully before deployment.

---

## 🚀 Getting Started

### 📋 Requirements

Before running the frontend, make sure you have:

- 🟢 Node.js
- 📦 npm
- 🅰️ Angular CLI
- 💻 Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Omarmostafa66/AI-Customer-Support-Platform.git
cd AI-Customer-Support-Platform
cd frontend-1
```

### 2️⃣ Install Node Dependencies

```bash
npm install
```

This installs all dependencies defined in `package.json` and creates the `node_modules/` folder.

### 3️⃣ Install Angular CLI

If Angular CLI is not already installed globally:

```bash
npm install -g @angular/cli
```

Verify the installation:

```bash
ng version
```

### 4️⃣ Run the Angular Application

From the `frontend-1` directory:

```bash
ng serve
```

Angular will compile the application and start the development server. Open <http://localhost:4200>.

### ⚡ Quick Start

If everything is already installed:

```bash
cd frontend-1
npm install
ng serve
```

Then open <http://localhost:4200>.

---

## 🔄 Running Frontend + Backend

The frontend communicates with the backend API. For the complete application:

**Terminal 1 — Backend**

```bash
cd ai-customer-support-backend-1
mvn spring-boot:run
```

Backend: <http://localhost:8080>

**Terminal 2 — Frontend**

```bash
cd frontend-1
npm install
ng serve
```

Frontend: <http://localhost:4200>

The complete architecture becomes:

```text
                 Browser
                    │
                    ▼
        ┌─────────────────────┐
        │  Angular Frontend   │
        │   localhost:4200    │
        └──────────┬──────────┘
                   │
                   │ HTTP / REST
                   ▼
        ┌─────────────────────┐
        │ Spring Boot Backend │
        │   localhost:8080    │
        └─────────────────────┘
```

---

## 🛠️ Useful Angular Commands

| Purpose | Command |
|---------|---------|
| Install dependencies | `npm install` |
| Start development server | `ng serve` |
| Start on a different port | `ng serve --port 4201` |
| Build the application | `ng build` |
| Check Angular version | `ng version` |
| Generate a component | `ng generate component pages/example` |

### 📦 Dependency Management

The frontend uses `package.json` to define project dependencies, and the exact versions are locked through `package-lock.json`. Therefore, when cloning the project for the first time, use `npm install` instead of manually installing individual packages.

---

## 🧹 Troubleshooting

### ❌ Could not find the `@angular/build:dev-server` builder

Run:

```bash
npm install
```

If the problem continues, remove `node_modules`:

```bash
rm -rf node_modules
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
```

Then:

```bash
npm install
ng serve
```

### ❌ `ng` is not recognized

Install Angular CLI:

```bash
npm install -g @angular/cli
```

Then verify:

```bash
ng version
```

### ❌ Backend API Errors

Make sure the backend is running at <http://localhost:8080>. The Angular frontend runs on <http://localhost:4200>. Both applications must be running for features that depend on backend APIs.

---

## 🎨 UX Philosophy

The frontend was designed around three major principles:

1. **Simplicity** — Users should understand what they can do without needing to understand the backend.
2. **Consistency** — Customer, employee, and management pages follow a consistent visual language.
3. **Feedback** — Every important operation should provide an appropriate loading, success, error, and empty state.

---

## 🏆 Frontend Highlights

- 🅰️ Modern Angular architecture
- 🧩 Component-based UI
- 🔗 REST API integration
- 🔐 JWT authentication
- 🛡️ Role-based route protection
- 🔑 HTTP interceptors
- 🤖 AI chat interface
- 💬 Persistent conversation UX
- 🎫 Ticket management
- 🧑‍💼 Employee support workspace
- 🛡️ Admin management workspace
- 📊 AI Monitoring
- 📚 Knowledge Base
- 🔔 Notifications
- 😊 CSAT
- 👤 Account management
- 📱 Responsive design
- ⏳ Loading states
- ❌ Error handling
- 🎨 Consistent UI system

---

## 🧠 Frontend Architecture Summary

```text
                       Angular Application
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   👤 Customer          🧑‍💼 Employee          🛡️ Admin
        │                     │                     │
        ▼                     ▼                     ▼
   AI Support             Tickets              Management
   My Tickets             AI Analysis          AI Monitoring
   Notifications          Responses            Knowledge Base
   Account                Incidents            Customers
   CSAT                   SLA                  Employees
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                       Angular Services
                              │
                              ▼
                       HTTP Interceptor
                              │
                              ▼
                          REST API
                              │
                              ▼
                     Spring Boot Backend
```

---

## 🌟 Final Summary

The AI Customer Support Platform Frontend provides a complete Angular-based interface for a modern intelligent customer support ecosystem. It brings together:

- 🤖 AI Support
- 🎫 Ticket Management
- 🧑‍💼 Employee Operations
- 🛡️ Administration
- 📚 Knowledge Management
- 🔔 Notifications
- 😊 Customer Feedback
- 📊 AI Monitoring

into one consistent frontend experience. The frontend is designed to make the complexity of the underlying support system simple for the end user.

---

<div align="center">

### 🤖 AI Customer Support Platform

**Intelligent Support. Connected Experiences. Better Customer Service.**

Built with ❤️ using Angular • TypeScript • HTML5 • CSS3

⭐ If you find this project interesting, consider giving it a star!

</div>
