# Wallboard Backend

## Overview
This is a Node.js/TypeScript backend API server for a wallboard/dashboard application. The application provides integration with multiple services including:
- Google Calendar
- Spotify
- SmartThings (IoT)
- Real-time updates via Socket.IO
- Auth0 authentication

## Project Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.IO for live updates
- **Authentication**: Auth0 JWT-based authentication
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx watch mode

## Directory Structure
```
src/
├── application/          # Business logic and services
├── config/              # Configuration files
├── domain/              # Domain entities, value objects, and types
│   ├── entities/
│   ├── repositories/
│   ├── types/
│   ├── valueObjects/
│   └── widget/          # Widget implementations
├── infrastructure/      # External concerns
│   ├── adapter/         # Input/Output adapters
│   │   ├── input/       # Controllers
│   │   └── output/      # External service adapters
│   ├── database/        # Mongoose models
│   ├── dtos/           # Data Transfer Objects
│   ├── repositories/    # Repository implementations
│   ├── routes/         # Express routes
│   ├── server/         # Server setup and middleware
│   └── setup/          # Initialization logic
└── utils/              # Utility functions
```

## Setup Requirements

### Required Environment Variables
The following environment variables must be set for the application to run:

**Server**:
- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: localhost)

**Database**:
- `MONGO_DB_URL` - MongoDB connection string (required)
- `APP_NAME` - Application name for MongoDB
- `DB_NAME` - Database name

**Auth0**:
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API audience

**SmartThings Integration**:
- `CLIENT_ID_SMARTTHINGS` - SmartThings OAuth client ID
- `CLIENT_SECRET_SMARTTHINGS` - SmartThings OAuth client secret
- `REDIRECT_URI_SMARTTHINGS` - OAuth redirect URI

**Google Calendar Integration**:
- `CLIENT_ID_GOOGLE_KALENDER` - Google OAuth client ID
- `CLIENT_SCRET_GOOGLE_KALENDER` - Google OAuth client secret
- `REDIRECT_URI_GOOGLE_KALENDER` - OAuth redirect URI
- `GOOGLE_CALENDAR_WEBHOOK_URL` - Webhook URL for calendar events

**Spotify Integration**:
- `SPOTIFY_CLIENT_ID` - Spotify OAuth client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify OAuth client secret
- `SPOTIFY_REDIRECT_URI` - OAuth redirect URI

See `.env.example` for a template.

## Development

### Running the Server
The server runs in development mode with hot-reload:
```bash
npm run dev-node
```

### Building for Production
```bash
npm run build
npm start
```

## Current State
- ✅ Fully configured and running in Replit environment
- ✅ MongoDB connected to cloud database
- ✅ All environment variables configured
- ✅ Auth0 authentication working
- ✅ Server running on port 5000
- ✅ All integrations configured (Google Calendar, Spotify, SmartThings)

## Recent Changes
- 2025-10-30: Initial Replit setup and configuration
  - Installed all npm dependencies
  - Updated default port from 3001 to 5000
  - Configured server to bind to 0.0.0.0 for network accessibility
  - Created .env file with all required credentials
  - Set up development workflow (tsx watch mode)
  - Configured deployment for production (VM target)
  - Successfully connected to MongoDB Atlas
  - Verified Auth0 authentication setup

## Notes
- This is a **backend-only** application - it serves as an API for a separate frontend
- The frontend is hosted at `https://screen-board.com` (based on redirect URIs in the code)
- Backend binds to localhost:5000 as it's not meant to be directly accessed by users
