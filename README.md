<div align="center">

# 🤖 AI Customer Support Platform

An intelligent full-stack customer support platform that combines
**AI-powered assistance**, **automated escalation**, **ticket management**,
**SLA tracking**, **customer satisfaction**, and **role-based support operations**.

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Project Vision](#-project-vision)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [Security](#-security)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Core Backend Modules](#-core-backend-modules)
- [Database Domain](#-database-domain)
- [API Overview](#-api-overview)
- [End-to-End Workflows](#-end-to-end-workflows)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Current Status](#-current-status)
- [Future Enhancements](#-future-enhancements)
- [Why This Project Matters](#-why-this-project-matters)
- [Engineering Principles](#-engineering-principles)
- [License](#-license)

---

## 🧭 Overview

**AI Customer Support Platform** is a full-stack customer support management system designed to combine traditional support operations with an intelligent AI-driven customer experience.

The platform is built around a simple idea:

> **Let AI handle what it can, escalate what requires human support, and preserve the entire customer journey from the first message to final resolution.**

Unlike a traditional ticketing system where every customer immediately creates a ticket, the platform introduces an AI-first support layer.

A customer can start with an AI conversation, receive assistance, continue the conversation with persistent context, and only enter the human support workflow when escalation is required.

The complete journey can therefore look like:

```text
Customer
   ↓
AI Support
   ↓
Persistent Conversation
   ↓
AI Decision
   ├── Answer / Assist / Resolve
   │        ↓
   │   Customer Confirmation
   │        ↓
   │      CSAT
   │
   └── Escalate
          ↓
        Ticket
          ↓
       Employee
          ↓
     AI Ticket Analysis
          ↓
    Suggested Response
          ↓
       Resolution
          ↓
          SLA
          ↓
        Closure
```

The platform provides dedicated experiences for:

- 👤 Customers
- 🧑‍💼 Employees
- 🛡️ Administrators

---

## ❗ The Problem

Traditional customer support platforms often depend heavily on manual ticket creation and employee intervention. This creates several challenges.

### 🕐 1. Slow First Response
Customers may need to create a ticket and wait for an employee even when the issue is simple and can be handled immediately.

### 🔁 2. Repetitive Support Requests
Employees repeatedly answer similar questions instead of focusing their time on complex cases.

### 🧩 3. Lost Context
When a conversation moves from a customer-facing channel to a human employee, important information can be lost. The customer may have to explain the entire problem again.

### 🚨 4. Manual Escalation
Not every support request has the same risk. Financial, security-related, high-risk, or unresolved cases require different handling.

### 📊 5. Limited Operational Visibility
Support managers need visibility into:

- AI activity
- AI escalations
- Confidence
- Risk
- Ticket workload
- SLA status
- Customer satisfaction
- System activity

### 🔗 6. Fragmented Support Workflow
AI conversations, tickets, employees, incidents, notifications, knowledge, and customer feedback are often handled as separate systems.

---

## 💡 The Solution

The platform connects all of these areas into one support ecosystem.

Instead of:

```text
Customer → Ticket → Employee
```

the platform introduces:

```text
Customer
   ↓
AI Assistant
   ↓
Understand the Request
   ↓
Evaluate Confidence & Risk
   ↓
Answer / Resolve OR Escalate
   ↓
Human Support Workflow
```

This makes AI part of the actual business workflow instead of being just a standalone chatbot.

---

## 🎯 Project Vision

The platform is designed around five main principles:

- 🤖 **AI First** — Customers can start their support journey with AI.
- 🧠 **Context Preservation** — AI conversations are persisted and can maintain server-side context.
- 🚨 **Controlled Escalation** — The system uses business rules to determine when human support is required.
- 👨‍💼 **Human-in-the-Loop** — Employees remain responsible for cases that require human judgment.
- 📊 **Measurable Support** — AI interactions, tickets, SLA, customer satisfaction, notifications, and audit activity are part of the same platform.

---

## ✨ Key Features

### 🤖 AI Customer Support

The AI support layer provides:

- Persistent AI conversations
- Server-side conversation context
- Customer ownership validation
- AI response generation
- Confidence evaluation
- Risk evaluation
- `canAnswer` evaluation
- `canResolve` evaluation
- Automatic escalation decisions
- AI fallback handling
- Automatic ticket creation when escalation is required

### 💬 Persistent AI Conversations

AI conversations are persisted in the database. The architecture uses:

```text
AiConversation
       ↓
AiConversationMessage
       ↓
Server-Side Context
       ↓
AI Processing
       ↓
AI Response
```

This allows the backend to remain the source of truth for the conversation rather than depending only on frontend state. The system also validates conversation ownership so one customer cannot access another customer's conversation.

### 🧠 AI Decision & Escalation

The AI is not designed to answer every request blindly. The platform includes a dedicated `AiEscalationPolicyService`.

The escalation logic considers multiple factors, including:

- 🔴 Critical risk
- 🟠 High risk
- 🙋 Explicit request for human support
- 🔐 Security or account-compromise concerns
- 💳 Financial or payment-related risk
- 📉 Low AI confidence
- ❌ AI inability to resolve the issue
- 🔁 Repeated unresolved issues
- 🤖 AI-requested escalation

The system also works with confidence thresholds and risk levels. Conceptually:

```text
AI Response
     ↓
Confidence + Risk + Resolution Ability
     ↓
 ┌───────────────────────────────┐
 │                               │
 ▼                               ▼
Safe / Clear                 Risky / Unclear
 │                               │
 ▼                               ▼
Answer / Resolve             Escalate
                                 │
                                 ▼
                               Ticket
```

This makes escalation a backend business decision rather than simply a frontend button.

### 🎫 Ticket Management

Tickets represent the human support workflow. The platform supports:

- Ticket creation
- Customer ownership
- Employee support
- Categories
- Priorities
- Status management
- Ticket conversations
- AI analysis
- Suggested responses
- Resolution
- Reopening
- SLA tracking
- Incident relationships
- Customer confirmation
- Customer satisfaction

### 🔄 Ticket Lifecycle

The backend enforces controlled ticket status transitions. The main lifecycle is:

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

When reopening is required:

```text
CLOSED
  ↓
OPEN
```

The important point is that these transitions are validated by the backend instead of relying only on frontend behavior.

### 🔗 AI Conversation → Ticket

One of the most important features is the connection between the AI support workflow and the ticketing system. When escalation is required:

```text
AI Conversation
      ↓
Escalation Policy
      ↓
Ticket Creation
      ↓
Ticket ↔ AI Conversation
      ↓
Employee Support
```

This allows the support ticket to remain connected to the original AI conversation. The system also prevents repeated follow-up messages inside the same active AI conversation from unnecessarily generating duplicate active tickets.

### 📝 Conversation → Ticket Synchronization

Customer messages from the AI conversation can be synchronized into the related ticket conversation. This means the employee can see the customer's support journey rather than receiving only the final escalation message.

Example:

```text
Customer:
"I can't withdraw money."

        ↓

AI:
"Can you tell me what the ATM shows?"

        ↓

Customer:
"The transaction is declined every time."

        ↓

Escalation

        ↓

Ticket

        ↓

Employee sees the relevant customer messages
```

This reduces the need for customers to repeat information.

### 🧑‍💼 Employee Support Workspace

Employees have a dedicated support environment. The employee workflow includes:

- Assigned tickets
- Ticket details
- Customer conversation
- AI assessment
- AI analysis
- Suggested responses
- Ticket status management
- Resolution workflow
- Incident relationships
- SLA awareness
- Support messaging

### 🤖 AI Ticket Analysis

AI is also used as an employee productivity tool. A ticket can be analyzed to provide information such as:

- Summary
- Category
- Suggested priority
- Suggested response
- Recommended action
- Sentiment
- Confidence
- Risk

Conceptually:

```text
Ticket
  ↓
AI Analysis
  ↓
┌──────────────────────┐
│ Category             │
│ Priority             │
│ Risk                 │
│ Sentiment            │
│ Confidence           │
│ Recommended Action   │
│ Suggested Response   │
└──────────────────────┘
```

This helps employees understand support cases faster.

### 💬 Suggested Response

The AI can generate a suggested response that employees can review before using.

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

The employee remains responsible for the final communication.

### 📚 Knowledge Base

The platform includes a dedicated Knowledge Base that provides structured support information for the support system. It includes:

- Knowledge articles
- Article status
- Active/inactive articles
- Article management
- Search/retrieval
- Administrative management
- Employee-facing support knowledge

The architecture separates knowledge retrieval from the AI service so the knowledge layer can be expanded independently.

### ⏱️ SLA Management

Customer support is not only about resolving tickets. It is also about resolving them within expected timeframes. The platform includes:

- SLA due dates
- SLA status
- SLA calculations
- SLA metrics
- SLA tracking
- Management visibility

Conceptually:

```text
Ticket Created
      ↓
SLA Applied
      ↓
Due Date
      ↓
Ticket Progress
      ↓
SLA Status
      ↓
Management Attention
```

### 🔔 Notifications

The platform contains a notification system connecting backend events with the frontend:

```text
System Event
     ↓
Notification Created
     ↓
Database
     ↓
Notification API
     ↓
Angular Header
     ↓
Notification Dropdown
     ↓
Unread Count
     ↓
Mark as Read
     ↓
UI Refresh
```

This provides users with feedback about important support events.

### 😊 Customer Satisfaction — CSAT

After resolution, customers can provide feedback. The CSAT system supports:

- ⭐ Rating from 1 to 5
- 💬 Optional feedback
- 💾 Persistence
- 🔄 Retrieval after refresh
- 📊 Satisfaction metrics

Workflow:

```text
Ticket Resolved
      ↓
Customer Reviews Resolution
      ↓
Rating 1–5
      ↓
Optional Feedback
      ↓
CSAT Persistence
      ↓
Management Metrics
```

### 📊 AI Monitoring

The platform includes a dedicated AI monitoring layer. AI activity can be monitored through information such as:

- Total AI interactions
- AI responses
- AI escalations
- Confidence
- Risk
- `canAnswer`
- `canResolve`
- AI availability
- Fallback usage
- AI operational metrics

This allows administrators to understand how the AI system behaves in production-like workflows.

### 📝 Audit Logging

Important system activities can be recorded using an audit logging layer. This improves:

- Traceability
- Accountability
- Operational visibility
- Administrative monitoring

The project includes dedicated audit log entities, repositories, and services.

### 👤 Customer Experience

Customers have a dedicated portal designed around self-service and transparency. Customer capabilities include:

- Registration
- Login
- Account management
- Profile editing
- Profile photo management
- AI Support
- Persistent AI conversations
- Ticket creation
- Ticket viewing
- Ticket conversation
- AI resolution assessment
- Resolution confirmation
- Notifications
- CSAT
- Ticket status tracking

The goal is to minimize unnecessary friction between the customer and the support team.

### 🛡️ Admin & Management

Administrators have a centralized management workspace:

- 📊 Dashboard
- 🎫 Tickets
- 👥 Customers
- 🧑‍💼 Employees
- 🏷️ Categories
- 🚨 Incidents
- 💬 Messages
- 📚 Knowledge Base
- 🤖 AI Monitoring
- 📈 Metrics
- 😊 Customer Satisfaction
- ⏱️ SLA Metrics
- 🔐 Account Management
- 📝 Audit Activity

---

## 👥 User Roles

| Role | Responsibilities |
|------|------------------|
| 👤 **Customer** | Use AI Support, manage tickets, follow ticket status, confirm resolutions, receive notifications, and submit CSAT |
| 🧑‍💼 **Employee** | Handle support cases, review AI analysis, communicate with customers, and resolve tickets |
| 🛡️ **Administrator** | Manage users, tickets, incidents, categories, knowledge, monitoring, metrics, and administrative operations |

---

## 🔐 Security

Security is implemented across both backend and frontend layers.

### Authentication

The backend uses:

- JWT authentication
- Stateless sessions
- BCrypt password hashing
- Token validation
- Protected API endpoints

### Authorization

The platform supports the following roles with role-based authorization:

```text
CUSTOMER
EMPLOYEE
ADMIN
```

### Frontend Security

Angular uses:

- Authentication guards
- Role guards
- Protected routes
- Authorization interceptors

### Resource Ownership

Customer-specific resources are checked against the authenticated customer where required. This helps prevent unauthorized access to another customer's support data.

---

## 🏗️ System Architecture

The project follows a layered full-stack architecture.

```text
┌──────────────────────────────────────────────┐
│                   Angular                    │
│                                              │
│       Customer Portal | Employee | Admin     │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API / HTTP
                       ▼
┌──────────────────────────────────────────────┐
│               Spring Boot Backend            │
│                                              │
│ Controllers                                  │
│      ↓                                       │
│ Services                                     │
│      ↓                                       │
│ Repositories                                 │
│      ↓                                       │
│ Entities / DTOs                              │
└──────────────────────┬───────────────────────┘
                       │
              ┌────────┴─────────┐
              ▼                  ▼
         PostgreSQL          Gemini AI
```

### Backend Layers

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Entity
    ↓
PostgreSQL
```

AI services integrate into the business layer instead of existing as an isolated chatbot.

---

## 🛠️ Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| ☕ Java | Backend development |
| 🌱 Spring Boot | Application framework |
| 🌐 Spring REST | REST API |
| 🔐 Spring Security | Authentication & authorization |
| 🎫 JWT | Stateless authentication |
| 🔑 BCrypt | Password hashing |
| 🗄️ Spring Data JPA | Persistence |
| 🐘 PostgreSQL | Database |
| 🤖 Gemini API | AI processing |

### Frontend

| Technology | Purpose |
|------------|---------|
| 🅰️ Angular | Frontend framework |
| TypeScript | Application logic |
| HTML5 | UI structure |
| CSS3 | Styling |
| HTTP Client | Backend communication |

---

## 📁 Project Structure

```text
AI-Customer-Support-Platform/
│
├── ai-customer-support-backend-1/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/aicustomersupport/
│   │   │   │       └── aicustomersupportbackend/
│   │   │   │           ├── account/
│   │   │   │           ├── ai/
│   │   │   │           ├── auth/
│   │   │   │           ├── config/
│   │   │   │           ├── controller/
│   │   │   │           ├── dto/
│   │   │   │           ├── entity/
│   │   │   │           ├── enums/
│   │   │   │           ├── exception/
│   │   │   │           ├── repository/
│   │   │   │           ├── security/
│   │   │   │           └── service/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend-1/
│   │
│   ├── src/
│   │   └── app/
│   │       ├── guards/
│   │       ├── interceptors/
│   │       ├── layout/
│   │       ├── models/
│   │       ├── pages/
│   │       ├── services/
│   │       └── shared/
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── angular.json
│
└── .gitignore
```

---

## 🧩 Core Backend Modules

**AI**

```text
ai/
├── AiAnalysisResponse
├── AiChatMessage
├── AiChatRequest
├── AiChatResponse
├── AiResolutionResponse
├── AiSupportService
├── GeminiAiSupportService
└── MockAiSupportService
```

**AI Conversation**

```text
AiConversation
AiConversationMessage
AiConversationRepository
AiConversationMessageRepository
AiConversationService
```

**AI Escalation**

```text
AiEscalationPolicyService
```

**AI Monitoring**

```text
AiInteractionLog
AiInteractionLogRepository
AiMetricsService
AiMonitoringController
AiMetricsResponse
```

**Ticket AI Analysis**

```text
AiTicketAnalysis
AiTicketAnalysisRepository
```

**Ticket Management**

```text
Ticket
TicketRepository
TicketService
TicketController
```

**Knowledge Base**

```text
KnowledgeArticle
KnowledgeArticleRepository
KnowledgeBaseService
KnowledgeRetrievalService
KnowledgeBaseController
```

**SLA**

```text
SlaService
SlaMetricsService
SlaStatus
SlaMetricsResponse
```

**Customer Satisfaction**

```text
CustomerSatisfaction
CustomerSatisfactionService
CustomerSatisfactionMetricsService
CustomerSatisfactionController
CustomerSatisfactionAdminController
```

**Notifications**

```text
Notification
NotificationRepository
NotificationService
NotificationController
NotificationResponse
```

**Auditing**

```text
AuditLog
AuditLogRepository
AuditLogService
```

---

## 🗄️ Database Domain

The PostgreSQL database represents the major business entities. A simplified domain relationship is:

```text
Customer
   │
   ├── AiConversation
   │       └── AiConversationMessage
   │
   └── Ticket
          │
          ├── Message
          ├── Category
          ├── Employee
          ├── Incident
          ├── AI Analysis
          ├── SLA
          └── Customer Satisfaction
```

Additional operational entities include:

```text
AiInteractionLog
AuditLog
KnowledgeArticle
Notification
Employee
Category
Incident
```

---

## 🌐 API Overview

The backend provides REST APIs covering authentication, AI, customers, employees, tickets, incidents, notifications, knowledge base, monitoring, and satisfaction.

| Feature | Endpoint |
|---------|----------|
| Health | `GET /health` |
| AI Chat | `POST /ai/chat` |
| Ticket AI Analysis | `GET /tickets/{id}/analyze` |
| AI Analysis | `GET /tickets/{id}/ai-analysis` |
| Resolution Assessment | `GET /tickets/{id}/resolution-assessment` |
| Confirm Resolution | `POST /tickets/{id}/confirm-resolution` |
| Submit Satisfaction | `POST /tickets/{id}/satisfaction` |
| Get Satisfaction | `GET /tickets/{id}/satisfaction` |

Additional APIs cover:

- Authentication
- Customers
- Employees
- Tickets
- Categories
- Incidents
- Messages
- Notifications
- Knowledge Base
- AI Monitoring
- Customer Satisfaction
- Account Management
- SLA
- Ticket assignment
- Ticket status transitions
- Incident relationships

---

## 🔄 End-to-End Workflows

### 1️⃣ Customer AI Support

```text
Customer
   ↓
AI Chat
   ↓
Persistent Conversation
   ↓
Server-Side Context
   ↓
Gemini
   ↓
AI Response
   ↓
Confidence + Risk Evaluation
   ↓
Answer / Resolve OR Escalate
```

### 2️⃣ AI Escalation

```text
Customer
   ↓
AI Conversation
   ↓
Escalation Policy
   ↓
Ticket Creation
   ↓
Ticket ↔ AI Conversation
   ↓
Employee
```

### 3️⃣ Same Conversation / Same Ticket

```text
Existing AI Conversation
        ↓
Customer Follow-Up
        ↓
Same Conversation ID
        ↓
Existing Context
        ↓
Existing Active Ticket
```

This prevents unnecessary duplicate tickets for the same active support conversation.

### 4️⃣ Employee Support

```text
Ticket
   ↓
Employee Opens Ticket
   ↓
AI Analysis
   ↓
Risk / Confidence / Category / Priority
   ↓
Suggested Response
   ↓
Employee Response
   ↓
Resolution
```

### 5️⃣ Customer Resolution

```text
Ticket
   ↓
Resolution Assessment
   ↓
Customer Confirms
   ↓
RESOLVED
   ↓
CSAT
   ↓
Rating + Feedback
```

### 6️⃣ SLA

```text
Ticket Created
   ↓
SLA Applied
   ↓
Due Date
   ↓
Progress
   ↓
SLA Status
   ↓
Metrics / Attention
```

### 7️⃣ Notifications

```text
Event
   ↓
Notification Created
   ↓
Database
   ↓
API
   ↓
Angular Header
   ↓
Unread Count
   ↓
Mark as Read
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Omarmostafa66/AI-Customer-Support-Platform.git
cd AI-Customer-Support-Platform
```

### 🐘 2. Setup PostgreSQL

Create the database:

```text
ai_customer_support_db
```

Make sure PostgreSQL is running locally. The backend uses Spring Boot configuration to connect to PostgreSQL.

### ☕ 3. Run the Backend

```bash
cd ai-customer-support-backend-1
```

**Windows:**

```bash
.\mvnw.cmd spring-boot:run
```

**Maven:**

```bash
mvn spring-boot:run
```

Backend: <http://localhost:8080>

Health check: <http://localhost:8080/health>

Expected response:

```json
{
  "status": "UP"
}
```

### 🅰️ 4. Run the Frontend

Open another terminal:

```bash
cd frontend-1
npm install
ng serve
```

The frontend will be available at <http://localhost:4200>.

---

## ⚙️ Configuration

The backend supports environment-based configuration. Important values include:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/ai_customer_support_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:}

app.jwt.secret=${JWT_SECRET:}
app.jwt.expiration-ms=86400000

app.admin.email=${ADMIN_EMAIL:}
app.admin.password=${ADMIN_PASSWORD:}

gemini.api-key=${GEMINI_API_KEY:}
gemini.base-url=https://generativelanguage.googleapis.com/v1beta
gemini.model=${GEMINI_MODEL:...}
gemini.fallback-models=${GEMINI_FALLBACK_MODELS:...}
```

For local development, values can be supplied through the project's local configuration. For production, secrets should be provided through environment variables or a secure secrets manager.

---

## 🧪 Testing

Run backend tests:

```bash
mvn clean test
```

Compile the backend:

```bash
mvn clean compile
```

Frontend:

```bash
npm install
ng serve
```

The project was developed using an incremental integration approach:

```text
Database
   ↓
Repository
   ↓
Service
   ↓
Controller
   ↓
REST API
   ↓
Angular Service
   ↓
Component
   ↓
UI
```

---

## 📈 Current Status

| Feature | Status |
|---------|:------:|
| 🔐 JWT Authentication | ✅ |
| 👥 Role-Based Access Control | ✅ |
| 👤 Customer Portal | ✅ |
| 🧑‍💼 Employee Portal | ✅ |
| 🛡️ Admin / Management Portal | ✅ |
| 🤖 AI Customer Support | ✅ |
| 💬 Persistent AI Conversations | ✅ |
| 🧠 Server-Side AI Context | ✅ |
| 🚨 AI Escalation Policy | ✅ |
| 🎫 AI → Ticket Workflow | ✅ |
| 🔗 Conversation → Ticket Relationship | ✅ |
| 📝 Ticket Conversation Sync | ✅ |
| 🤖 Ticket AI Analysis | ✅ |
| 💬 Suggested Responses | ✅ |
| 🔄 Ticket Lifecycle | ✅ |
| ⏱️ SLA Management | ✅ |
| 🚨 Incident Management | ✅ |
| 🔔 Notifications | ✅ |
| 😊 CSAT | ✅ |
| 📚 Knowledge Base | ✅ |
| 📊 AI Monitoring | ✅ |
| 📝 Audit Logging | ✅ |
| 🔐 Ownership / Authorization Checks | ✅ |

---

## 🔮 Future Enhancements

The architecture can be extended with more advanced capabilities.

### 🧠 Semantic Knowledge Retrieval

The current knowledge retrieval layer can be extended toward:

```text
Documents
   ↓
Embeddings
   ↓
Vector Database
   ↓
Semantic Search
   ↓
Relevant Context
   ↓
LLM
```

### 👥 Intelligent Employee Assignment

Future versions can automatically assign tickets using:

```text
Category + Priority + AI Risk + Employee Skills + Workload
```

### 🚨 Multi-Level Escalation

A more advanced escalation hierarchy could be:

```text
AI
 ↓
Employee
 ↓
Senior Employee
 ↓
Manager
 ↓
Administrator
```

based on risk, SLA, priority, and repeated failures.

### 📊 Advanced Analytics

- Resolution time trends
- Escalation trends
- Employee workload
- SLA breach trends
- Category performance
- Customer satisfaction trends
- AI performance trends

### 🧠 AI Confidence Calibration

AI confidence can eventually be combined with:

- Retrieval quality
- Business rules
- Historical outcomes
- Human feedback

to produce more reliable decision-making.

### 🗂️ Conversation Summarization

Long AI conversations can be summarized automatically for employees so they can understand the case without reading every message.

---

## 🏆 Why This Project Matters

This project is not simply a CRUD application. It is also not just an AI chatbot.

The main value is the integration between:

```text
AI
 ↓
Business Rules
 ↓
Ticketing
 ↓
Human Support
 ↓
SLA
 ↓
Customer Feedback
 ↓
Monitoring
```

The platform demonstrates how AI can be integrated into a real software system rather than being treated as an isolated feature. It combines:

- Full-stack development
- Backend architecture
- REST APIs
- PostgreSQL database design
- Authentication
- Authorization
- AI integration
- Persistent conversations
- Business rules
- Automated escalation
- Ticket lifecycle management
- SLA management
- Knowledge management
- Notifications
- Monitoring
- Auditability
- Customer experience

---

## 🧠 Engineering Principles

### Separation of Concerns

- **Controllers** handle HTTP communication.
- **Services** contain business logic.
- **Repositories** handle persistence.
- **Entities** represent the domain.
- **DTOs** control API contracts.

### Backend as the Source of Truth

Critical business rules are enforced by the backend, for example:

- Authentication
- Authorization
- Customer ownership
- Ticket status transitions
- Escalation decisions
- Ticket duplication prevention
- Resolution rules

### Human-in-the-Loop AI

AI is used to assist both customers and employees. However, the platform recognizes that some situations require human judgment.

```text
AI
 ↓
Assess
 ↓
Resolve if appropriate
OR
 ↓
Escalate
 ↓
Human Support
```

### Persistent Business State

Important system information is persisted instead of existing only in the browser:

- AI conversations
- AI messages
- Tickets
- Ticket messages
- AI interaction information
- Knowledge articles
- Notifications
- Audit logs
- Customer satisfaction

---

## 👨‍💻 Project Summary

**AI Customer Support Platform** is a full-stack intelligent customer support ecosystem built around one core principle:

> **AI when possible. Humans when necessary. Context always preserved.**

### 🛠️ Built With

Java • Spring Boot • Spring Security • JWT • JPA/Hibernate • PostgreSQL • Angular • TypeScript • Gemini AI

---

## 📄 License

This project is developed for educational, portfolio, and software engineering purposes.

---

<div align="center">

### 🤖 AI Customer Support Platform

**Intelligent Support. Human Escalation. Connected Workflows.**

Built with ☕ Java · 🌱 Spring Boot · 🅰️ Angular · 🐘 PostgreSQL · 🤖 AI

</div>