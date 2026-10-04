<div align="center">

# 🎧 AI Customer Support Platform

**A full-stack, role-based customer support management platform built with Angular, Spring Boot, and PostgreSQL.**

![Java](https://img.shields.io/badge/Java-23+-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-REST_API-6DB33F?logo=springboot&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-Frontend-DD0031?logo=angular&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Main Features](#-main-features)
- [Technology Stack](#-technology-stack)
- [Design System](#-design-system)
- [Application Structure](#-application-structure)
- [Architecture & Flows](#-architecture--flows)
- [API Reference](#-api-reference)
- [Database](#-database)
- [Configuration](#-configuration)
- [Getting Started](#-getting-started)
- [Error Handling](#-error-handling)
- [User Experience](#-user-experience)
- [Project Status](#-project-status)
- [Future Enhancements](#-future-enhancements)
- [Security Notes](#-important-security-notes)
- [License](#-license)

---

## 🧭 Overview

The **AI Customer Support Platform** is a full-stack web application that provides a centralized environment for customer support operations. It offers role-based access for **Administrators**, **Employees**, and **Customers**, with a professional dashboard interface and a secure Spring Boot REST API connected to PostgreSQL.

Authenticated users access functionality according to their role, while communication between the Angular frontend and the Spring Boot backend stays secure.

**The platform covers:**

- Customer Support Management
- Ticket, Customer, Incident, Employee, Message, and Category Management
- Account, Profile, Profile Photo, and Password Management
- Role-Based Access Control (RBAC)
- JWT Authentication
- Secure REST APIs

---

## ✨ Main Features

### 🔐 Authentication

Secure authentication using JSON Web Tokens (JWT).

- User Login & Registration
- JWT Token Generation & Validation
- Secure Password Hashing (BCrypt)
- Stateless Authentication
- Automatic Authorization Header Injection
- Protected Angular Routes
- Role-Based Route Protection
- Logout

### 👥 Role-Based Access Control

| Role | Access |
|------|--------|
| **Administrator** | Full management workspace: Dashboard, Tickets, Customers, Incidents, Messages, Categories, Employees, and Account Management |
| **Employee** | Employee workspace with support-related operations according to assigned permissions |
| **Customer** | Customer portal to interact with the support system and manage their own account and tickets |

### 👤 Account Management

Every authenticated user has a dedicated **Account** page that provides:

- Personal Information & Profile Editing
- Email, Phone Number, Address, Gender, and Age
- Account Type
- Employee Position and Salary Information *(where applicable)*
- Password Management
- Profile Photo Management

### 🖼️ Profile Photo System

Users can:

- Upload a profile photo
- Preview a selected photo
- Confirm or cancel the upload
- Remove the current photo
- View the current photo in a centered modal
- Close the viewer using the **X** button or by clicking outside the modal

**Supported formats:** `JPEG` · `PNG` · `WEBP`

The photo is stored directly in **PostgreSQL** as binary data together with its content type. It is requested through Angular's authenticated `HttpClient` (instead of a direct backend URL), which guarantees that the JWT `Authorization` header is included.

#### Photo Viewer

```text
Click Profile Photo
        ↓
Open Photo Button
        ↓
Click "Open Photo"
        ↓
Centered Photo Modal
        ↓
View Large Profile Photo
        ↓
Close with X / Outside Click
```

The viewer includes: dark overlay, background blur, centered modal, responsive image sizing, close button, outside-click closing, responsive mobile design, and smooth animations.

### 🔑 Password Management

Authenticated users can change their password from the Account page. The system validates:

- Current password
- New password and password confirmation
- Minimum password length
- New password must differ from the current password

Password fields support visibility toggling. Passwords are **never stored as plain text**. The backend uses **BCrypt** hashing.

### 🛡️ Security

- Spring Security
- JWT Authentication
- BCrypt Password Hashing
- Stateless Sessions
- Role-Based Authorization
- Method-Level Security
- Protected REST Endpoints
- CORS Configuration
- Ownership Validation

---

## 🧰 Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Java | Backend programming language |
| Spring Boot | Backend framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database access |
| Hibernate | ORM |
| PostgreSQL | Database |
| JJWT | JWT implementation |
| BCrypt | Password hashing |
| Jakarta Validation | Request validation |
| Maven | Dependency management |

### Frontend

| Technology | Purpose |
|------------|---------|
| Angular | Frontend framework |
| TypeScript | Frontend programming language |
| HTML5 | Application structure |
| CSS3 | UI styling |
| Angular Router | Navigation |
| Angular HttpClient | API communication |
| FormsModule | Form handling |
| Signals | Reactive application state |

---

## 🎨 Design System

The frontend follows a consistent **three-color** design system.

| Color | Hex | Used For |
|-------|-----|----------|
| 🟣 **Deep Plum** | `#241A2F` | Main headings, sidebar, primary text, dark UI elements |
| 🟠 **Coral** | `#F05A3C` | Primary actions, active navigation, buttons, profile controls, important interactive elements |
| 🟢 **Teal** | `#14B8A6` | Secondary accents, section labels, focus states, success indicators, supporting UI elements |

---

## 🗂️ Application Structure

The project is divided into two main applications:

```text
AI-Customer-Support/
│
├── backend/
│
└── frontend/
```

### Backend

The Spring Boot backend follows a **layered architecture**.

```text
backend/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── aicustomersupport/
│       │           └── aicustomersupportbackend/
│       │
│       └── resources/
│
├── pom.xml
└── application.yml
```

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

### Frontend

The Angular application is organized into pages, services, guards, interceptors, layouts, models, and shared components.

```text
frontend/
│
├── src/
│   └── app/
│       │
│       ├── pages/
│       │   ├── account/
│       │   ├── dashboard/
│       │   ├── tickets/
│       │   ├── customers/
│       │   ├── incidents/
│       │   ├── messages/
│       │   ├── categories/
│       │   └── employees/
│       │
│       ├── services/
│       ├── guards/
│       ├── interceptors/
│       │
│       ├── layout/
│       │   ├── sidebar/
│       │   └── customer-header/
│       │
│       ├── shared/
│       ├── models/
│       │
│       ├── app.routes.ts
│       └── app.config.ts
│
└── package.json
```

### Important Frontend Building Blocks

#### `AuthService`

Responsible for login state, JWT token management, current user session, role detection, logout, avatar state, and authentication state.

```ts
isAdmin()
isEmployee()
isCustomer()
```

#### `ApiService`

The central service for communication between Angular and Spring Boot. It handles `GET`, `POST`, `PUT`, and `DELETE` requests, plus authentication, account, avatar, and application resource endpoints.

#### `AccountAvatarService`

Synchronizes profile avatar changes across the application. When a user uploads or removes a photo, the avatar is refreshed in the **Sidebar**, **Header**, and **Account page** without a full reload.

#### HTTP Interceptor

Automatically attaches the JWT token to authenticated requests. Login and registration requests are excluded because they are public endpoints.

```text
Angular Request
      ↓
Auth Interceptor
      ↓
JWT Available?
      ↓
Authorization Header
      ↓
Spring Boot API
```

```http
Authorization: Bearer <JWT_TOKEN>
```

#### Route Guards

Protected routes use authentication and role guards to prevent unauthorized access.

```ts
canActivate: [
  authGuard,
  roleGuard([
    'ADMIN',
    'EMPLOYEE',
    'CUSTOMER'
  ])
]
```

---

## 🏗️ Architecture & Flows

### System Architecture

```text
                    ┌───────────────┐
                    │    Browser    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Angular    │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                    HTTP / REST API
                            │
                            ▼
                    ┌───────────────┐
                    │  Spring Boot  │
                    │    Backend    │
                    └───────┬───────┘
                            │
                     JPA / Hibernate
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │   Database    │
                    └───────────────┘
```

### Authentication Flow

```text
User
  │
  ▼
Angular Login Page
  │
  ▼
POST /auth/login
  │
  ▼
Spring Boot Authentication
  │
  ▼
JWT Token
  │
  ▼
Angular AuthService
  │
  ▼
localStorage
  │
  ▼
HTTP Interceptor
  │
  ▼
Authorization: Bearer <JWT>
  │
  ▼
Protected Backend Endpoint
```

### Profile Photo Flow

```text
User selects image
        │
        ▼
Angular validates file
        │
        ▼
Local preview
        │
        ▼
User clicks "Upload Photo"
        │
        ▼
POST /account/me/avatar
        │
        ▼
Spring Boot
        │
        ▼
PostgreSQL
        │
        ▼
Avatar saved
        │
        ▼
Angular reloads avatar
        │
        ▼
Sidebar / Header / Account
```

### Security Architecture

```text
Authentication
      │
      ▼
JWT
      │
      ▼
Spring Security Filter
      │
      ▼
Authenticated User
      │
      ├──────── ADMIN
      │
      ├──────── EMPLOYEE
      │
      └──────── CUSTOMER
               │
               ▼
        Role-Based Access
```

### High-Level Summary

```text
                    AI CUSTOMER SUPPORT
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
        ANGULAR FRONTEND             SPRING BOOT API
             │                             │
      ┌──────┼──────┐              ┌───────┼────────┐
      │      │      │              │       │        │
      ▼      ▼      ▼              ▼       ▼        ▼
    Pages  Services Guards      Security Controllers Services
      │      │      │              │       │        │
      └──────┼──────┘              └───────┼────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                       PostgreSQL
```

---

## 📡 API Reference

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate a user and receive a JWT |
| `POST` | `/auth/register` | Register a new user |

### Account API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/account/me` | Get the current authenticated user's account |
| `PUT` | `/account/me` | Update editable personal information |
| `PUT` | `/account/me/password` | Change password |
| `POST` | `/account/me/avatar` | Upload avatar (`multipart/form-data`, param: `file`) |
| `GET` | `/account/me/avatar` | Get the authenticated user's profile image |
| `DELETE` | `/account/me/avatar` | Remove the user's profile photo |

<details>
<summary><b>Example: Update Account</b> — <code>PUT /account/me</code></summary>

```json
{
  "name": "System Administrator",
  "email": "admin@example.com",
  "phoneNumber": "01000000000",
  "address": "Cairo, Egypt",
  "gender": "MALE",
  "age": 30
}
```

</details>

<details>
<summary><b>Example: Change Password</b> — <code>PUT /account/me/password</code></summary>

```json
{
  "currentPassword": "CurrentPassword",
  "newPassword": "NewPassword123"
}
```

</details>

### Public Endpoints

```text
/auth/**
/health
```

All other endpoints require authentication.

---

## 🗄️ Database

The project uses **PostgreSQL** with **Hibernate/JPA** for object-relational mapping.

### Avatar Storage

Profile images are stored in the database using the fields `avatar` and `avatar_content_type`, which allows the backend to return the original image with its correct MIME type.

```java
@Lob
@Basic(fetch = FetchType.LAZY)
@Column(name = "avatar")
private byte[] avatar;

@Column(name = "avatar_content_type")
private String avatarContentType;
```

---

## ⚙️ Configuration

Backend configuration lives in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/your_database
    username: postgres
    password: your_password

server:
  port: 8080
```

| Service | URL |
|---------|-----|
| Frontend (Angular) | http://localhost:4200 |
| Backend (Spring Boot) | http://localhost:8080 |

---

## 🚀 Getting Started

### Requirements

- Java 23+
- Node.js & npm
- Angular CLI
- PostgreSQL 17+
- IntelliJ IDEA
- Git

### 1. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

The frontend is available at **http://localhost:4200**.

### Running the Full Project

1. Start **PostgreSQL**.
2. Start the backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Start the frontend:
   ```bash
   cd frontend
   ng serve
   ```
4. Open **http://localhost:4200**.

### Default Administrator

The development environment includes a default administrator account:

| Field | Value |
|-------|-------|
| Email | `admin@aicustomersupport.com` |
| Password | `Admin@123456` |

> ⚠️ **Warning:** This account is intended for development/testing only. Change or remove the default credentials before deploying to production.

---

## 🚦 Error Handling

The backend returns standard HTTP status codes:

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `500` | Internal Server Error |

The Angular frontend displays user-friendly **toast notifications** for both errors and successful operations.

---

## 💎 User Experience

The frontend is designed around a modern management-dashboard style:

- Clean layout & consistent spacing
- Rounded cards & subtle shadows
- Professional typography
- Smooth transitions
- Consistent color system
- Accessible focus states
- Toast notifications
- Loading states
- Modal interactions

### Responsive Design

Supports **Desktop**, **Tablet**, **Mobile**, and **Small Mobile**, including collapsible layouts, stacked profile sections, responsive forms, mobile-friendly buttons, a responsive photo viewer, flexible information grids, and mobile password forms.

### Account Page Layout

```text
┌──────────────────────────────────────┐
│             My Account               │
├──────────────────────────────────────┤
│                                      │
│  Profile Photo     Personal Details  │
│                                      │
│  Change Photo      Remove Photo      │
│                                      │
├──────────────────────────────────────┤
│       Personal Information           │
│                                      │
│  Full Name       Email               │
│  Phone           Address             │
│  Gender          Age                 │
│  Account Type    Position            │
│  Salary                              │
│                                      │
├──────────────────────────────────────┤
│        Password & Security           │
│                                      │
│  Current Password                    │
│  New Password                        │
│  Confirm Password                    │
│                                      │
│          Change Password             │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Project Status

The current implementation includes the core application architecture and authentication system.

- [x] Authentication
- [x] JWT Security
- [x] Role-Based Authorization
- [x] Admin Workspace
- [x] Employee Workspace
- [x] Customer Portal
- [x] Dashboard
- [x] Tickets
- [x] Customers
- [x] Incidents
- [x] Messages
- [x] Categories
- [x] Employees
- [x] Account Management
- [x] Profile Editing
- [x] Password Management
- [x] Profile Photo Upload / Preview / Delete / Modal
- [x] Sidebar & Header Avatar
- [x] Responsive UI
- [x] Toast Notifications
- [x] Protected Routes
- [x] API Integration

---

## 🔮 Future Enhancements

- [ ] AI-powered ticket classification
- [ ] Automatic ticket prioritization
- [ ] AI response suggestions
- [ ] Sentiment analysis
- [ ] Customer chatbot
- [ ] Knowledge base
- [ ] Email notifications
- [ ] Real-time notifications
- [ ] WebSocket support
- [ ] Advanced analytics
- [ ] Customer satisfaction tracking
- [ ] Support performance reports
- [ ] Advanced search
- [ ] Audit logging
- [ ] File attachments
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Production deployment

---

## 🔒 Important Security Notes

This project is currently designed for **local development and testing**. Before deploying to production:

1. Change the default administrator password.
2. Store secrets in environment variables.
3. Do not commit JWT secrets to Git.
4. Do not commit database passwords.
5. Configure production CORS origins.
6. Use HTTPS.
7. Configure a secure JWT expiration.
8. Review file upload restrictions.
9. Add rate limiting.
10. Add production logging and monitoring.

### Recommended `.gitignore`

```gitignore
node_modules/
dist/
target/
.idea/
*.iml
.env
application-local.yml
application-prod.yml
```

---

## 👨‍💻 Author

Developed as a full-stack customer support management platform using modern web technologies.

---

## 📄 License

This project is currently intended for **educational and development purposes**.

A production license can be added according to the project's deployment and distribution requirements.
