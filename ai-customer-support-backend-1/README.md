# 🚀 AI Customer Support Platform — Backend

> Enterprise-style AI-powered Customer Support Backend built with Spring Boot, PostgreSQL, Spring Security, JWT, and Gemini AI.

The backend is the core business and intelligence layer of the **AI Customer Support Platform**.

It provides secure REST APIs, authentication and authorization, customer support workflows, ticket management, AI-powered conversations, intelligent escalation, knowledge-base integration, SLA handling, notifications, audit logging, monitoring, and customer satisfaction tracking.

---

## 🧭 Overview

The **AI Customer Support Backend** is designed as a scalable RESTful backend that centralizes the complete customer support lifecycle.

Instead of treating AI as a standalone chatbot, the backend integrates AI directly into the support workflow. The system connects:

```text
Customer
   ↓
AI Conversation
   ↓
AI Analysis
   ↓
Escalation Policy
   ↓
Ticket Creation
   ↓
Employee Support
   ↓
Resolution
   ↓
Customer Confirmation
   ↓
Satisfaction
```

This architecture allows the platform to move from simple AI conversations to a complete support-management workflow.

---

## ✨ Core Backend Capabilities

### 🔐 Authentication & Security

- User Registration
- User Login
- JWT Authentication
- JWT Token Validation
- BCrypt Password Hashing
- Stateless Authentication
- Role-Based Access Control
- Method-Level Security
- Ownership Validation
- Protected REST APIs
- CORS Configuration

### 🎫 Ticket Management

- Ticket Creation
- Ticket Retrieval
- Ticket Updating
- Ticket Status Management
- Ticket Priority
- Ticket Categories
- Ticket Assignment
- Ticket Messages
- Ticket Ownership Validation
- Ticket Resolution
- Ticket Reopening
- Ticket SLA Handling

### 🤖 AI Customer Support

- AI-powered customer conversations
- Gemini AI integration
- AI response generation
- AI classification
- Sentiment analysis
- Confidence evaluation
- Risk evaluation
- Suggested priority
- Suggested response
- Recommended action
- AI escalation
- AI fallback handling

---

## 🚨 Intelligent Escalation

The backend contains a dedicated escalation policy layer that evaluates AI interactions before deciding whether human intervention is required.

Escalation can be triggered by conditions such as:

- Critical or high-risk requests
- Customer explicitly requesting a human agent
- Security-sensitive requests
- Financial-risk situations
- Low AI confidence
- Repeated failures
- AI inability to resolve the request

```text
AI Response
     ↓
Escalation Policy
     ↓
 ┌────────────────┐
 │ Can AI resolve │
 │ the request?   │
 └───────┬────────┘
         │
     ┌───┴───┐
     ↓       ↓
    YES      NO
     ↓       ↓
 AI Reply   Create / Reuse Ticket
                 ↓
           Human Support
```

---

## 🧠 AI Conversation Architecture

AI conversations are persisted on the backend instead of relying only on the frontend. Each conversation can maintain:

- Customer ownership
- Conversation ID
- Conversation messages
- Customer messages
- AI responses
- Conversation timestamps

The backend uses the conversation ID to maintain continuity between messages.

```text
Customer Message
       ↓
AiConversationService
       ↓
Load Conversation
       ↓
Load Conversation Context
       ↓
AI Service
       ↓
Gemini
       ↓
AI Response
       ↓
Escalation Evaluation
       ↓
Persist Conversation
```

This allows the backend to maintain a consistent conversation lifecycle even when the frontend route changes or the customer continues an existing conversation.

---

## 🎫 AI → Ticket Integration

One of the key backend workflows is the connection between AI conversations and support tickets. When an AI conversation requires human intervention:

```text
AI Conversation
      ↓
Escalation Required
      ↓
Check Existing Active Ticket
      ↓
 ┌────────────────┐
 │ Active Ticket? │
 └───────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
   YES        NO
    ↓         ↓
Reuse Ticket  Create Ticket
```

The backend associates the ticket with the AI conversation. This prevents repeated escalation messages inside the same conversation from creating duplicate active tickets.

The relationship is maintained through the AI conversation reference:

```text
AiConversation
      │
      ▼
    Ticket
```

---

## 🔄 Ticket Lifecycle

Tickets follow a controlled lifecycle:

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

The backend also supports reopening a previously closed workflow when required.

### Customer Resolution Confirmation

When an employee resolves a ticket, the customer can confirm the resolution.

```text
Employee Resolution
        ↓
     RESOLVED
        ↓
Customer Confirmation
        ↓
      CLOSED
```

This separates:

- Internal resolution
- Customer confirmation
- Final ticket closure

and creates a more realistic support workflow.

---

## 📊 AI Ticket Analysis

The backend provides AI-powered ticket analysis. The analysis can include:

- Summary
- Category
- Suggested Priority
- Suggested Response
- Recommended Action
- Sentiment
- Confidence
- Risk
- Resolution assessment

Example API capabilities:

```http
GET /tickets/{id}/analyze
GET /tickets/{id}/ai-analysis
GET /tickets/{id}/resolution-assessment
```

The backend therefore allows employees to receive AI-generated context before handling a support ticket.

---

## 💬 Ticket Conversations

Tickets maintain their own support conversation. The backend stores customer and employee messages independently from the AI conversation layer.

For AI-escalated tickets, relevant customer messages from the AI conversation can be synchronized into the ticket conversation.

```text
AI Conversation
      ↓
Customer Messages
      ↓
Ticket Conversation
      ↓
Employee Support
```

AI responses remain part of the AI conversation context rather than being incorrectly represented as employee messages.

---

## 📚 Knowledge Base

The backend contains a dedicated Knowledge Base module. It provides functionality for managing knowledge articles and retrieving relevant support information.

```text
Knowledge Article
       ↓
Knowledge Base Service
       ↓
Knowledge Retrieval
       ↓
AI Support Workflow
```

Knowledge Base functionality includes:

- Knowledge article management
- Article status
- Active/inactive articles
- Article retrieval
- Search-based retrieval
- Integration with AI support workflows

The backend currently contains a `KnowledgeRetrievalService` that retrieves knowledge articles through the existing Knowledge Base service.

---

## ⏱️ SLA Management

The backend includes SLA-aware ticket handling. Tickets can have SLA-related information such as:

- SLA due date
- Priority-based timing
- SLA status
- SLA backfilling when necessary

This allows support operations to identify tickets that require attention before or after their SLA deadline.

```text
Ticket
  ↓
Priority
  ↓
SLA Calculation
  ↓
Due Date
  ↓
Monitoring
  ↓
Attention / Escalation
```

---

## 🚨 Attention Queue

The backend contains an attention-queue layer for support operations. The purpose is to surface cases that require human attention based on support conditions such as:

- High priority
- Critical risk
- SLA pressure
- AI escalation
- Repeated failures
- Unresolved support requests

This creates a bridge between automated AI handling and human support operations.

---

## 📈 AI Monitoring & Metrics

The backend includes dedicated AI monitoring and metrics services. The monitoring layer allows the system to track AI-related operational information such as:

- AI interactions
- Confidence
- Risk
- Sentiment
- Escalation
- Fallback usage
- AI API failures
- Ability to answer
- Ability to resolve

This provides visibility into how the AI support layer is performing.

---

## 🧾 Audit Logging

The backend includes an audit logging mechanism. Important system actions can be recorded with information such as:

```text
Action
Entity
Entity ID
Description
Timestamp
```

Example:

```text
CREATE_TICKET
TICKET
123
Ticket 123 created
```

Audit logging provides a traceable history of important backend operations.

---

## ⭐ Customer Satisfaction

After ticket resolution, the backend supports customer satisfaction collection. The system contains dedicated services and repository support for customer satisfaction.

```text
Ticket Resolution
      ↓
Customer Feedback
      ↓
Satisfaction Metrics
      ↓
Support Performance Analysis
```

---

## 🔐 Security Architecture

Security is implemented at multiple levels.

```text
Client
  ↓
JWT
  ↓
JwtAuthenticationFilter
  ↓
Spring Security
  ↓
Role / Method Authorization
  ↓
Ownership Validation
  ↓
Controller
  ↓
Service
```

### Authentication

The backend uses JWT-based authentication.

### Password Security

Passwords are protected using BCrypt hashing.

### Authorization

The application supports role-based access control. Main roles include:

```text
CUSTOMER
EMPLOYEE
ADMIN
```

### Ownership Validation

Authentication alone is not sufficient. The backend also validates whether the authenticated user is actually allowed to access or modify a specific resource. This is particularly important for:

- Tickets
- Conversations
- Customer data
- Account information

---

## 🏗️ Backend Architecture

The backend follows a layered architecture.

```text
                REST API
                   │
                   ▼
              Controllers
                   │
                   ▼
                Services
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Repositories       AI Services
          │                 │
          ▼                 ▼
       Entities          Gemini AI
          │
          ▼
      PostgreSQL
```

### Controller Layer

Responsible for:

- HTTP endpoints
- Request handling
- Response handling
- Authentication context
- API-level validation

Examples include controllers for: Authentication, Tickets, Customers, Employees, Messages, Incidents, Categories, AI conversations, AI monitoring, Knowledge Base, and Account management.

### Service Layer

Contains the business logic. Important services include:

- `TicketService`
- `CustomerService`
- `EmployeeService`
- `MessageService`
- `IncidentService`
- `CategoryService`
- `AiConversationService`
- `AiEscalationPolicyService`
- `AiMetricsService`
- `AttentionQueueService`
- `AuditLogService`
- `KnowledgeBaseService`
- `KnowledgeRetrievalService`
- `CustomerSatisfactionService`
- `CustomerSatisfactionMetricsService`

### Repository Layer

Repositories provide persistence through Spring Data JPA. Examples include:

- `TicketRepository`
- `CustomerRepository`
- `EmployeeRepository`
- `MessageRepository`
- `IncidentRepository`
- `CategoryRepository`
- `KnowledgeArticleRepository`
- `NotificationRepository`
- `AiConversationRepository`
- `AiConversationMessageRepository`
- `AuditLogRepository`
- `CustomerSatisfactionRepository`

### Entity Layer

JPA entities represent the application's persistent domain model:

```text
Customer
Employee
Ticket
Message
Incident
Category
AiConversation
AiConversationMessage
KnowledgeArticle
Notification
AuditLog
CustomerSatisfaction
```

---

## 🗂️ Backend Project Structure

```text
ai-customer-support-backend-1/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── aicustomersupport/
│   │   │           └── aicustomersupportbackend/
│   │   │               ├── account/
│   │   │               ├── ai/
│   │   │               ├── controller/
│   │   │               ├── dto/
│   │   │               ├── entity/
│   │   │               ├── repository/
│   │   │               ├── security/
│   │   │               └── service/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
├── HELP.md
└── README.md
```

---

## 🧰 Technology Stack

| Technology | Purpose |
|------------|---------|
| ☕ Java 17 | Backend programming language |
| 🌱 Spring Boot | Backend framework |
| 🔐 Spring Security | Authentication & authorization |
| 🎟️ JWT | Stateless authentication |
| 🔑 BCrypt | Password hashing |
| 🗄️ Spring Data JPA | Database persistence |
| 🧩 Hibernate | ORM |
| 🐘 PostgreSQL | Relational database |
| 📦 Maven | Build & dependency management |
| 🤖 Gemini AI | AI-powered support |
| ✅ Jakarta Validation | Request validation |

The project POM currently targets **Java 17** and uses **Spring Boot 4.1.1**.

---

## 🗄️ Database

The backend uses PostgreSQL as its primary relational database through Spring Data JPA and Hibernate.

Default local configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ai_customer_support_db
spring.datasource.username=postgres
spring.datasource.password=...
```

Hibernate is configured to update the database schema automatically during development:

```properties
spring.jpa.hibernate.ddl-auto=update
```

---

## 🤖 Gemini AI Configuration

The backend integrates with Gemini through configurable application properties:

```properties
gemini.api-key=${GEMINI_API_KEY:}
gemini.base-url=https://generativelanguage.googleapis.com/v1beta
gemini.model=${GEMINI_MODEL:gemini-3.8-flash}
gemini.fallback-models=${GEMINI_FALLBACK_MODELS:gemini-3.7-flash,gemini-3.5-flash}
```

The AI integration supports configurable primary and fallback models.

> ⚠️ **Important**
>
> Never commit a real Gemini API key, database password, JWT secret, or production credential to GitHub. Use environment variables instead.

Supported environment variables:

```text
GEMINI_API_KEY
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## 🌐 API Architecture

The backend exposes RESTful endpoints consumed by the Angular frontend.

**Authentication**

```http
POST /auth/login
POST /auth/register
```

**Tickets**

```http
GET    /tickets
GET    /tickets/{id}
POST   /tickets
PUT    /tickets/{id}
```

**AI Ticket Analysis**

```http
GET /tickets/{id}/analyze
GET /tickets/{id}/ai-analysis
GET /tickets/{id}/resolution-assessment
```

**Resolution**

```http
POST /tickets/{id}/confirm-resolution
```

**Satisfaction**

```http
POST /tickets/{id}/satisfaction
GET  /tickets/{id}/satisfaction
```

**AI Chat**

```http
POST /ai/chat
```

The backend therefore acts as the central API layer between the frontend, database, AI services, and support workflows.

---

## 🔄 Complete AI Support Flow

A typical customer request follows this flow:

```text
Customer
   │
   ▼
POST /ai/chat
   │
   ▼
AiConversationService
   │
   ├── Load / Create Conversation
   │
   ├── Load Conversation Context
   │
   ▼
AI Service
   │
   ▼
Gemini
   │
   ▼
AI Response
   │
   ▼
Escalation Policy
   │
   ├───────────────┐
   │               │
   ▼               ▼
No Escalation   Escalation
   │               │
   ▼               ▼
AI Response     Check Active Ticket
                   │
             ┌─────┴─────┐
             ▼           ▼
          Exists        New
             │           │
             ▼           ▼
          Reuse       Create
             │           │
             └─────┬─────┘
                   ▼
                Ticket
                   │
                   ▼
            Human Support
```

This is one of the core business workflows implemented by the backend.

---

## 🧪 Testing

The backend contains unit-test support for backend services.

```text
src/test/
└── java/
    └── com/
        └── aicustomersupport/
            └── aicustomersupportbackend/
```

Run tests with Maven:

```bash
mvn test
```

Or on Windows using the Maven wrapper:

```powershell
.\mvnw.cmd test
```

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

Before running the backend, make sure you have:

- ☕ Java 17
- 📦 Maven
- 🐘 PostgreSQL
- 🔑 Gemini API Key
- 💻 Git

Check Java and Maven:

```bash
java -version
mvn -version
```

### 🐘 2️⃣ Setup PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE ai_customer_support_db;
```

Make sure PostgreSQL is running locally. Default configuration:

```text
Host: localhost
Port: 5432
Database: ai_customer_support_db
Username: postgres
Password: YOUR_PASSWORD
```

### 🔑 3️⃣ Configure Environment Variables

Set the required environment variables before starting the backend.

**Windows PowerShell**

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/ai_customer_support_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="YOUR_POSTGRES_PASSWORD"

$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

$env:JWT_SECRET="YOUR_SECURE_JWT_SECRET"

$env:ADMIN_EMAIL="admin@aicustomersupport.com"
$env:ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
```

**Linux / macOS**

```bash
export DB_URL="jdbc:postgresql://localhost:5432/ai_customer_support_db"
export DB_USERNAME="postgres"
export DB_PASSWORD="YOUR_POSTGRES_PASSWORD"

export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

export JWT_SECRET="YOUR_SECURE_JWT_SECRET"

export ADMIN_EMAIL="admin@aicustomersupport.com"
export ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"
```

The backend's `application.properties` is already structured to read these values from environment variables.

### 🌱 4️⃣ Install / Prepare Spring Boot

You do not need to install Spring Boot separately like a normal standalone program. Spring Boot is included in the Maven project through the `pom.xml`, and Maven downloads the required dependencies automatically.

From the backend directory:

```bash
cd ai-customer-support-backend-1
```

Then:

```powershell
.\mvnw.cmd clean install
```

This will:

- Download Maven dependencies
- Compile the project
- Run tests
- Build the application

### ▶️ 5️⃣ Run the Spring Boot Backend

**Option 1 — Maven Wrapper** (recommended on Windows):

```powershell
.\mvnw.cmd spring-boot:run
```

**Option 2 — Maven** (if installed globally):

```bash
mvn spring-boot:run
```

**Option 3 — IntelliJ IDEA**

Open the backend project in IntelliJ IDEA, locate `AiCustomerSupportBackendApplication.java`, and run `AiCustomerSupportBackendApplication`.

The main Spring Boot application starts the backend using:

```java
SpringApplication.run(
    AiCustomerSupportBackendApplication.class,
    args
);
```

### 🌐 Backend URL

The backend runs on <http://localhost:8080>. The configured server port is:

```properties
server.port=8080
```

### 🔍 Verify the Backend

After starting the application, check the console for a successful Spring Boot startup. You can then access the API through <http://localhost:8080>. The Angular frontend can communicate with the backend through the configured REST APIs.

---

## 🛠️ Useful Maven Commands

| Purpose | Command |
|---------|---------|
| Clean | `.\mvnw.cmd clean` |
| Compile | `.\mvnw.cmd compile` |
| Run tests | `.\mvnw.cmd test` |
| Build | `.\mvnw.cmd clean package` |
| Run Spring Boot | `.\mvnw.cmd spring-boot:run` |

---

## 🧯 Troubleshooting

### PostgreSQL Connection Error

Check that:

- PostgreSQL is running
- The database exists
- The username is correct
- The password is correct
- The port is `5432`

Also verify `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

### Gemini API Error

Check `GEMINI_API_KEY` and make sure the API key is available in the environment where Spring Boot is running.

### Port 8080 Already in Use

Find the process using port 8080, or change the port to another available one:

```properties
server.port=8081
```

### Maven Dependency Problems

Try:

```powershell
.\mvnw.cmd clean
.\mvnw.cmd clean install
```

---

## 🧱 Backend Design Philosophy

### Separation of Concerns

- Controllers handle HTTP.
- Services handle business logic.
- Repositories handle persistence.
- Entities represent domain data.
- Security components handle authentication and authorization.
- AI services handle AI-specific operations.

### Business Logic First

The backend does not simply expose database CRUD operations. It contains business workflows such as:

- AI Escalation
- Ticket Lifecycle
- SLA Handling
- Resolution Confirmation
- Customer Satisfaction
- Ownership Validation
- AI Monitoring
- Audit Logging
- Knowledge Retrieval

### Security by Design

Authentication, authorization, ownership validation, and password protection are handled as core backend responsibilities.

### AI + Human Support

The platform does not attempt to replace human support completely. Instead:

```text
AI
 ↓
Assist
 ↓
Analyze
 ↓
Resolve when possible
 ↓
Escalate when necessary
 ↓
Human Support
```

This creates a hybrid customer-support architecture where AI handles suitable requests while complex or sensitive cases can reach human employees.

---

## 📌 Backend Highlights

- 🔐 **Secure** — JWT + Spring Security + BCrypt + RBAC + ownership validation.
- 🤖 **Intelligent** — Gemini AI integration with confidence, sentiment, risk, and escalation logic.
- 🎫 **Business-Oriented** — Complete ticket lifecycle from creation to resolution and satisfaction.
- 📊 **Observable** — AI monitoring, metrics, attention queue, and audit logging.
- 📚 **Knowledge-Aware** — Knowledge Base and retrieval services integrated into the support architecture.
- 🧩 **Maintainable** — Layered Spring Boot architecture with controllers, services, repositories, entities, DTOs, and security components.
- 🚀 **Extensible** — The architecture allows future expansion of AI models, escalation policies, support teams, SLA rules, and knowledge sources.

---

## 🏁 Final Architecture

```text
                         ┌──────────────────────┐
                         │      Angular UI      │
                         └──────────┬───────────┘
                                    │
                                  REST
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Spring Security   │
                         │         + JWT        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Controllers     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Services       │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
             Business Logic                       AI Services
                    │                                  │
                    │                                  ▼
                    │                              Gemini AI
                    ▼
              Repositories
                    │
                    ▼
               PostgreSQL
```

Additional backend layers:

```text
AI Escalation
      │
      ├── Ticket Creation
      ├── Attention Queue
      ├── SLA Handling
      └── Human Support

AI Monitoring
      │
      ├── Metrics
      ├── Confidence
      ├── Risk
      ├── Sentiment
      └── Escalation

Governance
      │
      └── Audit Logging
```

---

## ❤️ Built for Intelligent Customer Support

The AI Customer Support Backend combines traditional enterprise backend architecture with AI-powered customer support workflows. It is designed to provide a secure and structured foundation for:

- 🤖 AI-powered conversations
- 🎫 Intelligent ticket management
- 🚨 Automated escalation
- 🔐 Secure authentication
- 📚 Knowledge-based support
- ⏱️ SLA-aware operations
- 📊 AI monitoring
- 🧾 Auditability
- ⭐ Customer satisfaction

The result is a backend architecture that connects AI intelligence, business rules, human support, and persistent data into one unified customer-support platform.