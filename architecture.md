# Wedding RSVP Application Architecture

## Overview

This is a full-stack web application built as a personal wedding website with RSVP functionality. It serves both public guests and provides an admin interface for managing content and guest data.

## Technology Stack

- **Frontend**: React 18 with TypeScript, Vite for bundling
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **File Storage**: Google Cloud Storage for uploaded files
- **Messaging**: Twilio for WhatsApp/SMS notifications
- **Authentication**: Replit OIDC for production, simple password auth for development
- **Deployment**: Vercel for serverless functions

## Project Structure

### Backend (`server/`)

- `index.ts`: Main server entry point with Express setup, middleware, and request logging
- `routes.ts`: All API endpoints (over 1000 lines), including auth, guest management, admin functions, file uploads, messaging
- `storage.ts`: Database operations interface and implementation using Drizzle ORM
- `replitAuth.ts`: OIDC authentication setup for Replit environment
- `simpleAuth.ts`: Basic username/password auth for development
- `static.ts`: Serves static files in production
- `vite.ts`: Vite integration for development
- `vercel.ts`: Serverless function handler for Vercel deployment
- `gcs.ts`: Google Cloud Storage file upload utilities
- `logger.ts`: Logging utilities

### Frontend (`client/`)

- `App.tsx`: Main app component with routing
- `main.tsx`: React app entry point
- Pages:
  - `home.tsx`: Landing page with wedding story, details, venue info
  - `rsvp.tsx`: Multi-step RSVP form (contact info, transport details, ID upload)
  - `login.tsx`: Admin login page
  - `photo-upload.tsx`: Guest photo upload page
  - Admin pages (`admin/`):
    - `dashboard.tsx`: Stats overview and guest list
    - `content.tsx`: CMS for story, venue, gallery content
    - `messages.tsx`: Message logs and bulk messaging
- Components: Reusable UI components using Radix UI primitives
- Hooks: Custom hooks like `useAuth.ts` for authentication state
- Lib: Utilities, query client setup

### Shared (`shared/`)

- `schema.ts`: Database schema definitions using Drizzle ORM with relations and Zod validation schemas

## Data Model

### Core Tables

- **admins**: Email/password authenticated users for admin access
- **guests**: RSVP data with two-step process (basic info + transport/details)
- **dashboard_content**: CMS content sections (story, venue, etc.)
- **gallery_images**: User-uploaded photos for gallery
- **message_templates**: Reusable message templates for notifications
- **message_logs**: Audit trail of sent messages

### Key Features

- Multi-step RSVP process with partial completion
- ID document uploads (Aadhar, PAN, Passport, etc.)
- Transport coordination (flights, trains, pickup/dropoff)
- WhatsApp/SMS notifications using Twilio
- Gallery photo uploads to Google Cloud Storage
- CMS for dynamic content management

## Application Flow

### Public User Journey

1. **Landing**: Hero section, story carousel, event details
2. **RSVP**: Step 1 - Contact info and RSVP status
3. **RSVP Continued**: Step 2 - ID upload, transport details, additional info
4. **Photo Upload**: Optional guest photo contributions
5. **Gallery**: View all uploaded photos

### Admin User Journey

1. **Login**: Authenticate via Replit OIDC or dev credentials
2. **Dashboard**: View stats (total guests, RSVP status, completion rates)
3. **Guest Management**: View/edit guest details, add new guests, bulk messaging
4. **Content Management**: Edit story sections, venue details, gallery images
5. **Message Logs**: View sent message history and delivery status

## Authentication & Security

- Session-based auth with Passport.js
- Admin role checking middleware
- File upload validation and secure storage
- CORS and security headers

## Deployment & Development

- **Development**: Vite dev server with HMR, local PostgreSQL or Neon
- **Production**: Vercel serverless functions, Neon database, GCS storage
- **Build**: Separate client build (Vite) and server bundle (esbuild)

## Key Integrations

- **Google Cloud Storage**: File uploads for ID documents and photos
- **Twilio**: WhatsApp/SMS messaging for RSVP confirmations
- **Replit OIDC**: Production authentication
- **Neon**: Serverless PostgreSQL database
- **Vercel**: Serverless deployment platform

## Architecture Patterns

- **Separation of Concerns**: Clear client/server split with shared schemas
- **Component-Based UI**: Reusable components with consistent design system
- **API-First Design**: RESTful endpoints with consistent error handling
- **Progressive Enhancement**: RSVP can be partially completed over time
- **CMS Integration**: Dynamic content management for wedding details
