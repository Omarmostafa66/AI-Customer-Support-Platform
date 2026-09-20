# 🤖 AI Customer Support

AI Customer Support is an intelligent customer support system designed to manage customers and support tickets while preparing the backend for future AI-powered ticket analysis and automated responses.

The project is being developed progressively as part of the **NTG Clarity AI Product Internship**.

---

## 🚀 Project Overview

The system currently provides:

- 👥 Customer Management
- 🎫 Ticket Management
- ❤️ Backend Health Check
- ✅ Request Validation
- ⚠️ Global Error Handling
- 🗄️ Database Persistence
- 🤖 AI Service Boundary
- 🧪 Mock AI Analysis Service

The current AI implementation is a **temporary mock/stub** designed to maintain a stable API contract until the real AI model is integrated.

---

## 🏗️ Current Architecture

The backend follows a layered architecture:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

For AI functionality:

```
Ticket
   ↓
AI Support Service Interface
   ↓
Mock AI Service
   ↓
AI Analysis Response
```

This structure allows the mock AI implementation to be replaced later with a real AI model without changing the frontend-facing API.

---

## 🛠️ Technology Stack

**Backend**
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Jakarta Validation

**Database**
- JPA / Hibernate
- Relational Database

**AI Integration**
- AI Service Boundary
- Mock AI Support Service

**Development Tools**
- IntelliJ IDEA
- Postman
- Git & GitHub

---

## 📁 Project Structure of backend

```
src
│
├── main
│   ├── java
│   │   └── com.aicustomersupport.aicustomersupportbackend
│   │
│   │       ├── ai
│   │       │   ├── AiAnalysisResponse.java
│   │       │   ├── AiSupportService.java
│   │       │   └── MockAiSupportService.java
│   │       │
│   │       ├── controller
│   │       │   ├── CustomerController.java
│   │       │   ├── HealthController.java
│   │       │   └── TicketController.java
│   │       │
│   │       ├── entity
│   │       │   ├── Customer.java
│   │       │   └── Ticket.java
│   │       │
│   │       ├── exception
│   │       │   └── GlobalExceptionHandler.java
│   │       │
│   │       ├── repository
│   │       │   ├── CustomerRepository.java
│   │       │   └── TicketRepository.java
│   │       │
│   │       ├── service
│   │       │   ├── CustomerService.java
│   │       │   └── TicketService.java
│   │       │
│   │       └── AiCustomerSupportBackendApplication.java
│   │
│   └── resources
│       └── application.properties
│
└── test
```

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/amrhany964/AI-Customer-Support.git
```

### 2. Navigate to the Project Directory
```bash
cd AI-Customer-Support
```

### 3. Open the Backend Project

Open the backend project using:
- IntelliJ IDEA
- Eclipse
- VS Code with Java Extensions

### 4. Configure the Database

Configure your database connection inside:
```
src/main/resources/application.properties
```

Example:
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

> ⚠️ Never commit real database passwords, API keys, or other secrets to GitHub.
> Sensitive values are loaded from environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) rather than hardcoded in `application.properties`.

### ▶️ Running the Backend

You can run the application directly from IntelliJ IDEA.

Run: `AiCustomerSupportBackendApplication.java`

Or using Maven:
```bash
./mvnw spring-boot:run
```

For Windows:
```bash
mvnw.cmd spring-boot:run
```

The backend will start by default on:
```
http://localhost:8080
```

---

## ❤️ Health Endpoint

Verify that the backend is running:

**Request**
```
GET /health
```
Example: `http://localhost:8080/health`

**Response**
```json
{
  "status": "UP"
}
```

**Status Code:** `200 OK`

---

## 👤 Customer API

### Get All Customers
**Request**
```
GET /customers
```
Example: `http://localhost:8080/customers`

**Response**
```json
[
  {
    "id": 1,
    "name": "Mora",
    "email": "Mora@example.com",
    "phone": "0100000000",
    "issue": "Cannot login to my account",
    "status": "OPEN"
  }
]
```

### Get Customer By ID
**Request**
```
GET /customers/{id}
```
Example: `http://localhost:8080/customers/1`

**Responses**
- Success → `200 OK`
- Not Found → `404 Not Found`

### Create Customer
**Request**
```
POST /customers
```

**Example Request Body**
```json
{
  "name": "Mora",
  "email": "Mora@example.com",
  "phone": "0100000000",
  "issue": "Cannot login to my account",
  "status": "OPEN"
}
```

### Update Customer
**Request**
```
PUT /customers/{id}
```

**Example Request Body**
```json
{
  "name": "Mora Updated",
  "email": "Mora@example.com",
  "phone": "0100000000",
  "issue": "Updated customer issue",
  "status": "OPEN"
}
```

**Responses**
- Successful update → `200 OK`
- Customer not found → `404 Not Found`

### Delete Customer
**Request**
```
DELETE /customers/{id}
```

**Responses**
- Successful deletion → `204 No Content`
- Customer not found → `404 Not Found`

---

## 🎫 Ticket API

### Get All Tickets
**Request**
```
GET /tickets
```

**Response**
```json
[
  {
    "id": 1,
    "title": "Payment Problem",
    "description": "Customer cannot complete the payment",
    "status": "OPEN",
    "priority": "HIGH"
  }
]
```

### Get Ticket By ID
**Request**
```
GET /tickets/{id}
```
Example: `http://localhost:8080/tickets/1`

**Responses**
- Success → `200 OK`
- Not Found → `404 Not Found`

### Create Ticket
**Request**
```
POST /tickets
```

**Example Request Body**
```json
{
  "title": "Payment Problem",
  "description": "Customer cannot complete the payment",
  "status": "OPEN",
  "priority": "HIGH"
}
```

### 👤 Create Ticket for Customer
**Request**
```
POST /tickets/customer/{customerId}
```
Example: `POST http://localhost:8080/tickets/customer/1`

**Request Body**
```json
{
  "title": "Login Problem",
  "description": "Customer cannot access the account",
  "status": "OPEN",
  "priority": "HIGH"
}
```

If the customer does not exist → `404 Not Found`

### ✏️ Update Ticket
**Request**
```
PUT /tickets/{id}
```
Example: `PUT http://localhost:8080/tickets/1`

**Request Body**
```json
{
  "title": "Updated Ticket",
  "description": "Updated ticket description",
  "status": "OPEN",
  "priority": "HIGH"
}
```

**Responses**
- Successful update → `200 OK`
- Ticket not found → `404 Not Found`

### 🗑️ Delete Ticket
**Request**
```
DELETE /tickets/{id}
```
Example: `DELETE http://localhost:8080/tickets/1`

**Responses**
- Successful deletion → `204 No Content`
- Ticket not found → `404 Not Found`

---

## 🤖 AI Ticket Analysis

The backend currently includes an AI service boundary. The current implementation uses a **Mock AI Service**, which allows the backend API to remain stable while the real AI implementation is developed separately.

### Analyze Ticket
**Request**
```
GET /tickets/{id}/analyze
```
Example: `http://localhost:8080/tickets/2/analyze`

**Example Response**
```json
{
  "category": "General Support",
  "suggestedPriority": "MEDIUM",
  "suggestedResponse": "Thank you for contacting support. Our team will review your request shortly."
}
```

### 🧠 AI Service Architecture

The AI integration is designed using an interface: `AiSupportService`

Current implementation: `MockAiSupportService`

The mock returns a predefined response using `AiAnalysisResponse`.

**Future implementation:**
```
Ticket
   ↓
AiSupportService
   ↓
Real AI Service
   ↓
OpenAI / AI Model / Custom Model
   ↓
AiAnalysisResponse
```

This means the real AI service can replace the mock without changing the API contract used by the frontend.

---

## ✅ Validation & Error Handling

Ticket requests use validation to ensure required fields are provided.

**Example invalid request**
```json
{
  "title": "",
  "description": "",
  "status": "",
  "priority": ""
}
```

**Example response**
```json
{
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "description": "Description is required",
    "status": "Status is required",
    "priority": "Priority is required"
  },
  "status": 400
}
```

**Status:** `400 Bad Request`

---

## 🧪 API Testing

The backend has been manually tested using Postman.

| Scenario | Request | Expected Result |
|---|---|---|
| Health Check | `GET /health` | `200 OK` |
| Get All Tickets | `GET /tickets` | `200 OK` |
| Valid Ticket Request | `POST /tickets` | Successful ticket creation |
| Invalid Ticket Request | Missing required fields | `400 Bad Request` |
| Non-Existing Ticket | `GET /tickets/999` | `404 Not Found` |
| Update Non-Existing Ticket | `PUT /tickets/999` | `404 Not Found` |
| Delete Non-Existing Ticket | `DELETE /tickets/999` | `404 Not Found` |
| AI Ticket Analysis | `GET /tickets/2/analyze` | `200 OK` with structured AI analysis response |

---

## 👥 Team Workflow

Before starting work:
```bash
git pull
```

Create a new branch:
```bash
git checkout -b feature/your-task
```

Make your changes and test locally, then:
```bash
git add .
git commit -m "Implement ticket AI analysis endpoint"
git push -u origin feature/your-task
```

Then open a Pull Request for review.

### 📝 Commit Guidelines

Use clear commit messages, for example:
- `Add health endpoint`
- `Implement ticket validation`
- `Add AI service boundary`
- `Implement mock AI support service`
- `Add ticket analysis endpoint`

Avoid unclear messages such as `update`, `fix`, `changes`.

---

## 🚧 Current Development Status

### ✅ Completed
- Backend application structure
- Controllers
- Service layer
- Repository layer
- Customer entity
- Ticket entity
- Database integration
- Health endpoint
- Ticket CRUD operations
- Request validation
- Global error handling
- Customer-ticket relationship
- AI service boundary
- Mock AI implementation
- Ticket AI analysis endpoint
- Manual API testing

### 🔜 Next Steps
- 🤖 Replacing the Mock AI Service with a real AI model
- 🧠 Improving AI ticket classification
- ⚡ Automatic priority detection
- 💬 AI-generated customer responses
- 🔗 Frontend integration
- 🧪 Automated backend testing
- 🔐 Environment-based configuration
- 📊 Additional ticket analytics

---

## 📅 Day 3 – Backend Foundation

The following Day 3 objectives have been completed:

- ✅ Backend runs locally
- ✅ Health endpoint works
- ✅ MVP endpoints implemented
- ✅ Request validation implemented
- ✅ Error handling implemented
- ✅ Database foundation implemented
- ✅ Customer and Ticket persistence implemented
- ✅ AI service boundary created
- ✅ Mock AI service prepared
- ✅ Valid endpoint testing demonstrated
- ✅ Invalid/edge case testing demonstrated
- ✅ README updated

### 🎯 Day 3 Finish Line

The project now has a working backend foundation with:
- A structured architecture
- Working API endpoints
- Input validation
- Error handling
- Database support
- Clean service boundaries
- A replaceable AI mock implementation

The backend is now ready for the next phase of AI and frontend integration.

---

## 🚀 Day 4 Handoff

### Backend Ready

The following backend functionality is ready for integration:

- Health check endpoint: `GET /health`
- Customer management APIs
- Ticket CRUD APIs
- Customer-ticket relationship
- Request validation
- Global error handling
- Database persistence
- Ticket AI analysis endpoint

### AI Mock / Pending Work

The current AI implementation is still a mock:

```text
MockAiSupportService
```

The mock must be replaced with a real AI implementation in the next development phase. The future AI implementation should continue using the existing `AiSupportService` interface and return `AiAnalysisResponse`. This ensures the frontend API contract remains unchanged.

### AI Team – Next Work

AI team members can now focus on:

- Real ticket classification
- Priority prediction
- Suggested customer responses
- Testing representative customer support inputs
- Measuring response quality and latency

### Frontend Team – Ready APIs

The frontend team can begin integrating with:

```
GET /health

GET /tickets
GET /tickets/{id}

POST /tickets
POST /tickets/customer/{customerId}

PUT /tickets/{id}

DELETE /tickets/{id}

GET /tickets/{id}/analyze
```

### Current Blockers

- Real AI model integration is not implemented yet.
- AI analysis currently uses a temporary mock response.
- Automated backend tests are planned for a future development phase.

---

## 👥 Team

Developed as part of:

**NTG Clarity – AI Product Internship**

**Project:** AI Customer Support
