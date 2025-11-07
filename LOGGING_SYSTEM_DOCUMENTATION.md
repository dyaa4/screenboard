# ScreenBoard Enhanced Logging System

## 🎨 Farbenfrohes Logging System implementiert!

### ✅ **Was wurde hinzugefügt:**

1. **Enhanced Logger mit Kategorien und Farben**
2. **HTTP Request/Response Logging**
3. **Database Operation Tracking**
4. **Authentication Event Logging**
5. **Webhook Event Tracking**
6. **Service Performance Monitoring**
7. **Token Security Operations**
8. **API Call Monitoring**
9. **System Event Logging**

### 🌈 **Log-Kategorien mit Emojis:**

#### **HTTP Requests** 📡
```
✅ GET /api/microsoft/events (234ms) [User: auth0|123]
⚠️ POST /api/auth/login (45ms) - 401
❌ GET /api/calendar/events (1203ms) - 500
```

#### **Authentication** 🔐
```
🔐 Microsoft OAuth login successful [user123] via Microsoft
🚫 Google OAuth login failed [user456] via Google
```

#### **Database Operations** 🗄️
```
🗄️ CREATE on tokens (23ms) [1 records]
🗄️ FIND on users (156ms) [5 records]
```

#### **Webhooks** 📨
```
📨 Microsoft webhook calendar_updated - received
✅ Google webhook event_created - processed
❌ Microsoft webhook validation - failed
```

#### **Services** ⚡
```
⚡ GoogleService.fetchCalendarEvents (234ms)
💥 MicrosoftService.subscribeToEvents failed (1200ms)
```

#### **Tokens** 🔒
```
🔒 Token encrypt for Microsoft [user123]
🔓 Token decrypt for Google [user456]
🔄 Token refresh for Microsoft [user789]
🗑️ Token delete for Spotify [user123]
```

#### **Performance** ⚡
```
⚡ Database query took 45ms
⏱️ API call took 1200ms
🐌 File upload took 5500ms
```

#### **System Events** 🖥️
```
🖥️ System: Server started on port 5000
🖥️ System: Database connected successfully
```

### 📋 **Implementierte Dateien:**

1. **`src/utils/logger.ts`** - Enhanced Logger Klasse
2. **`src/infrastructure/server/server.ts`** - Server Logging
3. **`src/infrastructure/repositories/TokenRepository.ts`** - Token Operations
4. **`src/infrastructure/adapter/input/controllers/MicrosoftController.ts`** - HTTP Endpoints
5. **`src/infrastructure/adapter/output/MicrosoftAdapter.ts`** - API Calls

### 🚀 **Verwendung:**

```typescript
import logger from '../../utils/logger';

// Standard Logging
logger.info('User logged in', { userId: 'user123' }, 'AuthController');
logger.error('Database error', error, 'DatabaseService');
logger.success('Operation completed', { result: data }, 'UserService');

// Category-Specific Logging
logger.http('GET', '/api/users', 200, 234, 'user123');
logger.database('CREATE', 'users', 45, 1);
logger.auth('login_success', 'user123', 'Google', true);
logger.webhook('Microsoft', 'calendar_updated', 'processed');
logger.service('UserService', 'createUser', true, 156);
logger.token('encrypt', 'Microsoft', 'user123');
logger.apiCall('Google', '/calendar/events', 'GET', 200, 234);

// Performance Tracking
const timer = logger.startTimer('Heavy Operation');
await heavyOperation();
timer(); // Logs completion time
```

### 🎯 **Express Middleware:**

Automatisches HTTP Request/Response Logging durch Middleware:
```typescript
app.use(logger.expressMiddleware());
```

### 📊 **Log Levels:**

- `debug` - Detaillierte Debugging-Informationen
- `info` - Allgemeine Informationen 
- `warn` - Warnungen
- `error` - Fehler
- `success` - Erfolgreiche Operationen

### 🔧 **Konfiguration:**

Environment Variable `LOG_LEVEL` zum Steuern der Ausgabe:
```env
LOG_LEVEL=debug  # Zeigt alle Logs
LOG_LEVEL=info   # Standard Level
LOG_LEVEL=warn   # Nur Warnings und Errors
LOG_LEVEL=error  # Nur Errors
```

### 🎨 **Farb-Schema:**

- 🟢 **Grün**: Erfolg, Erstellungen
- 🔵 **Blau**: Informationen, Services
- 🟡 **Gelb**: Warnungen
- 🔴 **Rot**: Fehler
- 🟣 **Lila**: Webhooks
- 🟠 **Orange**: Authentication
- 🟦 **Cyan**: Database
- 🟪 **Magenta**: HTTP

## 🎉 **Das System ist jetzt bereit!**

Starten Sie den Server und Sie werden sofort die bunten, strukturierten Logs sehen!

```bash
npm start
```