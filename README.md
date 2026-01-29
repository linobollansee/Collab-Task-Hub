# Collab Task Hub

A real-time collaborative project management platform with WebSocket-based chat, Kanban boards, and role-based access control.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-UNLICENSED-red)

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Deep Dive](#technology-deep-dive)
  - [Backend (NestJS)](#backend-nestjs)
  - [Frontend (Next.js 16)](#frontend-nextjs-16)
  - [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [REST API](#rest-api)
  - [WebSocket API](#websocket-api)
- [Directory Structure](#directory-structure)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Docker Development](#docker-development)
  - [Local Development](#local-development-without-docker)
- [Production Deployment](#production-deployment)
- [Testing](#testing)
  - [Backend Tests](#backend-tests)
  - [API Testing Tools](#api-testing-tools)
- [CI/CD](#cicd)
- [Scripts & Utilities](#scripts--utilities)
- [Configuration Files](#configuration-files)
- [API Documentation](#api-documentation)
- [Database Migrations](#database-migrations)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)
- [Support & Help](#support--help)
- [License](#license)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

## Quick Start

Get the project running in under 2 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Collab-Task-Hub

# 2. Set up environment variables
cp .env.example .env

# 3. Start all services with Docker
docker-compose up

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Swagger Docs: http://localhost:4000/api
```

That's it! The application will automatically:
- Start PostgreSQL database
- Run database migrations
- Start the backend API
- Start the frontend application

For detailed setup options, see [Development Setup](#development-setup).

## Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based registration and login
- ✅ **Project Management** - Create, update, and delete projects
- ✅ **Role-Based Access Control** - Admin, Member, and Viewer roles
- ✅ **Task Management** - Full CRUD operations with status and priority
- ✅ **Kanban Board** - Drag-and-drop task management (Backlog, In Progress, Review, Done)
- ✅ **Real-Time Chat** - WebSocket-based messaging per project
- ✅ **Member Management** - Add/remove members and manage roles
- ✅ **User Profiles** - View and update user information

### Technical Features
- ✅ **RESTful API** - 25 documented endpoints with Swagger UI
- ✅ **WebSocket Support** - Real-time bidirectional communication
- ✅ **Database Relations** - Proper foreign keys and cascade deletes
- ✅ **Input Validation** - DTO validation with class-validator
- ✅ **TypeScript** - Full type safety across frontend and backend
- ✅ **Docker Support** - Development and production containers
- ✅ **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- ✅ **E2E Testing** - Comprehensive integration tests
- ✅ **Health Checks** - Container orchestration ready
- ✅ **CORS Security** - Configurable origin whitelist
- ✅ **Password Hashing** - bcrypt with cost factor 10

## Architecture

**Stack**: NestJS + Next.js + PostgreSQL + Socket.IO + Nginx  
**Deployment**: Docker Compose with multi-stage builds  
**API**: RESTful + WebSocket  
**Auth**: JWT with Passport strategies (local + JWT)

### High-Level Structure

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Nginx     │────▶│   Next.js   │────▶│   NestJS     │
│  (Reverse   │     │  (Frontend) │     │  (Backend)   │
│   Proxy)    │     │   Port 3000 │     │   Port 4000  │
└─────────────┘     └─────────────┘     └──────┬───────┘
                                               │
                    ┌──────────────────────────┼────────────┐
                    │                          │            │
              ┌─────▼──────┐          ┌────────▼────┐  ┌───▼────┐
              │ PostgreSQL │          │  Socket.IO  │  │ Swagger│
              │  Port 5432 │          │   /chat     │  │  /api  │
              └────────────┘          └─────────────┘  └────────┘
```

## Technology Deep Dive

### Backend (NestJS)

**Core Dependencies**:
- `@nestjs/core` (v11.x) - Framework foundation
- `@nestjs/typeorm` + `typeorm` - ORM with PostgreSQL driver
- `@nestjs/jwt` + `passport-jwt` - JWT authentication
- `@nestjs/websockets` + `socket.io` - Real-time communication
- `@nestjs/swagger` - OpenAPI documentation
- `bcrypt` - Password hashing
- `class-validator` + `class-transformer` - DTO validation
- `lodash` - Utility library (required by @nestjs/swagger)

**Module Architecture**:
- `AuthModule` - Authentication (register/login/JWT validation)
- `UsersModule` - User CRUD and password verification
- `ProjectsModule` - Project + member management
- `TasksModule` - Task CRUD with status/priority
- `ChatModule` - WebSocket gateway + message persistence

**Key Features**:
- Global validation pipe with DTO transformation
- TypeORM auto-sync (dev) with entity relationships
- CORS configuration for multiple origins
- Swagger UI auto-generated from decorators
- Health check endpoint for container orchestration

### Frontend (Next.js 16)

**Core Dependencies**:
- `next` (v16.1.4) - App router with React 19
- `zustand` - State management (auth, projects, tasks, chat)
- `socket.io-client` - WebSocket client
- `react-hook-form` + `zod` - Form validation
- `@dnd-kit/core` - Drag-and-drop for Kanban
- `axios` - HTTP client
- `tailwindcss` (v4) - Styling

**Feature-Slice Structure**:
```
features/
├── auth/        - Authentication (login/register/session)
├── project/     - Project management (CRUD/members)
├── task/        - Task management (CRUD/status updates)
├── board/       - Kanban board (drag-drop/columns)
├── chat/        - Real-time messaging (Socket.IO)
├── members/     - Project member management
├── modal/       - Global modal system
├── tabs/        - Tab navigation
└── user/        - User profile
```

**State Management**:
- Zustand stores per feature (auth, chat, projects, tasks)
- React hooks wrapping stores for component consumption
- API layer abstraction with axios interceptors

### Database Schema

**Entities**:

```typescript
users
├── id: uuid (PK)
├── email: string (UNIQUE)
├── name: string
├── passwordHash: string
├── createdAt: timestamp
└── updatedAt: timestamp

projects
├── id: uuid (PK)
├── title: string
├── description: text
├── createdById: uuid (FK -> users)
├── members: ProjectMember[] (eager)
├── createdAt: timestamp
└── updatedAt: timestamp

project_members
├── id: uuid (PK)
├── role: enum(admin, member, viewer)
├── userId: uuid (FK -> users)
├── projectId: uuid (FK -> projects, CASCADE)
└── createdAt: timestamp

tasks
├── id: uuid (PK)
├── title: string
├── description: text
├── status: enum(backlog, in_progress, review, done)
├── priority: enum(low, medium, high)
├── projectId: uuid (FK -> projects)
├── assigneeId: uuid (FK -> users, NULLABLE)
├── createdAt: timestamp
└── updatedAt: timestamp

messages
├── id: uuid (PK)
├── content: text
├── projectId: uuid (FK -> projects)
├── userId: uuid (FK -> users)
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Relationships**:
- `User` 1:N `Project` (creator)
- `Project` 1:N `ProjectMember` (cascade delete)
- `Project` 1:N `Task`
- `User` 1:N `Task` (assignee, nullable)
- `Project` 1:N `Message`
- `User` 1:N `Message`

## API Endpoints

### REST API

**Authentication** (`/auth`):
- `POST /auth/register` - Create account (email, name, password)
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Get current user (requires JWT)

**Users** (`/users`):
- `GET /users` - List all users (requires JWT)
- `GET /users/me` - Get current user profile (requires JWT)
- `PATCH /users/me` - Update current user profile (requires JWT)

**Projects** (`/projects`):
- `GET /projects` - List user's projects (requires JWT)
- `POST /projects` - Create project (requires JWT)
- `GET /projects/all` - List all projects (no auth - admin/debug endpoint)
- `GET /projects/:id` - Get project details (no auth required)
- `PATCH /projects/:id` - Update project (requires JWT + admin role)
- `DELETE /projects/:id` - Delete project (requires JWT + admin role)
- `POST /projects/:id/members` - Add member (requires JWT + admin role)
- `DELETE /projects/:id/members/:memberId` - Remove member (requires JWT + admin role)
- `PATCH /projects/:id/members/:memberId` - Update member role (requires JWT + admin role)
- `GET /projects/:id/role` - Get user's role in project (requires JWT)

**Tasks** (`/tasks`):
- `GET /tasks` - List all tasks, optionally filtered by projectId query param (requires JWT)
- `POST /tasks` - Create task (requires JWT)
- `GET /tasks/:id` - Get task details (requires JWT)
- `PATCH /tasks/:id` - Update task (requires JWT)
- `DELETE /tasks/:id` - Delete task (requires JWT)

**Chat** (`/chat`):
- `GET /chat/projects/:projectId/messages` - Get project messages with pagination (requires JWT)
- `PATCH /chat/messages/:messageId` - Edit a message (requires JWT + author)
- `DELETE /chat/messages/:messageId` - Delete a message (requires JWT + author)

**Health**:
- `GET /health` - Service health check (no auth required)

### WebSocket API

**Namespace**: `/chat`

**Events** (Client -> Server):
- `join-project` - Join project room
  ```typescript
  { projectId: string }
  ```
- `leave-project` - Leave project room
  ```typescript
  { projectId: string }
  ```
- `send-message` - Send message
  ```typescript
  { projectId: string, content: string }
  ```
- `typing` - User typing indicator
  ```typescript
  { projectId: string, isTyping: boolean }
  ```
- `edit-message` - Edit existing message
  ```typescript
  { messageId: string, content: string }
  ```
- `delete-message` - Delete existing message
  ```typescript
  { messageId: string }
  ```

**Events** (Server -> Client):
- `new-message` - New message broadcast
  ```typescript
  { id: string, content: string, user: User, projectId: string, createdAt: Date }
  ```
- `message-edited` - Message edited broadcast
  ```typescript
  { id: string, content: string, user: User, projectId: string, createdAt: Date, updatedAt: Date }
  ```
- `message-deleted` - Message deleted broadcast
  ```typescript
  { id: string, content: string, user: User, projectId: string, createdAt: Date }
  ```
- `user-typing` - User typing status broadcast
  ```typescript
  { userId: string, userName: string, isTyping: boolean }
  ```

**Authentication**: JWT token via Socket.IO handshake auth

## Directory Structure

### Backend

```
backend/
├── src/
│   ├── main.ts                    - Bootstrap, CORS, Swagger, ValidationPipe
│   ├── app.module.ts              - Root module with TypeORM config
│   ├── health.controller.ts       - Health check endpoint
│   ├── auth/
│   │   ├── auth.module.ts         - Auth + JWT + Passport config
│   │   ├── auth.controller.ts     - POST /register, /login, GET /me
│   │   ├── auth.service.ts        - Token generation, validation
│   │   ├── jwt.strategy.ts        - JWT extraction + validation
│   │   ├── local.strategy.ts      - Username/password validation
│   │   ├── jwt-auth.guard.ts      - JWT route guard
│   │   ├── local-auth.guard.ts    - Local auth guard
│   │   ├── decorators/            - Custom decorators (CurrentUser)
│   │   └── dto/                   - RegisterDto, LoginDto, AuthResponseDto
│   ├── users/
│   │   ├── users.module.ts        - Users module
│   │   ├── users.controller.ts    - GET /users, /users/me, PATCH /users/me
│   │   ├── users.service.ts       - User CRUD + bcrypt password ops
│   │   ├── user.entity.ts         - TypeORM entity
│   │   └── dto/                   - UpdateUserDto, UserResponseDto
│   ├── projects/
│   │   ├── projects.module.ts     - Projects module
│   │   ├── projects.controller.ts - Project + member CRUD endpoints
│   │   ├── projects.service.ts    - Project business logic + member mgmt
│   │   ├── project.entity.ts      - Project + ProjectMember entities
│   │   └── dto/                   - CreateProjectDto, UpdateProjectDto, AddMemberDto, UpdateMemberRoleDto
│   ├── tasks/
│   │   ├── tasks.module.ts        - Tasks module
│   │   ├── tasks.controller.ts    - Task CRUD endpoints
│   │   ├── tasks.service.ts       - Task business logic
│   │   ├── task.entity.ts         - Task entity with enums
│   │   └── dto/                   - CreateTaskDto, UpdateTaskDto
│   └── chat/
│       ├── chat.module.ts         - Chat + WebSocket module
│       ├── chat.controller.ts     - Chat REST API endpoints
│       ├── chat.gateway.ts        - Socket.IO gateway (events)
│       ├── chat.service.ts        - Message persistence
│       ├── message.entity.ts      - Message entity
│       ├── dto/                   - SendMessageDto, EditMessageDto, MessageResponseDto
│       └── guards/
│           └── ws-jwt.guard.ts    - WebSocket JWT guard
├── test/
│   ├── app.e2e-spec.ts            - App health check tests
│   ├── auth.e2e-spec.ts           - Auth flow integration tests
│   ├── projects.e2e-spec.ts       - Project CRUD tests
│   ├── test-utils.ts              - Test helpers (createUser, getToken)
│   └── jest-e2e.json              - E2E test config
├── Dockerfile                     - Production build (multi-stage)
├── Dockerfile.dev                 - Development build with hot reload
├── nest-cli.json                  - Nest CLI config
├── tsconfig.json                  - TypeScript config
└── package.json                   - Dependencies + scripts
```

### Frontend

```
frontend/
├── app/
│   ├── layout.tsx                 - Root layout with providers
│   ├── page.tsx                   - Home page (project list)
│   ├── globals.css                - Tailwind base styles
│   ├── (auth)/
│   │   ├── login/page.tsx         - Login page
│   │   └── register/page.tsx      - Register page
│   ├── profile/
│   │   └── page.tsx               - User profile page
│   └── project/
│       └── [id]/page.tsx          - Project detail page (board + chat)
├── features/
│   ├── auth/
│   │   ├── api/                   - Auth API calls (login, register, me)
│   │   ├── components/            - LoginForm, RegisterForm, AuthRequiredModal
│   │   ├── hooks/                 - useAuth hook
│   │   ├── provider/              - AuthProvider for session
│   │   ├── schemas/               - Zod validation schemas
│   │   ├── store/                 - Zustand auth store
│   │   └── types/                 - TypeScript types
│   ├── project/
│   │   ├── api/                   - Project API (CRUD, members)
│   │   ├── components/            - ProjectCard, CreateForm, MemberList
│   │   ├── hooks/                 - useProjects, useProject
│   │   ├── schemas/               - Zod schemas
│   │   ├── store/                 - Zustand projects store
│   │   └── types/                 - Project, ProjectMember types
│   ├── task/
│   │   ├── api/                   - Task API (CRUD)
│   │   ├── components/            - TaskCard, TaskForm, TaskDetails
│   │   ├── hooks/                 - useTasks hook
│   │   ├── schemas/               - Zod task schemas
│   │   ├── store/                 - Zustand tasks store
│   │   └── types/                 - Task, TaskStatus, TaskPriority
│   ├── board/
│   │   ├── components/            - KanbanBoard, Column, TaskDragCard
│   │   ├── store/                 - Board state (drag-drop)
│   │   └── types/                 - Board types
│   ├── chat/
│   │   ├── api/                   - Socket.IO connection manager
│   │   ├── components/            - ChatBox, MessageList, MessageInput
│   │   ├── hooks/                 - useChat, useSocket
│   │   ├── store/                 - Zustand chat store
│   │   └── types/                 - Message, TypingUser types
│   ├── members/
│   │   ├── api/                   - Member management API
│   │   ├── components/            - MemberCard, AddMemberForm
│   │   ├── hooks/                 - useMembers hook
│   │   ├── store/                 - Members state
│   │   └── types/                 - Member types
│   ├── modal/
│   │   ├── components/            - Modal, ModalProvider
│   │   ├── hooks/                 - useModal hook
│   │   ├── store/                 - Modal state
│   │   └── types/                 - Modal types
│   ├── tabs/
│   │   ├── components/            - Tabs, TabPanel
│   │   └── store/                 - Active tab state
│   └── user/
│       ├── api/                   - User API (profile, update)
│       ├── components/            - UserProfile, UserForm
│       ├── hooks/                 - useUser hook
│       ├── schemas/               - Zod user schemas
│       ├── store/                 - User state
│       └── types/                 - User types
├── shared/
│   ├── api/
│   │   └── axios.ts               - Axios instance with interceptors
│   ├── config/
│   │   └── env.ts                 - Environment variables
│   ├── hooks/
│   │   └── useDebounce.ts         - Utility hooks
│   ├── types/
│   │   └── common.ts              - Shared TypeScript types
│   └── ui/
│       ├── Button.tsx             - Reusable button component
│       ├── Input.tsx              - Input component
│       ├── Loader.tsx             - Loading spinner
│       └── ...                    - Other UI primitives
├── widgets/
│   └── app-header/
│       └── AppHeader.tsx          - Global header with auth status
├── Dockerfile                     - Production build
├── Dockerfile.dev                 - Development build
├── next.config.ts                 - Next.js config
├── postcss.config.mjs             - PostCSS + Tailwind config
└── package.json                   - Dependencies + scripts
```

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local dev without Docker)
- PostgreSQL 18 (for local dev without Docker)

### Environment Variables

**Quick Start**: Copy the example file and customize:

```bash
# Development
cp .env.example .env

# Production
cp .env.prod.example .env.production
```

**Development Environment** (`.env`):

```bash
# Backend
PORT=4000
NODE_ENV=development

# Database (use 'postgres' for Docker, 'localhost' for local)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=collab_task_hub

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Frontend API URLs
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

**Production Environment** (`.env.production`):

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password_CHANGE_ME
DB_DATABASE=collab_task_hub

# Application
PORT=4000
NODE_ENV=production
BACKEND_PORT=4000
FRONTEND_PORT=3001

# Security - CHANGE THESE
JWT_SECRET=your_jwt_secret_key_CHANGE_ME_MINIMUM_32_CHARACTERS
CORS_ORIGIN=https://yourdomain.com

# Docker
DOCKER_REGISTRY=your-registry.io/your-username
VERSION=latest

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=https://api.yourdomain.com

# Nginx
HTTP_PORT=80
HTTPS_PORT=443

# Logging
LOG_LEVEL=info
```

### Docker Development

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after dependency changes
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

**Services**:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api
- PostgreSQL: localhost:5432

### Local Development (without Docker)

**Backend**:
```bash
cd backend
npm install
npm run start:dev        # Watch mode with hot reload
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # ESLint
npm run format           # Prettier
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev              # Dev server with hot reload
npm run build            # Production build
npm run start            # Start production build
npm run lint             # ESLint
npm run format           # Prettier
```

## Production Deployment

### Automated Deployment (Recommended)

Use GitHub Actions CD pipeline for automated deployments:

```bash
# Push to main branch triggers deployment
git push origin main

# Or create a version tag
git tag v1.0.0
git push origin v1.0.0
```

See [CI/CD](#cicd) section for configuration details.

### Manual Deployment

#### Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build backend

# Tag for registry (manual)
docker tag collab-task-hub-backend:latest registry.example.com/collab-task-hub-backend:v1.0.0
docker push registry.example.com/collab-task-hub-backend:v1.0.0
```

### Production Environment

Use the provided `.env.prod.example` as a template:

```bash
cp .env.prod.example .env.production
# Edit .env.production with your production values
```

See [Environment Variables](#environment-variables) section for all configuration options.

### Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Production features**:
- Nginx reverse proxy with SSL termination
- Rate limiting (10 req/s API, 30 req/s general)
- Gzip compression
- Health checks for all services
- Resource limits (CPU/memory)
- PostgreSQL optimization (shared_buffers, effective_cache_size)
- Zero-downtime updates with rolling restart
- Backup volumes mounted at `/backups`

## Testing

### Backend Tests

#### E2E Tests

**Quick Start**:
```bash
cd backend
npm run test:e2e            # Runs all 111 E2E tests
```

The E2E test suite provides comprehensive integration testing of all backend endpoints and business logic with **111 automated tests** covering 7 test suites.

**Test Coverage**:

1. **Authentication Tests** (`test/auth.e2e-spec.ts`) - **13 tests**
   - User registration with validation (email format, password requirements)
   - Login with credentials (success/failure cases)
   - JWT token generation and validation
   - Protected endpoint access with JWT
   - Duplicate email prevention
   - Invalid credentials handling
   - Token extraction and user identification

2. **User Management Tests** (`test/users.e2e-spec.ts`) - **11 tests**
   - GET /users - List all users (authenticated)
   - GET /users/me - Get current user profile
   - PATCH /users/me - Update user profile (name, email)
   - Password change functionality
   - Duplicate email detection on update
   - Authentication requirement validation
   - Profile field validation

3. **Project Tests** (`test/projects.e2e-spec.ts`) - **25 tests**
   - Create project with automatic admin role assignment
   - List user's projects (filtered by membership)
   - Get project details with members and creator
   - Update project title and description
   - Delete project (admin only, with task check)
   - Role-based access control (admin/member/viewer)
   - Project not found handling
   - Unauthorized access prevention
   - Task cascade prevention (can't delete project with tasks)

4. **Task Tests** (`test/tasks.e2e-spec.ts`) - **43 tests**
   - Create tasks with all fields (title, description, status, priority, assignee)
   - List all tasks and filter by project
   - Get individual task details
   - Update task fields independently:
     - Title updates (preserves other fields)
     - Description updates
     - Status transitions (backlog → in_progress → review → done)
     - Priority changes (low/medium/high)
     - Assignee assignment and reassignment
   - Update multiple fields simultaneously
   - Delete tasks
   - Field validation (required fields, enum values)
   - Authentication requirement
   - Task not found handling
   - Assignee relation loading

5. **Project Members Tests** (`test/members.e2e-spec.ts`) - **19 tests**
   - Add members with roles (admin/member/viewer)
   - Remove members from projects
   - Update member roles
   - Get user's role in project
   - Role-based permissions:
     - Only admins can add/remove/update members
     - Non-admins get 403 Forbidden
     - Non-members get 403 Forbidden
   - Duplicate member prevention
   - Last admin protection (can't remove last admin)
   - Member not found handling
   - Project not found handling (404 vs 403 distinction)
   - Unauthenticated access prevention

6. **Chat Tests** (`test/chat.e2e-spec.ts`) - **10 tests**
   - GET /chat/projects/:projectId/messages - Message retrieval
   - Pagination support (limit, offset)
   - Default pagination (20 messages)
   - Custom page sizes
   - PATCH /chat/messages/:messageId - Edit message
   - DELETE /chat/messages/:messageId - Delete message
   - Authentication requirement
   - Project access validation
   - Message not found handling

7. **Health Check Tests** (`test/app.e2e-spec.ts`) - **3 tests**
   - GET /health - Service health endpoint
   - Returns status, timestamp, uptime, environment
   - No authentication required
   - JSON response format validation

**Database Setup**:

The test suite uses a dedicated PostgreSQL test database (`collab_test`) that is automatically managed:

**Automatic Setup** (PowerShell):
```bash
# Runs automatically before each test execution via pretest:e2e hook
backend/setup-test-db.ps1
```

**Manual Setup** (if needed):
```powershell
# Windows
cd backend
powershell -ExecutionPolicy Bypass -File ./setup-test-db.ps1

# Linux/macOS
chmod +x setup-test-db.sh
./setup-test-db.sh
```

**Database Operations**:
- Checks if `collab_test` database exists
- Terminates all active connections if it exists
- Drops and recreates the database for clean slate
- Ensures PostgreSQL is running and accessible
- Reports success/failure with clear error messages

**Test Configuration** (`test/jest-e2e.json`):
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "maxWorkers": 1  // Sequential execution to prevent database conflicts
}
```

**Sequential Execution**:
Tests run with `--runInBand` flag to prevent parallel execution issues:
- Avoids database connection conflicts
- Prevents TypeORM enum type race conditions
- Ensures predictable test order
- Enables shared database state when needed

**Test Utilities** (`test/test-utils.ts`):

Provides helper functions for consistent test setup:

```typescript
// Create test app with all modules
async function createTestApp(): Promise<INestApplication>

// Initialize database with all entities
// Modules included: Auth, Users, Projects, Tasks, Chat
// TypeORM auto-sync enabled for test database
// Logging disabled for clean test output
```

**Features**:
- Clean database state for each test suite
- All modules properly imported (Auth, Users, Projects, Tasks, Chat)
- TypeORM synchronize enabled (drops/recreates schema)
- Validation pipes configured (same as production)
- CORS disabled for testing
- Logging disabled for cleaner output

**Test Data Management**:

Each test suite:
- Creates fresh users with unique emails
- Generates JWT tokens for authentication
- Creates isolated projects and tasks
- Cleans up via database drop after suite completion
- No shared state between test files

**Running Tests**:

```bash
cd backend

# Run all E2E tests (111 tests)
npm run test:e2e

# Run specific test file
npx jest --config ./test/jest-e2e.json test/auth.e2e-spec.ts

# Run with verbose output
npx jest --config ./test/jest-e2e.json --verbose

# Run in watch mode
npx jest --config ./test/jest-e2e.json --watch
```

**Test Output**:
```
Test Suites: 7 passed, 7 total
Tests:       111 passed, 111 total
Snapshots:   0 total
Time:        6-7 seconds
```

**What Gets Tested**:

- ✅ **Authentication Flow**: Registration → Login → JWT → Protected Routes
- ✅ **CRUD Operations**: Create, Read, Update, Delete for all entities
- ✅ **Data Validation**: DTOs, required fields, enum values, email format
- ✅ **Authorization**: Role-based access control (admin/member/viewer)
- ✅ **Error Handling**: 400, 401, 403, 404 status codes with proper messages
- ✅ **Database Relations**: Foreign keys, cascade deletes, eager loading
- ✅ **Business Logic**: Last admin protection, task cascade prevention
- ✅ **API Contracts**: Request/response formats, status codes, headers
- ✅ **Edge Cases**: Duplicate emails, non-existent resources, unauthorized access
- ✅ **Data Integrity**: Field preservation on partial updates, relation loading

**Test Assertions**:

Tests verify:
- HTTP status codes (200, 201, 204, 400, 401, 403, 404)
- Response body structure (id, timestamps, relations)
- Response data correctness (values match inputs)
- Error messages and formats
- JWT token presence and format
- Proper relation loading (user, project, assignee)
- Enum value validation (status, priority, role)

#### Unit Tests

**Quick Start**:
```bash
cd backend
npm test                    # Run all unit tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage report
```

Currently minimal unit test coverage. E2E tests provide comprehensive integration testing.

#### Automated API Tests

Beyond E2E tests, additional testing tools are available:

**PowerShell Script** (`test-api.ps1`):
- Comprehensive automated test suite for all REST API endpoints
- 56 automated tests covering 25 endpoints
- Automatic test user generation with timestamps
- Color-coded pass/fail output
- Automatic cleanup after execution

```powershell
cd backend
.\test-api.ps1
```

**Postman Collection**:
- `Collab-Task-Hub-API.postman_collection.json` - All API endpoints
- `Collab-Task-Hub-Local.postman_environment.json` - Environment variables
- 56 test assertions built-in
- Pre-request scripts for data generation
- Import into Postman for manual/automated testing

See [API Testing Tools](#api-testing-tools) for detailed usage.

### Frontend Tests

Currently no automated tests. Recommended setup:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## CI/CD

### GitHub Actions

Automated CI/CD pipelines using GitHub Actions:

#### CI Pipeline (`.github/workflows/ci.yml`)

Runs on all pull requests and pushes to `main`/`dev` branches:

**Jobs**:
1. **Lint Backend** - ESLint validation for backend code
2. **Lint Frontend** - ESLint validation for frontend code
3. **Test Backend** - Unit tests and E2E tests with PostgreSQL service
4. **Test Frontend** - Build validation (no tests yet)
5. **Build Docker Images** - Validates Docker builds without pushing
6. **Status Check** - Final validation of all jobs

**Features**:
- PostgreSQL service container for E2E tests
- Node.js 20 with npm caching
- Docker Buildx with GitHub Actions cache
- Parallel job execution for faster CI

#### CD Pipeline (`.github/workflows/cd.yml`)

Runs on pushes to `main` and version tags (`v*`):

**Jobs**:
1. **Build and Push** - Builds and pushes Docker images to registry
   - Tags: `latest`, `main`, `v1.2.3`, `v1.2`, `main-<sha>`
   - Metadata extraction with semantic versioning
   - Multi-platform support ready
2. **Deploy** - Deploys to production (configured for `main` branch)
   - Requires GitHub environment "production"
   - Manual approval gates supported

**Required Secrets**:
- `DOCKER_REGISTRY` - Docker registry URL
- `DOCKER_USERNAME` - Registry username
- `DOCKER_PASSWORD` - Registry password/token
- `NEXT_PUBLIC_API_URL` - Production API URL

**Triggering Deployment**:
```bash
# Deploy from main branch
git push origin main

# Create version tag for release
git tag v1.0.0
git push origin v1.0.0
```

### Manual CI Commands

Run CI checks locally before pushing:

```bash
# Backend
cd backend
npm run lint
npm run test
npm run test:e2e

# Frontend
cd frontend
npm run lint
npm run build

# Docker builds
docker-compose build
```

## Scripts & Utilities

### Root Directory

**`test-chat.js`** - Socket.IO connection test client
```bash
node test-chat.js
```
Tests WebSocket connectivity and real-time messaging functionality.

**`start-dev.sh`** - Quick development startup script (Linux/macOS)
```bash
./start-dev.sh
```
Starts all services using Docker Compose with proper environment setup.

### Backend Directory (`backend/`)

**`test-api.ps1`** - Comprehensive automated API test suite (PowerShell)
```powershell
cd backend
.\test-api.ps1
```
- Runs 56 automated tests covering all 25 REST endpoints
- Automatically generates unique test users with timestamps
- Tests authentication, users, projects, tasks, and chat endpoints
- Color-coded pass/fail output for easy debugging
- Cleans up test data automatically after completion

**`Collab-Task-Hub-API.postman_collection.json`** - Postman collection
- Import into Postman for manual/automated API testing
- Includes all REST endpoints with pre-configured requests
- 56 test assertions built-in
- Requires `Collab-Task-Hub-Local.postman_environment.json` environment file

**`Collab-Task-Hub-Local.postman_environment.json`** - Postman environment
- Environment variables for local development
- Auto-populated by collection's pre-request scripts
- Stores tokens, user IDs, and test data between requests

See [API Testing Tools](#api-testing-tools) for detailed Postman usage instructions.

## Configuration Files

### Backend

- **package.json** - Dependencies, scripts, and npm overrides for security
- **nest-cli.json** - Nest CLI configuration
- **tsconfig.json** - TypeScript compiler options (strict mode)
- **tsconfig.build.json** - Build-specific TS config
- **eslint.config.mjs** - ESLint rules (TypeScript + Prettier)
- **Dockerfile** - Multi-stage production build
- **Dockerfile.dev** - Development build with volume mounts

### Frontend

- **package.json** - Dependencies and build scripts
- **next.config.ts** - Next.js configuration
- **tsconfig.json** - TypeScript config (strict, path aliases)
- **eslint.config.mjs** - ESLint + Next.js rules
- **postcss.config.mjs** - PostCSS + Tailwind
- **Dockerfile** - Multi-stage production build
- **Dockerfile.dev** - Development build with hot reload

### Infrastructure

- **docker-compose.yml** - Development environment
- **docker-compose.prod.yml** - Production environment with:
  - Health checks
  - Resource limits
  - PostgreSQL tuning
  - Nginx reverse proxy
  - SSL support
  - Auto-restart policies
- **nginx/nginx.conf** - Nginx configuration:
  - Reverse proxy (frontend/backend)
  - SSL termination
  - Rate limiting
  - Gzip compression
  - WebSocket upgrade headers
  - Static file serving

## API Documentation

**Swagger UI**: http://localhost:4000/api (dev only)

Auto-generated from NestJS decorators:
- `@ApiTags()` - Endpoint grouping
- `@ApiOperation()` - Endpoint description
- `@ApiResponse()` - Response schemas
- `@ApiBearerAuth()` - JWT requirement

### API Testing Tools

#### PowerShell Script (Automated)

```powershell
cd backend
.\test-api.ps1
```

Runs 56 automated tests covering all 25 REST endpoints:
- Automatically generates unique test users
- Tests authentication, users, projects, tasks, chat
- Color-coded pass/fail output
- Cleans up test data after completion

#### Postman Collection (Manual/Automated)

**Setup**:
1. Import both files into Postman:
   - `backend/Collab-Task-Hub-API.postman_collection.json` (collection)
   - `backend/Collab-Task-Hub-Local.postman_environment.json` (environment)
2. Select "Collab Task Hub - Local" environment (top-right dropdown)
3. Ensure backend is running on http://localhost:4000

**Usage**:
- **Run entire collection**: Click "Run collection" to execute all tests in sequence
- **Run individual requests**: Select any request and click Send
- **View variables**: Click eye icon 👁️ to see generated emails, tokens, IDs
- **Customize test data**: Edit collection variables (baseUrl, testUserName, projectTitle, etc.)

**Features**:
- Pre-request scripts automatically generate unique emails on each run
- Test scripts validate responses and extract IDs for subsequent requests
- Environment variables persist tokens and IDs between requests
- 56 test assertions covering all endpoints

**Collection Variables** (customize in Variables tab):
- `baseUrl` - API base URL (default: http://localhost:4000)
- `testEmailPrefix` - Email prefix for test users (default: apitest)
- `emailDomain` - Email domain (default: example.com)
- `testPassword` - Test user password (default: TestPassword123!)
- Project, task, and user names for testing

**Troubleshooting**:
- If Login fails with "Invalid email", run "Register User" first
- Check Postman Console (View → Show Postman Console) to see actual values
- Verify "Collab Task Hub - Local" environment is selected

## Database Migrations

Currently using TypeORM `synchronize: true` (dev only).

For production, generate migrations:

```bash
cd backend

# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

**Important**: Disable `synchronize` in production (`app.module.ts` line 29).

## Security Considerations

### Implemented

- JWT token authentication (configurable expiry)
- Bcrypt password hashing (cost factor: 10)
- CORS whitelist configuration
- DTO validation with whitelisting (`forbidNonWhitelisted`)
- SQL injection prevention (TypeORM parameterized queries)
- Rate limiting (Nginx)
- HTTPS ready (Nginx SSL config)
- **Dependency security**: npm overrides to patch vulnerable nested dependencies
- **Regular updates**: All dependencies kept at latest stable versions

### Dependency Management

**Keeping Dependencies Updated**:
```bash
# Check for outdated packages
npm outdated

# Update to latest versions (recommended approach)
npm install -g npm-check-updates
ncu -u
npm install

# Audit for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

**Security Overrides** (backend/package.json):
```json
"overrides": {
  "lodash": "^4.17.23"
}
```
This override ensures all nested dependencies use the patched lodash version, preventing prototype pollution vulnerabilities. Note: `lodash` is also installed as a direct dependency (required by `@nestjs/swagger`).

### TODO

- Refresh token rotation
- Password complexity requirements
- Account lockout after failed attempts
- CSRF protection for state-changing operations
- Input sanitization for XSS prevention
- Helmet.js for security headers
- Rate limiting on auth endpoints (backend level)
- WebSocket connection limits per user

## Troubleshooting

### Common Issues

**Database connection failed**:
```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Verify environment variables (PowerShell/Bash)
echo $DB_HOST $DB_PORT $DB_USERNAME    # Bash/Linux
$env:DB_HOST; $env:DB_PORT; $env:DB_USERNAME    # PowerShell
```

**Port already in use**:
```bash
# Find process using port
netstat -ano | findstr :4000    # Windows
lsof -i :4000                   # macOS/Linux

# Kill process or change port in .env
```

**WebSocket connection refused**:
- Check CORS origins in `backend/src/main.ts`
- Verify `NEXT_PUBLIC_WS_URL` matches backend URL
- Check browser console for connection errors

**Frontend can't reach backend**:
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env`
- Check backend is running: `curl http://localhost:4000/health`
- Review Docker network configuration

**TypeORM synchronization errors**:
- Drop database and recreate (dev only)
- Check entity decorators for syntax errors
- Review `app.module.ts` TypeORM config

## Performance Optimization

### Backend

- Connection pooling (TypeORM default: 10)
- Eager loading for frequently accessed relations
- Database indexes on foreign keys (auto-created by TypeORM)
- WebSocket connection keep-alive

### Frontend

- Next.js automatic code splitting
- Image optimization (use `next/image`)
- API response caching (Zustand stores)
- Debounced typing indicators
- Lazy loading for modals

### Database

Production PostgreSQL tuning (docker-compose.prod.yml):
- `shared_buffers=256MB`
- `effective_cache_size=1GB`
- `max_connections=200`
- `random_page_cost=1.1` (SSD optimized)

## Monitoring

### Health Checks

- Backend: `GET /health` (returns status, timestamp, uptime, environment)
- PostgreSQL: `pg_isready` command
- Nginx: HTTP 200 on all upstreams

### Logging

**Backend** (NestJS built-in logger):
```typescript
// Levels: log, error, warn, debug, verbose
// Set LOG_LEVEL in .env
```

**Frontend** (console):
```typescript
// Use console.error for errors
// Production: integrate Sentry/LogRocket
```

**Nginx**:
- Access log: `/var/log/nginx/access.log`
- Error log: `/var/log/nginx/error.log`

## Support & Help

### Getting Help

- **Documentation**: Start with this README and the [API Documentation](#api-documentation)
- **Troubleshooting**: See [Troubleshooting](#troubleshooting) section for common issues
- **API Reference**: Visit Swagger UI at http://localhost:4000/api (dev mode)
- **Testing**: Use [API Testing Tools](#api-testing-tools) to verify endpoints

### Reporting Issues

When reporting issues, please include:
- Environment details (OS, Docker version, Node version)
- Steps to reproduce the problem
- Expected vs actual behavior
- Relevant logs from `docker-compose logs` or terminal output
- Screenshots if applicable

### Development Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **TypeORM Docs**: https://typeorm.io/
- **Socket.IO Docs**: https://socket.io/docs/
- **Docker Compose**: https://docs.docker.com/compose/

## License

UNLICENSED (private project)

## Contributing

### Development Workflow

1. **Create feature branch**: 
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and test**:
   ```bash
   # Backend
   cd backend
   npm run lint
   npm run test
   npm run test:e2e
   
   # Frontend
   cd frontend
   npm run lint
   npm run build
   ```

3. **Check for dependency updates** (optional):
   ```bash
   # Install npm-check-updates if not already installed
   npm install -g npm-check-updates
   
   # Check for updates
   ncu
   
   # Update if needed
   ncu -u
   npm install
   npm audit
   ```

4. **Format code**:
   ```bash
   npm run format  # Both directories
   ```

5. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in authentication"
   git commit -m "docs: update API documentation"
   git commit -m "chore: update dependencies"
   ```
   
   Conventional commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

6. **Push and create PR**:
   ```bash
   git push origin feature/new-feature
   ```
   - Create pull request on GitHub
   - CI pipeline will automatically run all tests
   - Wait for green checkmarks before merging
   - Request review from team members

7. **Merge to main**:
   - Squash and merge for clean history
   - CD pipeline automatically deploys to production

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Must pass with no errors
- **Prettier**: Auto-format before commit
- **Tests**: Add tests for new features
- **Documentation**: Update README for new features/APIs

## Roadmap

- [ ] Notifications system (push/email)
- [ ] File attachments for tasks
- [ ] Activity logs/audit trail
- [ ] Advanced task filtering/search
- [ ] Calendar view for tasks
- [ ] User avatars with upload
- [ ] Dark mode theme
- [ ] Mobile responsive improvements
- [ ] Progressive Web App (PWA)
- [ ] Real-time task updates (WebSocket)
- [ ] Task time tracking
- [ ] Project templates
- [ ] Export project data (JSON/CSV)
- [ ] Integration with third-party tools (Slack, etc.)
