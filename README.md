# Contract AI SaaS

An AI-Powered Contract Review SaaS for SMBs. Upload contracts, get AI-powered analysis, and manage your legal documents efficiently.

## Features

- **Document Management**: Upload, organize, and track contracts (PDF, DOCX, TXT)
- **AI Analysis**: DeepSeek-powered contract analysis with risk detection, clause extraction, and summaries
- **Subscription**: Free tier (5 contracts/month) and paid tier ($249/month for 50 contracts)
- **Dashboard**: Visual overview of contracts, risk scores, and activity
- **Multi-tenancy**: Secure user isolation and data management

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: DeepSeek API (primary) with OpenAI fallback
- **Storage**: Local storage for MVP (S3-compatible ready)
- **Auth**: NextAuth.js with email/password + Google OAuth
- **Payments**: Stripe
- **Queue**: Celery for async processing

## Project Structure

```
contract-ai-saas/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docker-compose.yml # Development environment
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- PostgreSQL 15+

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Run the development environment:

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

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
uvicorn main:app --reload --port 8000
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: Application URL

#### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `DEEPSEEK_API_KEY`: DeepSeek API key
- `OPENAI_API_KEY`: OpenAI API key (fallback)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `JWT_SECRET`: JWT secret for authentication
- `UPLOAD_DIR`: Local upload directory

#### Common
- `APP_ENV`: Development environment (development, production)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

### Contracts
- `POST /api/contracts/upload` - Upload contract
- `GET /api/contracts` - List contracts
- `GET /api/contracts/:id` - Get contract details
- `DELETE /api/contracts/:id` - Delete contract

### Analysis
- `POST /api/contracts/:id/analyze` - Trigger AI analysis
- `GET /api/contracts/:id/analysis` - Get analysis results

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/subscription` - Get subscription info

### Settings
- `POST /api/settings/api-keys` - Save API keys
- `GET /api/settings/api-keys` - Get API keys

## Subscription Plans

| Plan | Price | Contracts/Month | Features |
|------|-------|-----------------|----------|
| Free | $0 | 5 | Basic analysis, limited storage |
| Pro | $249 | 50 | Advanced analysis, priority processing, full features |

## AI Analysis Features

- **Risk Detection**: Identify liability, termination, and indemnification clauses
- **Clause Extraction**: Extract payment terms, duration, renewal clauses
- **Summary Generation**: Plain-English contract summaries
- **Missing Clauses**: Detect commonly missing important clauses
- **Risk Scoring**: Overall risk assessment with detailed breakdown

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js        │    │   FastAPI        │    │   PostgreSQL     │
│   Frontend       │◄──►│   Backend        │◄──►│   Database       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                          │                          │
         │                          ▼                          │
         │                    ┌─────────────────┐                  │
         │                    │   Celery         │                  │
         │                    │   Queue          │                  │
         │                    └─────────────────┘                  │
         │                          │                          │
         ▼                          ▼                          │
┌─────────────────┐    ┌─────────────────┐                      │
│   Browser        │    │   AI Services    │                      │
│   (User)         │    │   (DeepSeek)     │                      │
└─────────────────┘    └─────────────────┘                      │
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support and questions, please open an issue on GitHub.
