# Screen Board - Digital Dashboard Application

## Overview
Screen Board is a fullstack digital dashboard application that helps users organize their day and boost productivity. It displays important information at a glance including weather, calendar events, news, music, IoT devices, and more.

**Last Updated**: October 30, 2025

## Project Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB Atlas (cloud-hosted)
- **Real-time**: Socket.IO for live updates
- **Authentication**: Auth0 JWT-based authentication
- **Styling**: Tailwind CSS + Styled Components

### Project Structure
```
.
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── adapter/   # API adapters and UI components
│   │   ├── application/ # Use cases and repositories
│   │   ├── domain/    # Domain entities and types
│   │   └── common/    # Shared utilities
│   └── public/        # Static assets
├── backend/           # Express backend API
│   ├── src/
│   │   ├── application/ # Business logic and services
│   │   ├── config/    # Configuration files
│   │   ├── domain/    # Domain entities and repositories
│   │   ├── infrastructure/ # Routes, adapters, database
│   │   └── utils/     # Utility functions
│   └── public/        # Built frontend files (after build)
└── .env              # Environment variables (gitignored)
```

## Development Setup

### Prerequisites
- Node.js 20.x
- MongoDB Atlas account (cloud database)
- Auth0 account for authentication
- Optional: Google Calendar, Spotify, SmartThings API credentials

### Environment Variables
All environment variables are configured in `.env` file:

**Server Configuration**:
- `BACKEND_PORT=3001` - Backend API port
- `HOST=localhost` - Backend host

**Database**:
- `MONGO_DB_URL` - MongoDB connection string
- `APP_NAME` - Application name
- `DB_NAME` - Database name

**Authentication (Auth0)**:
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API audience
- `VITE_AUTH0_DOMAIN` - Frontend Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Frontend Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Frontend Auth0 audience

**API Integrations** (optional):
- Google Calendar: `CLIENT_ID_GOOGLE_KALENDER`, `CLIENT_SCRET_GOOGLE_KALENDER`
- Spotify: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
- SmartThings: `CLIENT_ID_SMARTTHINGS`, `CLIENT_SECRET_SMARTTHINGS`

### Running Locally
The application runs both frontend and backend concurrently:

```bash
npm run dev
```

This starts:
- **Frontend** on port 5000 (Vite dev server)
- **Backend** on port 3001 (Express API with tsx watch)

The frontend proxies API requests to the backend automatically.

### Building for Production
```bash
npm run build
```

This builds:
1. Frontend → `backend/public/` (static files)
2. Backend → `backend/dist/` (compiled TypeScript)

### Starting Production Build
```bash
npm start
```

Runs the built backend which serves both the API and frontend static files.

## Key Features

### Widgets
- **Date & Time**: Current time with customizable format
- **Weather**: 5-day weather forecast
- **Calendar Events**: Google Calendar integration
- **News**: RSS feed reader
- **Music**: Spotify player integration
- **IoT Devices**: SmartThings integration
- **Notes**: Rich text editor for personal notes
- **QR Codes**: Generate and display QR codes
- **Remarks**: Quick notes and reminders

### Integrations
- **Auth0**: Secure user authentication
- **Google Calendar**: View and sync calendar events
- **Spotify**: Music playback control
- **SmartThings**: IoT device management
- **Socket.IO**: Real-time updates across devices

## Current State
✅ **Fully operational in Replit environment**
- Frontend running on port 5000
- Backend running on port 3001
- MongoDB connected to cloud database
- Auth0 authentication configured
- All dependencies installed
- Build system working
- Development workflow configured

## Recent Changes (October 30, 2025)
- Initial GitHub import to Replit
- Configured backend to use port 3001 (frontend on 5000)
- Updated Vite proxy configuration for API calls
- Modified service adapters to allow missing credentials (development mode)
- Installed all npm dependencies (root, frontend, backend)
- Created comprehensive .env configuration
- Set up development workflow with concurrently
- Verified MongoDB connection
- Tested frontend/backend communication

## Deployment Notes
- Frontend must run on port 5000 (Replit requirement)
- Backend runs on port 3001 (localhost)
- Frontend proxies `/api` and `/socket.io` to backend
- All redirect URIs updated for Replit domain
- Environment variables properly configured

## Security Notes
- `.env` file is gitignored (never commit credentials)
- Sensitive API keys stored in environment variables
- Auth0 handles user authentication securely
- MongoDB connection uses SSL/TLS encryption

## Next Steps for Users
1. Configure OAuth redirect URIs in:
   - Auth0 dashboard
   - Google Cloud Console (Calendar API)
   - Spotify Developer Dashboard
   - SmartThings Developer Portal
2. Update webhook URLs if needed for production
3. Test all integrations with your accounts
4. Customize dashboard widgets and layouts
5. Deploy to production using Replit deployment
