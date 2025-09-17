# Wedding Website

## Overview

This is a complete, full-stack wedding website and guest management platform built for Sneha & Abhinav's wedding. The application provides a beautiful, responsive wedding website for guests along with a comprehensive admin panel for managing RSVPs, guest communications, and website content. The platform includes features for RSVP management, photo gallery, guest messaging via WhatsApp, and customizable website content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with **React** using **Vite** as the build tool and development server. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight routing solution. The UI is built with **shadcn/ui** components based on **Radix UI** primitives, styled with **Tailwind CSS** for a modern, elegant design.

The frontend follows a component-based architecture with:

- **Page components** for different routes (Home, RSVP, Admin Dashboard, etc.)
- **Reusable UI components** from shadcn/ui library
- **Custom components** for specific features like photo gallery, guest table, and message modal
- **Hooks** for state management and API interactions using React Query

### Backend Architecture

The backend is built with **Node.js** and **Express.js**, following a RESTful API pattern. The server is structured with:

- **Route handlers** in `server/routes.ts` for all API endpoints
- **Database layer** using Drizzle ORM for type-safe database operations
- **Authentication middleware** using Replit Auth for Google Sign-In
- **File upload handling** with Multer for image uploads
- **Session management** with PostgreSQL session store

### Database Design

The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for database operations. The schema includes:

- **Sessions table** for user session management (required for Replit Auth)
- **Users table** for authenticated user data
- **Admins table** for admin email whitelist
- **Guests table** for RSVP and guest information management
- **Dashboard content table** for customizable website sections
- **Gallery images table** for photo management
- **Message templates and logs** for communication tracking

### Authentication & Authorization

Authentication is handled through **Replit Auth** which provides Google Sign-In integration. The system uses:

- **Session-based authentication** with PostgreSQL session storage
- **Admin authorization** through email whitelist in the admins table
- **Protected routes** for admin functionality
- **Public access** for guest-facing features like RSVP and photo upload

### File Upload & Storage

The application handles file uploads for:

- **Guest ID documents** during RSVP process
- **Photo gallery images** uploaded by guests
- **Files stored locally** in uploads directory with Multer configuration
- **10MB file size limit** for uploads

### External Service Integrations

The application is designed to integrate with:

- **Twilio API** for WhatsApp messaging (configured but not fully implemented)
- **Replit Database** for PostgreSQL hosting
- **Replit Auth** for authentication services
- **Replit Autoscale Deployments** for hosting

### State Management

Frontend state is managed using:

- **React Query** for server state, caching, and API calls
- **React Hook Form** for form state management with Zod validation
- **Local component state** with React hooks for UI interactions
- **Custom hooks** for authentication state and common functionality

### Build & Development

The project uses:

- **Vite** for fast development and optimized production builds
- **TypeScript** throughout the codebase for type safety
- **ESBuild** for backend bundling in production
- **Shared schema** between frontend and backend using Zod
- **Path aliases** for clean imports across the application

## External Dependencies

### Core Framework Dependencies

- **@neondatabase/serverless**: PostgreSQL database connection for Replit
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools
- **express**: Web application framework for Node.js backend
- **react** & **@vitejs/plugin-react**: Frontend framework and build tooling

### UI & Styling Dependencies

- **@radix-ui/\***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating component variants
- **clsx** & **tailwind-merge**: Class name utilities for dynamic styling

### Authentication & Session Management

- **openid-client** & **passport**: Authentication middleware for Replit Auth
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store adapter

### Data Handling & Validation

- **@tanstack/react-query**: Data fetching and state management
- **react-hook-form** & **@hookform/resolvers**: Form handling and validation
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### File Upload & Communication

- **multer**: Middleware for handling multipart/form-data file uploads
- **Twilio SDK integration**: For WhatsApp and SMS messaging capabilities

### Development & Build Tools

- **typescript**: Static type checking
- **vite**: Fast build tool and development server
- **esbuild**: Fast JavaScript bundler for production backend
- **@replit/vite-plugin-\***: Replit-specific development plugins
