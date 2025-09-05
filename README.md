# Pura

A kanban and timeboxed task management tool with Google Calendar integration.

🚀 **[Live Demo](https://pura-production.up.railway.app/)**

## Overview

Pura is a full-stack task management application that combines kanban-style task organization with calendar scheduling. It features Google Calendar integration for seamless time management.

## Tech Stack

- **Frontend**: React 18, Redux Toolkit, RTK Query, React Big Calendar, Chakra UI, Yup validation
- **Backend**: Node.js, Express, MongoDB, Prisma
- **Authentication**: JWT, Google OAuth 2.0
- **Development**: ESLint, Jest, React Testing Library
- **Logging**: Winston with daily rotate files
- **Internationalization**: i18next (English, Japanese)

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB database
- Google OAuth credentials (for calendar integration)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pura
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install:all
```

### 3. Environment Configuration

#### Backend Environment

Copy the example environment file and configure it:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Environment Configuration
# Valid values: development, production, test
NODE_ENV=development

# Server Configuration
# Port number (1-65535), defaults to 2000
PORT=2000

# Database Configuration
# MongoDB connection string (required)
# Example: mongodb://localhost:27017/pura
DATABASE_URI=your_mongodb_database_connection_string

# Security Configuration
# JWT secret for signing tokens (required, min 32 chars)
# Generate with: openssl rand -base64 32
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters_long

# Encryption key for Google tokens (required, min 32 chars)
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=your_secure_encryption_key_for_google_tokens_32_chars

# Google OAuth Configuration (required)
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id_from_google_cloud_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_google_cloud_console

# Frontend Configuration
# URL for CORS configuration (required)
FRONTEND_URL=http://localhost:8080
```

#### Frontend Environment

Copy the example environment file and configure it:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` with your configuration:

```env
# Google OAuth Configuration (required)
# Must match backend GOOGLE_CLIENT_ID
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id_from_google_cloud_console

# API Configuration (optional)
# Backend API URL, defaults to http://localhost:2000
REACT_APP_API_URL=http://localhost:2000
```

### 4. Database Setup

Generate Prisma client and push the database schema:

```bash
cd backend
npm run prisma:generate
npm run prisma:db:push
```

### 5. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080` (for development)
   - Your production URL (for production)
6. Copy the Client ID and Client Secret to your `.env` file

### 6. Running the Application

#### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:2000`
- Frontend development server on `http://localhost:8080`

#### Individual Services

Run backend only:

```bash
npm run start:backend
```

Run frontend only:

```bash
npm run start:frontend
```

#### Production Mode

Build and run the frontend:

```bash
cd frontend
npm run build
```

Start the backend server:

```bash
cd backend
npm start
```

## Available Scripts

### Root Level (Monorepo)

- `npm run dev` - Run both frontend and backend in development mode
- `npm run start:backend` - Start backend server
- `npm run start:frontend` - Start frontend development server
- `npm run install:all` - Install dependencies for all workspaces
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run lint:fix` - Run ESLint with automatic fixes on both workspaces

### Backend

- `npm run server` - Start backend in development mode with nodemon
- `npm start` - Start backend in production mode
- `npm run build` - Generate Prisma client and install dependencies
- `npm run lint` - Run ESLint on backend code
- `npm run lint:fix` - Run ESLint with automatic fixes
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:db:push` - Push database schema
- `npm run prisma:validate` - Validate Prisma schema
- `npm run prisma:format` - Format Prisma schema

### Frontend

- `npm start` - Start development server on port 8080
- `npm run build` - Build for production with memory optimization
- `npm run build:simple` - Build without memory optimization
- `npm test` - Run Jest tests with React Testing Library
- `npm run lint` - Run ESLint on frontend code
- `npm run lint:fix` - Run ESLint with automatic fixes

## Features

### Core Functionality
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Task Management**: Create, edit, and organize tasks with groups and progress tracking
- **Calendar Integration**: Secured Google Calendar sync for scheduling tasks with Google OAuth 2.0 integration
- **Google Meet Integration**: Schedule and join meetings directly from tasks
- **User Authentication**: JWT Token-based authentication with refresh token rotation

### User Experience
- **Multi-language Support**: Full i18n with English and Japanese localization
- **Dark/Light Theme**: Toggle between themes with user preference persistence
- **Error Handling**: Comprehensive error alert with helpful guidance

## Project Structure

```text
pura/                           # Monorepo root
├── backend/                    # Node.js/Express backend
│   ├── config/                 # Configuration & environment validation
│   │   ├── db.js               # MongoDB connection
│   │   ├── env.js              # Environment variable validation (Yup)
│   │   ├── logger.js           # Winston logging configuration
│   │   └── prisma.js           # Prisma client setup
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Global error handling
│   │   └── requestLogger.js    # Request logging
│   ├── models/                 # Mongoose data models
│   ├── routes/                 # API routes (v1)
│   │   └── v1/                 # Versioned API endpoints
│   ├── utils/                  # Utility functions & helpers
│   ├── validators/             # Input validation schemas
│   ├── prisma/                 # Database schema & migrations
│   ├── eslint.config.js        # Backend ESLint configuration
│   └── server.js               # Express server entry point
├── frontend/                   # React 18 frontend
│   ├── src/
│   │   ├── __tests__/        # Test utilities & helpers
│   │   │   ├── test-utils.jsx        # Redux testing wrapper
│   │   │   └── testing-helpers.js    # Custom testing utilities
│   │   ├── app/              # App configuration
│   │   │   ├── App.jsx       # Main App component
│   │   │   └── store.js      # Redux Toolkit store
│   │   ├── config/           # Configuration
│   │   │   └── env.js        # Environment validation (Yup)
│   │   ├── features/         # Feature-based architecture
│   │   │   ├── auth/         # Authentication (OAuth, JWT)
│   │   │   ├── calendar/     # Calendar & Google Calendar integration
│   │   │   ├── dashboard/    # Main dashboard & kanban
│   │   │   ├── error/        # Error pages & handling
│   │   │   ├── event/        # Event creation & management
│   │   │   ├── kanban/       # Kanban board components
│   │   │   ├── landing/      # Landing page
│   │   │   ├── task/         # Task management
│   │   │   └── ui/           # UI state (theme, language)
│   │   ├── shared/           # Shared components & utilities
│   │   │   ├── api/          # RTK Query base API
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   └── utils/        # Utility functions
│   │   ├── lang/             # Internationalization
│   │   │   ├── en.json       # English translations
│   │   │   ├── ja.json       # Japanese translations
│   │   │   └── i18n.js       # i18next configuration
│   │   └── theme/            # Chakra UI theme customization
│   ├── eslint.config.js      # Frontend ESLint configuration
│   └── public/               # Static assets
├── package.json              # Monorepo configuration & scripts
├── eslint.config.js          # Root ESLint configuration
└── README.md                 # This file
```