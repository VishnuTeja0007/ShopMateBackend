# replit.md

## Overview

This is a full-stack web application called "ShopMate" - a product search and shopping assistance platform. The application uses a modern tech stack with Express.js backend, React frontend, and PostgreSQL database. It provides product search capabilities, wishlist management, order tracking, and daily deals functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful APIs with JSON responses
- **Validation**: Zod schema validation for request/response data
- **External Services**: SERP API for product search, web scraping with Puppeteer/Cheerio

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI with shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Database Strategy
- **ORM**: Drizzle with PostgreSQL dialect
- **Connection**: Neon Database serverless connection
- **Migrations**: Drizzle-kit for schema management
- **Session Storage**: PostgreSQL-based session storage

## Key Components

### Authentication System
- JWT token-based authentication
- Password hashing with bcrypt (12 salt rounds)
- Protected and optional authentication middleware
- User registration and login endpoints

### Product Search Service
- SERP API integration for product data
- Caching mechanism (1-hour cache for search results)
- Web scraping fallback for additional product details
- Multi-platform product comparison

### Data Services
- **Wishlist Service**: User wishlist management with target price tracking
- **Order Tracking Service**: Order status monitoring with web scraping
- **Daily Deals Service**: Automated deal scraping with 6-hour refresh cycle
- **Search History Service**: User and session-based search tracking

### Storage Layer
- In-memory storage implementation (ready for database migration)
- Comprehensive CRUD operations for all entities
- Proper data relationships and foreign key constraints

## Data Flow

### User Authentication Flow
1. User registers/logs in via API endpoints
2. JWT token generated and returned to client
3. Token stored and sent with subsequent requests
4. Middleware validates token and attaches user context

### Product Search Flow
1. Search request received with query parameters
2. Check cache for recent results (1-hour TTL)
3. If cache miss, call SERP API for fresh data
4. Process and normalize product data
5. Store results in cache and return to client

### Data Persistence Flow
1. User actions trigger API calls
2. Request validation using Zod schemas
3. Service layer processes business logic
4. Storage layer handles data persistence
5. Response formatted and returned to client

## External Dependencies

### Core Dependencies
- `@neondatabase/serverless`: PostgreSQL serverless connection
- `drizzle-orm`: Database ORM and query builder
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT authentication
- `axios`: HTTP client for external APIs
- `zod`: Schema validation

### Frontend Dependencies
- `@radix-ui/*`: Accessible UI components
- `@tanstack/react-query`: Server state management
- `tailwindcss`: Utility-first CSS framework
- `wouter`: Lightweight routing

### Development Dependencies
- `vite`: Build tool and dev server
- `tsx`: TypeScript execution
- `esbuild`: JavaScript bundler

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push`

### Production Configuration
- Environment variables for database URL and API keys
- Optimized builds with production settings
- Static file serving for frontend assets

### Development Workflow
- Hot reload enabled for both frontend and backend
- Concurrent development server setup
- TypeScript checking and validation
- Database schema synchronization

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `SERP_API_KEY`: API key for product search service
- `NODE_ENV`: Environment setting (development/production)

### Scaling Considerations
- Horizontal scaling capability built into architecture
- Stateless server design with JWT authentication
- Database connection pooling ready
- Caching strategy for performance optimization