# Collab Task Hub

A full-stack collaborative project management application with real-time chat, task tracking, and team coordination capabilities. Built with modern web technologies and containerized for seamless deployment.

## Architecture

### Technology Stack

**Backend**

- NestJS (Node.js framework)
- TypeORM with PostgreSQL
- Socket.IO for real-time communication
- JWT authentication
- Swagger/OpenAPI documentation
- Mailjet email integration

**Frontend**

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Zustand state management
- Socket.IO client
- React Hook Form with Zod validation

**Infrastructure**

- Docker & Docker Compose
- PostgreSQL 18 (Alpine)
- Nginx reverse proxy
- Multi-stage builds for optimization

## Features

### Core Functionality

**Project Management**

- Create and manage projects
- Role-based access control (Admin, Member, Viewer)
- Project member management
- Project listing and filtering

**Task Management**

- Create, update, and delete tasks
- Task assignment to team members
- Status tracking (Backlog, In Progress, In Review, Done)
- Priority levels (Low, Medium, High, Critical)
- Project-specific task organization

**Real-Time Chat**

- Project-based chat rooms
- WebSocket-powered instant messaging
- Message editing and deletion
- Typing indicators
- Message history with pagination

**Authentication & User Management**

- User registration and login
- JWT-based authentication
- Password reset via email
- User profile management
- User search functionality

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Node.js 20+ (for local development without Docker)
- PostgreSQL 18+ (for local development without Docker)

## Quick Start

### Development Environment

1. Clone the repository:

```bash
git clone <repository-url>
cd Collab-Task-Hub
```

2. Create environment configuration:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=collab_task_hub

# Security (change for production)
JWT_SECRET=your_secure_jwt_secret_min_32_characters

# Email Service (Mailjet)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
MAILJET_SENDER_EMAIL=your-email@example.com

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

4. Start the development environment:

```bash
docker-compose up -d
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api

### Production Deployment

1. Configure production environment variables

2. Build and deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Production configuration includes:

- Optimized PostgreSQL settings
- Resource limits
- Health checks with proper intervals
- Production-grade security settings
- SSL/TLS support via Nginx

## Development

### Project Structure

```
Collab-Task-Hub/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── projects/       # Project management
│   │   ├── tasks/          # Task management
│   │   ├── chat/           # Real-time chat
│   │   ├── email/          # Email service
│   │   └── migrations/     # Database migrations
│   ├── test/               # E2E tests
│   └── Dockerfile
├── frontend/               # Next.js application
│   ├── app/                # App router pages
│   ├── features/           # Feature modules
│   ├── shared/             # Shared utilities
│   ├── widgets/            # Reusable widgets
│   └── Dockerfile
├── nginx/                  # Nginx configuration
├── backups/               # Database backups
└── docker-compose.yml     # Development orchestration
```

### Running Tests

**Backend Tests**

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Frontend Tests**

```bash
cd frontend
npm run test
```

### Database Management

**Reset and rebuild database:**

```powershell
# Windows
.\docker-reset-and-rebuild.ps1

# Linux/Mac
bash docker-reset-and-rebuild.sh
```

**Restart services:**

```powershell
# Windows
.\docker-restart.ps1

# Linux/Mac
bash docker-restart.sh
```

**Manual backup:**

```bash
docker exec collab-task-hub-db pg_dump -U postgres collab_task_hub > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### API Development

**Swagger Documentation**

Interactive API documentation is available at `http://localhost:4000/api` when running the backend.

**Authentication**

All protected endpoints require a JWT Bearer token:

```bash
Authorization: Bearer <your_jwt_token>
```

Obtain a token via `/auth/login` or `/auth/register` endpoints.

**WebSocket Connection**

Connect to chat WebSocket at `ws://localhost:4000/chat`:

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:4000/chat", {
  auth: { token: "your_jwt_token" },
});
```

### Code Quality

**Linting**

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

**Formatting**

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

## Environment Variables

### Backend Variables

| Variable               | Description             | Required | Default     |
| ---------------------- | ----------------------- | -------- | ----------- |
| `DB_HOST`              | PostgreSQL host         | Yes      | postgres    |
| `DB_PORT`              | PostgreSQL port         | Yes      | 5432        |
| `DB_USERNAME`          | Database username       | Yes      | -           |
| `DB_PASSWORD`          | Database password       | Yes      | -           |
| `DB_DATABASE`          | Database name           | Yes      | -           |
| `JWT_SECRET`           | JWT signing key         | Yes      | -           |
| `PORT`                 | Backend server port     | No       | 4000        |
| `NODE_ENV`             | Environment mode        | No       | development |
| `MAILJET_API_KEY`      | Mailjet API key         | Yes\*    | -           |
| `MAILJET_SECRET_KEY`   | Mailjet secret key      | Yes\*    | -           |
| `MAILJET_SENDER_EMAIL` | Sender email address    | Yes\*    | -           |
| `FRONTEND_URL`         | Frontend URL for CORS   | Yes      | -           |
| `CORS_ORIGIN`          | Additional CORS origins | No       | -           |

\*Required for password recovery feature

### Frontend Variables

| Variable              | Description      | Required | Default     |
| --------------------- | ---------------- | -------- | ----------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL  | Yes      | -           |
| `NEXT_PUBLIC_WS_URL`  | WebSocket URL    | Yes      | -           |
| `NODE_ENV`            | Environment mode | No       | development |

## Troubleshooting

### Common Issues

**Port conflicts**

```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432
```

**Database connection issues**

```bash
# Check PostgreSQL logs
docker logs collab-task-hub-db

# Verify database is healthy
docker exec collab-task-hub-db pg_isready -U postgres
```

**Frontend build errors**

```bash
# Clear Next.js cache
cd frontend
rm -rf .next node_modules
npm install
```

**Backend build errors**

```bash
# Clear NestJS cache
cd backend
rm -rf dist node_modules
npm install
```

### Docker Issues

**Reset Docker environment:**

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build -d
```

**View service logs:**

```bash
docker logs collab-task-hub-backend -f
docker logs collab-task-hub-frontend -f
docker logs collab-task-hub-db -f
```

## Security Considerations

### Production Checklist

- [ ] Change default `JWT_SECRET` to a strong random value (min 32 characters)
- [ ] Use strong database passwords
- [ ] Configure environment-specific CORS origins
- [ ] Disable TypeORM `synchronize` in production (use migrations)
- [ ] Set up SSL/TLS certificates for HTTPS
- [ ] Configure rate limiting on authentication endpoints
- [ ] Enable database connection pooling
- [ ] Set up regular database backups
- [ ] Configure proper logging and monitoring
- [ ] Review and update dependency versions regularly
- [ ] Implement proper error handling without exposing sensitive data
- [ ] Use environment variables for all secrets (never commit to version control)

## Performance Optimization

### Database

- Ensure proper indexing on frequently queried fields
- Configure PostgreSQL connection pooling
- Use pagination for large result sets
- Implement query result caching for read-heavy operations

### Backend

- Enable compression middleware
- Implement response caching with Cache-Control headers
- Add request rate limiting
- Use DTOs for response mapping to reduce payload size

### Frontend

- Enable React Compiler for automatic memoization
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Configure proper caching strategies

## License

This project is licensed under the UNLICENSED license - see the LICENSE file for details.

## Contributing

Contributions are welcome. Please follow the existing code style and ensure all tests pass before submitting pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.
