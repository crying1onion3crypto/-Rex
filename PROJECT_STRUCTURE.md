# Contract AI SaaS - Project Structure

## Overview

This document outlines the complete project structure for the AI-Powered Contract Review SaaS application.

## Root Directory Structure

```
contract-ai-saas/
├── README.md                    # Main project documentation
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Docker Compose configuration
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API routes
│   │   │   └── auth/            # NextAuth.js routes
│   │   ├── auth/                # Authentication pages
│   │   ├── contracts/            # Contract management pages
│   │   ├── analysis/             # Analysis pages
│   │   ├── settings/             # Settings pages
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   ├── contracts/           # Contract-related components
│   │   ├── analysis/            # Analysis-related components
│   │   └── common/              # Common/shared components
│   ├── lib/                     # Utilities and libraries
│   │   ├── utils.ts             # Utility functions
│   │   ├── constants.ts         # Application constants
│   │   └── api-client.ts        # API client configuration
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts          # Authentication hook
│   │   ├── use-contracts.ts     # Contracts hook
│   │   └── use-toast.ts         # Toast notifications hook
│   ├── providers/               # Context providers
│   │   ├── theme-provider.tsx   # Theme provider
│   │   ├── auth-provider.tsx    # Auth provider
│   │   ├── query-provider.tsx   # React Query provider
│   │   └── toast-provider.tsx   # Toast provider
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # Type definitions
│   ├── public/                  # Static assets
│   │   ├── images/              # Images
│   │   └── icons/               # Icons
│   ├── package.json             # Frontend dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   ├── next.config.js           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── .eslintrc.json           # ESLint configuration
│
└── backend/                     # FastAPI Backend Application
    ├── app/                     # Main application
    │   ├── __init__.py          # Package initialization
    │   ├── main.py              # FastAPI application entry
    │   ├── config/              # Configuration
    │   │   ├── __init__.py
    │   │   └── settings.py       # Application settings
    │   ├── api/                 # API routes
    │   │   ├── __init__.py
    │   │   └── v1/               # API v1
    │   │       ├── __init__.py
    │   │       └── endpoints/    # API endpoints
    │   │           ├── __init__.py
    │   │           ├── auth.py       # Authentication endpoints
    │   │           ├── users.py      # User endpoints
    │   │           ├── contracts.py  # Contract endpoints
    │   │           ├── analysis.py   # Analysis endpoints
    │   │           ├── subscription.py # Subscription endpoints
    │   │           ├── folders.py    # Folder endpoints
    │   │           ├── tags.py       # Tag endpoints
    │   │           ├── settings.py   # Settings endpoints
    │   │           └── dashboard.py  # Dashboard endpoints
    │   ├── core/                 # Core functionality
    │   │   ├── __init__.py
    │   │   ├── security/          # Security utilities
    │   │   │   ├── __init__.py
    │   │   │   ├── password.py    # Password hashing
    │   │   │   ├── jwt.py         # JWT token management
    │   │   │   └── auth.py        # Authentication utilities
    │   │   └── dependencies/      # FastAPI dependencies
    │   │       ├── __init__.py
    │   │       ├── database.py    # Database dependencies
    │   │       ├── rate_limiter.py # Rate limiting
    │   │       └── subscription.py # Subscription checking
    │   ├── models/               # Pydantic models
    │   │   ├── __init__.py
    │   │   ├── user.py           # User models
    │   │   ├── contract.py       # Contract models
    │   │   ├── analysis.py       # Analysis models
    │   │   ├── subscription.py   # Subscription models
    │   │   ├── folder.py         # Folder models
    │   │   ├── tag.py            # Tag models
    │   │   └── api_key.py        # API Key models
    │   ├── services/             # Business logic services
    │   │   ├── __init__.py
    │   │   ├── user/             # User services
    │   │   │   ├── __init__.py
    │   │   │   ├── user_service.py
    │   │   │   └── api_key_service.py
    │   │   ├── contract/          # Contract services
    │   │   │   ├── __init__.py
    │   │   │   └── contract_service.py
    │   │   ├── analysis/          # Analysis services
    │   │   │   ├── __init__.py
    │   │   │   └── analysis_service.py
    │   │   ├── subscription/      # Subscription services
    │   │   │   ├── __init__.py
    │   │   │   └── subscription_service.py
    │   │   ├── storage/           # Storage services
    │   │   │   ├── __init__.py
    │   │   │   └── storage_service.py
    │   │   └── ai/               # AI services
    │   │       ├── __init__.py
    │   │       └── ai_service.py
    │   ├── tasks/                # Celery tasks
    │   │   ├── __init__.py
    │   │   ├── celery_app.py     # Celery configuration
    │   │   └── contract_analysis/
    │   │       ├── __init__.py
    │   │       └── contract_analysis_tasks.py
    │   └── utils/                # Utilities
    │       └── __init__.py
    ├── prisma/                  # Prisma ORM
    │   ├── schema.prisma        # Database schema
    │   └── migrations/          # Database migrations
    ├── uploads/                # File uploads storage
    ├── requirements.txt         # Python dependencies
    ├── Dockerfile              # Backend Dockerfile
    └── tests/                  # Tests
        └── __init__.py
```

## Key Features Implemented

### Backend Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Email/password login
   - Google OAuth integration
   - Secure password hashing with bcrypt
   - Token refresh mechanism

2. **User Management**
   - User registration and profile management
   - API key management for AI providers
   - Secure session management

3. **Contract Management**
   - File upload (PDF, DOCX, TXT)
   - Contract CRUD operations
   - Folder and tag organization
   - Version history tracking
   - Status tracking (uploading, processing, complete, failed)

4. **AI Analysis**
   - DeepSeek API integration (primary)
   - OpenAI fallback support
   - Text extraction from PDFs and DOCX
   - Document chunking for LLM processing
   - Risk flag detection
   - Clause extraction
   - Plain-English summaries
   - Missing clause detection
   - Risk scoring and visualization

5. **Subscription Management**
   - Free tier (5 contracts/month)
   - Pro tier ($249/month for 50 contracts)
   - Stripe integration for payments
   - Usage tracking
   - Subscription status management

6. **Async Processing**
   - Celery task queue
   - Background contract analysis
   - Task status tracking
   - Error handling and retries

7. **API Endpoints**
   - RESTful API design
   - Comprehensive error handling
   - Rate limiting
   - CORS support
   - Request validation

### Frontend Features

1. **UI Framework**
   - Next.js 14 with App Router
   - TypeScript for type safety
   - Tailwind CSS for styling
   - shadcn/ui for component library
   - Dark mode support
   - Responsive design

2. **Authentication**
   - NextAuth.js integration
   - Session management
   - Protected routes
   - Login/Register pages

3. **Dashboard**
   - Contract overview
   - Risk score visualization
   - Recent activity feed
   - Quick statistics
   - Usage tracking

4. **Contract Management**
   - Drag & drop file upload
   - Contract list with filtering
   - Folder organization
   - Tag management
   - Search functionality

5. **Analysis Viewer**
   - Risk flag display
   - Clause extraction view
   - Summary display
   - Missing clause detection
   - Interactive risk visualization

6. **Settings**
   - Profile management
   - API key management
   - Billing portal
   - Theme preferences

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **AI Integration**: DeepSeek API + OpenAI fallback
- **File Processing**: PyPDF2, python-docx
- **Async Tasks**: Celery + Redis
- **Payments**: Stripe

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx (optional for production)
- **Storage**: Local storage (S3-compatible ready)

## Environment Variables

### Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_client_secret
```

### Backend
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/contract_ai?schema=public
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
UPLOAD_DIR=./uploads
```

## Running the Application

### Development (Docker)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Local Development

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
prisma generate
prisma migrate dev
uvicorn app.main:app --reload --port 8000
```

### Celery Worker
```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

## API Documentation

The backend API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## Database Schema

The database schema is defined in `backend/prisma/schema.prisma` and includes:
- Users
- API Keys
- Subscriptions
- Plans
- Payments
- Invoices
- Contracts
- Contract Versions
- Folders
- Tags
- Contract Tags
- Contract Analysis
- Audit Logs
- Notifications
- Celery Tasks

## Next Steps

1. **Complete Frontend Pages**: Finish remaining pages (login, register, contract upload, etc.)
2. **Add More shadcn/ui Components**: Implement remaining UI components
3. **Enhance Error Handling**: Add comprehensive error handling and user feedback
4. **Add Tests**: Write unit and integration tests
5. **Optimize Performance**: Implement caching, lazy loading, etc.
6. **Add Monitoring**: Integrate logging and monitoring tools
7. **Security Audit**: Review and enhance security measures
8. **Documentation**: Complete API and user documentation

## File Count Summary

- **Backend**: ~50+ files
- **Frontend**: ~100+ files (when complete)
- **Configuration**: ~10 files
- **Total**: ~160+ files

This project provides a solid foundation for an AI-Powered Contract Review SaaS application with all the core features implemented and ready for further customization and enhancement.
