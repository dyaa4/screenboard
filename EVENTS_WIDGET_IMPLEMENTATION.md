# EventsWidget Implementation - Hexagonal Architecture

## Overview
Vollständige Implementierung des EventsWidget mit hexagonaler Architektur zur Unterstützung von 3 Event-Quellen:
- **Google Calendar** (monthly calendar view)
- **iCal Feeds** (event list view)
- **Microsoft Calendar** (event list view)

## Architecture Layers

### 1. Domain Layer
- **EventsWidget.ts**: Base widget class mit Zod-Validierung
- **EventWidgetSettings.ts**: TypeScript interfaces und EventType enum (GOOGLE, ICAL, MICROSOFT)
- **SimpleEventDto.ts**: Data transfer object für alle Event-Quellen

### 2. Adapter Layer (API)

#### GoogleCalendarAdapter (existing)
- `fetchGoogleCalendarEvents()`: Holt Events aus Google Calendar
- Integration mit bestehendem GoogleRepository

#### GoogleEventsAdapter (new)
- **File**: `src/adapter/api/GoogleEventsAdapter.ts`
- Spezialisierter Adapter für Google Calendar Event-Fetching
- Verwendet bestehendes Backend-API für Google Calendar

#### ICalEventsAdapter (new)
- **File**: `src/adapter/api/ICalEventsAdapter.ts`
- Fetcht und parst iCal Feeds
- Unterstützt alle iCal-kompatiblen Quellen
- Mapping von iCal-Events zu SimpleEventDto

#### MicrosoftCalendarAdapter (new)
- **File**: `src/adapter/api/MicrosoftCalendarAdapter.ts`
- Authentifizierung via OAuth2
- `fetchMicrosoftCalendarEvents()`: Events von Microsoft Graph API
- `fetchMicrosoftCalendars()`: Liste verfügbarer Kalender
- `fetchUserInfo()`: Microsoft-Benutzerprofil
- `getLoginStatus()` / `logout()`: Session-Management

### 3. Application Layer
- **useEvents Hook**: `src/adapter/ui/hooks/sites/dashboardSite/useEvents.ts`
  - Custom React hook für Multi-Source Event-Fetching
  - Automatische Event-Filterung (nur zukünftige Events)
  - Sortierung nach Startdatum
  - Error handling und loading states
  - Unterstützt alle 3 Event-Quellen über separate Adapter

### 4. Adapter/UI Layer

#### Calendar Component (updated)
- **File**: `src/adapter/ui/sites/Dashboard/components/Calendar/Calendar.tsx`
- Hauptkomponente für Events Widget
- Intelligente View-Selection basierend auf EventType:
  - Google Calendar → MonthlyCalendar (bestehende Komponente)
  - iCal/Microsoft → EventsList (neue Komponente)
- Real-time updates via WebSocket (CommunicationRepository)

#### EventsList Component (new)
- **File**: `src/adapter/ui/sites/Dashboard/components/Calendar/EventsList.tsx`
- Presentation component für Event-Listen
- Zeigt Event-Details: Titel, Datum, Zeit, Ort, Beschreibung
- Farbliche Hervorhebung mehrerer Events
- Responsive design mit HeroUI components
- Dark mode support

## Data Flow

```
Widget Config (Google/iCal/Microsoft) 
    ↓
useEvents Hook (Application Layer)
    ↓
Router (basierend auf EventType):
    - Google → GoogleCalendarAdapter
    - iCal → ICalEventsAdapter  
    - Microsoft → MicrosoftCalendarAdapter
    ↓
Event Mapping (SimpleEventDto)
    ↓
Filterung & Sortierung
    ↓
UI Rendering:
    - Google: MonthlyCalendar
    - iCal/Microsoft: EventsList
```

## Integration Points

### 1. Widget Configuration (EventsEdit.tsx)
- Existierende EventsEdit Komponente unterstützt alle 3 Quellen
- Tab-basierte Auswahl: Google, iCal, Microsoft

### 2. Dashboard Rendering (Widgets.tsx)
- `WidgetTypeEnum.EVENTS` rendert Calendar komponente
- Calendar komponente handelt alle Logik

### 3. WebSocket Communication
- Reale Ereignisupdates über CommunicationRepository
- Automatisches Refresh bei Änderungen

## File Structure

```
Calendar/
├── Calendar.tsx              ← Main component (updated)
├── EventsList.tsx            ← New: Event list view
├── MonthyCalender.tsx        ← Existing: Google Calendar view
├── helper.ts                 ← Existing: Utilities
└── style.ts                  ← Existing: Styles

api/
├── GoogleCalendarAdapter.ts  ← Existing: Google Calendar
├── GoogleEventsAdapter.ts    ← New: Google Events (specialized)
├── ICalEventsAdapter.ts      ← New: iCal Events
└── MicrosoftCalendarAdapter.ts ← New: Microsoft Events

hooks/
└── sites/dashboardSite/
    └── useEvents.ts          ← New: Multi-source hook
```

## Key Features

✅ **Multi-Source Support**: Google, iCal, Microsoft
✅ **Hexagonal Architecture**: Clean separation of concerns
✅ **Type Safety**: Full TypeScript with Zod validation
✅ **Event Filtering**: Automatisch nur zukünftige Events
✅ **Adaptive UI**: Google → Calendar view, iCal/Microsoft → List view
✅ **Real-time Updates**: WebSocket integration
✅ **Dark Mode**: HeroUI theme support
✅ **i18n Ready**: Translation keys für alle UI-Texte
✅ **Error Handling**: Graceful error states
✅ **Loading States**: Skeleton loaders

## Configuration Examples

### Google Calendar
```typescript
{
  type: EventType.GOOGLE,
  calendarId: "primary@gmail.com",
  maxEvents: 10
}
```

### iCal Feed
```typescript
{
  type: EventType.ICAL,
  icalLink: "https://example.com/calendar.ics",
  maxEvents: 10
}
```

### Microsoft Calendar
```typescript
{
  type: EventType.MICROSOFT,
  calendarId: "calendar-id",
  maxEvents: 10
}
```

## Backend Requirements

Die folgenden Backend-Endpoints werden benötigt:

- `/api/events/ical` - iCal Feed parsing
- `/api/events/microsoft/calendar` - Microsoft Calendar events
- `/api/events/microsoft/calendars` - Microsoft Calendar list
- `/api/events/microsoft/user` - Microsoft user profile
- `/api/events/microsoft/status` - Microsoft login status
- `/api/events/microsoft/logout` - Microsoft logout

## Testing

Die Implementierung kann getestet werden durch:

1. **Google Calendar**: Bestehende EventsEdit Komponente verwenden
2. **iCal**: iCal Link in EventsEdit eingeben
3. **Microsoft**: Microsoft OAuth in EventsEdit durchlaufen
4. Dashboard: Events Widget mit verschiedenen Konfigurationen ansehen

## Notes

- Calendar komponente bleibt bestehen für Google Calendar Monatsansicht
- Andere Event-Quellen nutzen neue EventsList Komponente
- Alle Event-Quellen verwenden SimpleEventDto als Standardformat
- useEvents Hook verwaltet komplette Logik für Multi-Source Fetching
