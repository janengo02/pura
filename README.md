# Pura

A kanban and timeboxed task management tool with Google Calendar integration.

🚀 **[Live Demo](https://pura-production.up.railway.app/)**

## Overview

Pura is a full-stack task management application that combines kanban-style task organization with calendar scheduling. It features Google Calendar integration for seamless time management and supports multiple languages.

## Tech Stack

- **Frontend**: React, Chakra UI, Redux, React Big Calendar
- **Backend**: Node.js, Express, MongoDB, Prisma
- **Authentication**: JWT, Google OAuth
- **Other**: Winston logging, internationalization (i18n)

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
NODE_ENV=development

# Server Configuration
PORT=2000

# Database Configuration
DATABASE_URI=your_mongodb_database_connection_string

# Security Configuration
JWT_SECRET=your_secure_jwt_secret_key
ENCRYPTION_KEY=your_secure_encryption_key_for_google_tokens

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend Configuration
FRONTEND_URL=http://localhost:8080
```

#### Frontend Environment

Edit `frontend/.env` with your configuration:
```env
# Google OAuth Configuration
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id

# API Configuration
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

### Root Level

- `npm run dev` - Run both frontend and backend in development mode
- `npm run start:backend` - Start backend server
- `npm run start:frontend` - Start frontend development server
- `npm run install:all` - Install dependencies for all workspaces

### Backend

- `npm run server` - Start backend in development mode with nodemon
- `npm start` - Start backend in production mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:db:push` - Push database schema
- `npm run prisma:validate` - Validate Prisma schema
- `npm run prisma:format` - Format Prisma schema

### Frontend

- `npm start` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:simple` - Build without memory optimization
- `npm test` - Run tests

## Features

- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Calendar Integration**: Google Calendar sync for scheduling tasks
- **Task Management**: Create, edit, and organize tasks with groups and progress tracking
- **Multi-language Support**: English and Japanese localization
- **User Authentication**: Secure login with Google OAuth integration
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```text
pura/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── validators/         # Input validation
│   └── prisma/             # Database schema
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature-specific components
│   │   ├── actions/        # Redux actions
│   │   ├── reducers/       # Redux reducers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── README.md
```
