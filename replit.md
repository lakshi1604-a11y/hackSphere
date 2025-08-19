# HackSphere - Metaverse-Inspired Hackathon Platform

## Overview

HackSphere is a comprehensive hackathon management platform that combines traditional event organization with innovative features like AI-powered judging, swipe-based team formation, and real-time collaboration tools. The platform serves three primary user roles: participants who can join teams and submit projects, organizers who manage events and timelines, and judges who evaluate submissions using AI-assisted scoring systems.

The application provides a complete hackathon lifecycle from event creation and team formation to submission evaluation and live leaderboards, all wrapped in a modern, neon-themed interface designed to evoke a metaverse aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a React Single Page Application (SPA) using Vite as the build tool and bundler. The architecture follows a component-based design with shared state management through React Query for server state and React Context for authentication state.

**Component Structure**: The UI leverages Radix UI primitives for accessibility and Tailwind CSS for styling, implementing a dark-themed design system with neon accents and glassmorphism effects. Components are organized by feature domain (events, teams, submissions, judging) with reusable UI components in a dedicated directory.

**State Management**: Server state is managed through TanStack React Query, providing caching, background updates, and optimistic updates. Authentication state is handled via React Context with session-based persistence.

**Routing**: Client-side routing uses Wouter for lightweight navigation with protected routes that redirect unauthenticated users to the authentication page.

### Backend Architecture
The server implements a RESTful API using Express.js with a modular route-based architecture. The application follows a three-layer pattern: routes for HTTP handling, storage layer for data access, and database integration.

**Authentication System**: Passport.js with local strategy handles user authentication using scrypt for password hashing. Session management uses express-session with PostgreSQL session storage for persistence across server restarts.

**API Design**: RESTful endpoints organized by resource (events, teams, submissions, scores) with role-based access control middleware protecting administrative and judging functions.

**Business Logic**: Core hackathon functionality includes event timeline management, team formation with member management, submission handling with AI scoring integration, and real-time features like live announcements and leaderboards.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database interactions and schema management. The system supports both Neon Database and Azure Database for PostgreSQL with automatic detection and configuration.

**Database Schema**: Normalized relational design with separate tables for users, events, timelines, teams, team memberships, submissions, scores, and announcements. Foreign key relationships maintain referential integrity between related entities.

**Connection Management**: Dual database support with automatic detection:
- **Neon Database**: Serverless PostgreSQL with WebSocket support for real-time features
- **Azure Database**: PostgreSQL with SSL configuration, optimized connection pooling, and enterprise-grade security

**Migration Strategy**: Drizzle Kit handles schema migrations with version control, storing migration files for deployment consistency across both database providers.

### Authentication and Authorization
**Session-Based Authentication**: Express-session with PostgreSQL storage provides secure session management. Password security uses Node.js crypto module with scrypt hashing and random salt generation.

**Role-Based Access Control**: Three-tier permission system distinguishing participants (can join teams, submit projects), organizers (can create events, manage timelines), and judges (can score submissions). Middleware functions enforce role requirements on protected routes.

**Security Measures**: Password complexity requirements, timing-safe password comparison, secure session configuration, and CSRF protection through same-site cookie policies.

### Real-Time Features
**Live Updates**: React Query's polling mechanism provides near real-time updates for leaderboards, announcements, and submission feeds with configurable refresh intervals.

**WebSocket Support**: Database connection configured for WebSocket support to enable future real-time features like live collaboration and instant notifications.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling and built-in connection pooling
- **Azure Database for PostgreSQL**: Enterprise-grade managed PostgreSQL with SSL encryption and high availability
- **Drizzle ORM**: Type-safe database toolkit with schema management and query building
- **Automatic Database Detection**: Smart configuration system that detects and configures the appropriate database driver

### UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives for complex components like dialogs, dropdowns, and form controls
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens for the neon theme
- **Framer Motion**: Animation library for smooth transitions and interactive UI elements
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Development and Build Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **TypeScript**: Type safety across the entire application stack
- **Replit Integration**: Development environment plugins for cartographer and runtime error handling

### Authentication and Security
- **Passport.js**: Authentication middleware with local strategy implementation
- **Express Session**: Session management with PostgreSQL session store for persistence
- **Connect PG Simple**: PostgreSQL session store adapter for express-session

### State Management and Data Fetching
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **Zod**: Runtime type validation for API inputs and form data
- **React Hook Form**: Form state management with validation integration

### Utilities and Development
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Secure URL-friendly unique ID generation
- **Class Variance Authority**: Type-safe CSS class composition for component variants