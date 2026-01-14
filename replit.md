# InsureGuard - Insurance Agent Management Portal

## Overview

InsureGuard is a full-stack insurance agent management portal designed for tracking client policies, monitoring expirations, and managing premium volumes. The application follows a modern monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence.

The core functionality includes:
- Dashboard with real-time statistics (active policies, premium volume, expiring policies, active clients)
- Client management (CRUD operations with search and filtering)
- Policy management (CRUD operations with type-based categorization)
- Settings page for user preferences

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (supports light/dark modes)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage

### Data Layer
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` - contains Drizzle table definitions
- **Migrations**: Drizzle Kit with output to `./migrations` directory
- **Core Entities**:
  - `clients`: Customer records with contact information and status
  - `policies`: Insurance policies linked to clients with type, carrier, dates, and premium

### Shared Code Strategy
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schemas, Zod validation schemas, and TypeScript types
- `routes.ts`: API route definitions with path patterns, input schemas, and response schemas

### Path Aliases
- `@/*` → `./client/src/*` (frontend components and utilities)
- `@shared/*` → `./shared/*` (shared schemas and routes)
- `@assets/*` → `./attached_assets/*` (static assets)

### Build Process
- Development: `npm run dev` uses tsx to run the server with hot reloading
- Production: `npm run build` bundles server with esbuild and client with Vite
- Database: `npm run db:push` pushes schema changes using Drizzle Kit

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Component Libraries
- **Radix UI**: Accessible primitive components (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component collection using Radix primitives
- **Lucide React**: Icon library
- **Recharts**: Data visualization for dashboard charts

### Form and Validation
- **Zod**: Schema validation for API inputs and form data
- **React Hook Form**: Form state management
- **drizzle-zod**: Automatic Zod schema generation from Drizzle tables

### Date Handling
- **date-fns**: Date formatting and calculations

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Intelligent class merging