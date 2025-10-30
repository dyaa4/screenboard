# Screen Board - Dashboard & Widget Management Platform

## Overview

Screen Board is a customizable dashboard application that allows users to create, configure, and display personalized information screens. Built with React, TypeScript, and Vite on the frontend, the application integrates with various third-party services (Google Calendar, Spotify, SmartThings) to display widgets like news, weather, events, IoT controls, and more. Users can manage multiple dashboards, customize layouts, and share their screens with others.

The platform follows a Clean Architecture approach with clear separation between domain logic, application use cases, and adapter layers for UI and external services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 19 with TypeScript for type safety and modern component patterns
- Vite as the build tool and development server for fast HMR
- TailwindCSS v4 with HeroUI component library for styling
- Progressive Web App (PWA) support via vite-plugin-pwa

**State Management & Data Flow**
- tsyringe for dependency injection throughout the application
- React hooks for local state management
- Custom hooks pattern for reusable business logic (e.g., `useGetDashboard`, `useSmartThings`)
- Socket.io client for real-time bidirectional communication with backend

**Routing & Navigation**
- React Router v6 for client-side routing
- Protected routes using Auth0 authentication wrapper
- Hash-based navigation for configuration tabs

**Authentication Strategy**
- Auth0 for user authentication and authorization
- JWT tokens with refresh token flow stored in localStorage
- Auth0Provider wraps the entire app with authentication context
- Separate authentication adapters for Google OAuth and Spotify OAuth
- Protected route component ensures authenticated access to dashboard features

### Domain Layer (Clean Architecture)

**Entities**
- `BaseEntity`: Provides common fields (_id, createdAt, updatedAt) for all domain entities
- `Dashboard`: Represents a user's dashboard with userId and name
- `Layout`: Encapsulates layout configuration (rotation, fontSize, backgrounds, PIN protection)
- `User`: Auth0-linked user entity
- `Widget`: Abstract base class for all widget types with validation and settings schema

**Widget Types** (Each extends base Widget class)
- DateTimeWidget: Displays time with timezone and format options
- EventsWidget: Shows calendar events from Google/iCal sources
- WeatherWidget: Weather information for specified cities
- NewsWidget: RSS feed aggregation
- RemarksWidget: Rotating messages/reminders
- QRCodesWidget: Generate and display QR codes (text, URL, WiFi)
- NotesWidget: Rich text notes with HTML content
- IoTWidget: Smart home device controls
- MusicWidget: Spotify integration (settings TBD)

**Value Objects**
- FontSize enum: SMALL, MEDIUM, LARGE
- Rotation enum: 0, 90, 180, 270 degrees
- WidgetTypeEnum: Defines all available widget types
- Allowed date formats and timezones as constants

**Design Patterns**
- Factory Pattern: `WidgetFactory` creates appropriate widget instances based on type
- Repository Pattern: Interfaces define contracts for data access
- Use Case Pattern: Each business operation encapsulated in a dedicated use case class

### Application Layer

**Use Cases**
- FetchAccessTokenUseCase: Retrieves authentication tokens
- FetchNewsRssFeedsUseCase: Fetches and parses RSS feeds
- Google Calendar operations (login, fetch events, fetch calendars)

**Repositories (Interfaces)**
- `WidgetRepository`: CRUD operations for widgets
- `DashboardRepository`: Dashboard management
- `LayoutRepository`: Layout configuration
- `CommunicationRepository`: WebSocket communication interface
- `GoogleRepository`: Google Calendar API operations
- `SpotifyRepository`: Spotify API operations
- `SmartThingsRepository`: SmartThings IoT API operations

**DTOs**
- Separation between domain entities and data transfer objects
- `IPatchableProps`: Generic interface for partial updates
- Google-specific DTOs (GoogleCalendarDto, SimpleEventDto, UserProfileDto)
- RSS-specific DTOs (RSSItemDto)

### Adapter Layer

**API Adapters** (Implement Repository interfaces)
- `WidgetsAdapter`: RESTful API calls for widget CRUD with bearer token auth
- `DashboardAdapter`: Dashboard API operations
- `LayoutAdapter`: Layout configuration API
- `GoogleCalendarAdapter`: Google OAuth and Calendar API integration
- `SpotifyAdapter`: Spotify OAuth and playback control
- `SmartThingsAdapter`: Samsung SmartThings IoT device management
- `CommunicationAdapter`: Socket.io WebSocket client for real-time updates
- `FlexibleRSSAdapter`: Proxy-based RSS feed fetching (CORS workaround)

**Authentication Adapter**
- `Auth0FetchAccessTokenAdapter`: Wraps Auth0's token retrieval

**UI Components**
- Component library based on HeroUI with custom theming
- Reusable components: ColorPicker, EmptyState, ErrorState, Footer, LocaleSwitcher, ThemeSwitcher
- Protected route wrapper for authenticated pages
- Navigation layout with responsive navbar

**Internationalization**
- i18next with browser language detection
- Supported languages: English, German, Arabic, Russian, Spanish, Chinese
- RTL support for Arabic language
- Translation files organized by language code

**Custom Hooks**
- CRUD hooks pattern: `useGetDashboard`, `useCreateDashboard`, `useUpdateDashboard`, `useDeleteDashboard`
- Service integration hooks: `useSmartThings`, `useCommunicationRepository`
- UI utility hooks: `useTabSync` for synchronized tab state

### Data Storage & Persistence

The application uses a RESTful API backend (not included in this repository) that likely uses MongoDB or similar document database based on the data structure patterns (_id fields, nested documents). Widget settings, dashboard configurations, and layout preferences are persisted server-side.

**Local Storage Usage**
- Auth tokens (Auth0 access/refresh tokens)
- Google Calendar tokens
- User preferences and caching

### Real-time Communication

**WebSocket Implementation**
- Socket.io for bidirectional event-based communication
- Authentication via JWT token in connection handshake
- Room-based communication per dashboard
- Event types: communication messages, Google Calendar updates, SmartThings events, dashboard refresh triggers
- Auto-reconnection with token refresh on expiry

### Styling & Theming

**Design System**
- TailwindCSS v4 with PostCSS plugin architecture
- HeroUI theme system with light/dark mode
- Custom color palette with primary (#964ED8 purple) and secondary (#40BFF8 blue)
- next-themes for theme switching and persistence
- Poppins font family as default
- Responsive design with mobile-first approach

**Layout Features**
- Rotatable display (0°, 90°, 180°, 270°)
- Adjustable font sizes
- Custom background images with animation and blur effects
- Custom color overlays with opacity
- PIN protection for dashboards

### Development & Build Configuration

**TypeScript Configuration**
- Strict mode enabled with experimental decorators for dependency injection
- Path aliases for clean imports (@components, @sites, @hooks, etc.)
- ES2020 target with ESNext modules

**Vite Configuration**
- React plugin with fast refresh
- TailwindCSS Vite plugin
- PWA plugin with service worker and manifest
- Chunk size limit increased to 1MB
- Custom alias resolution matching tsconfig paths

**Production Deployment**
- Express.js server for serving static build
- HTTPS redirect in production
- www subdomain enforcement
- SPA routing fallback to index.html

## External Dependencies

### Authentication & Authorization
- **Auth0**: User authentication, JWT tokens, user management
  - Domain, client ID, and audience configured via environment variables
  - Supports social logins and enterprise SSO

### Third-Party Service Integrations

**Google Services**
- **Google OAuth 2.0**: Authorization for Google Calendar access
- **Google Calendar API**: Fetch user calendars and events
- Client ID required via VITE_CLIENT_ID_GOOGLE_KALENDER

**Music Streaming**
- **Spotify Web API**: Playback control, device management, OAuth flow
- Requires client ID and redirect URI configuration
- Web Playback SDK for in-browser playback

**Smart Home**
- **Samsung SmartThings API**: IoT device discovery, status monitoring, command execution
- OAuth 2.0 authorization flow
- **Tuya IoT Platform**: Alternative smart home provider (connector package included)

**Weather Data**
- Weather API integration (API key and coordinates required)
- Environment variables: VITE_WEATHER_API_KEY, VITE_WEATHER_LONGITUDE, VITE_WEATHER_LATITUDE

### UI & Component Libraries
- **HeroUI React**: Component library with theming
- **FontAwesome**: Icon library (free variants)
- **Framer Motion**: Animation library for UI transitions
- **react-color-circle**: Color picker component
- **qrcode & qrcode.react**: QR code generation
- **react-clock**: Analog clock widget
- **jodit-react**: Rich text editor for notes widget

### Data Handling & Utilities
- **axios**: HTTP client for API requests
- **date-fns & date-fns-tz**: Date formatting and timezone handling
- **moment**: Legacy date library (consider migrating to date-fns)
- **zod**: Runtime schema validation for widget settings
- **crypto-js**: Encryption utilities (potentially for PIN codes)

### Development Tools
- **reflect-metadata**: Required for tsyringe dependency injection
- **mkcert**: HTTPS certificate generation for local development
- **module-alias**: Path aliasing at runtime

### Backend Communication
- **socket.io-client**: WebSocket client for real-time features
- **express-oauth2-jwt-bearer**: JWT validation middleware (backend)

### Build & PWA
- **vite-plugin-pwa**: Service worker and PWA manifest generation
- **@vitejs/plugin-react**: React fast refresh for Vite