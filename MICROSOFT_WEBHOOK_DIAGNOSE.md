# Microsoft Webhook Diagnose und Anforderungen

## Problem: Keine Webhook-Benachrichtigungen von Microsoft erhalten

### 1. **HTTPS Anforderung**
- ✅ Ihre Webhook-URL: `https://www.screen-board.com/api/microsoft/calendar/webhook`
- Microsoft Graph Subscriptions **MÜSSEN** HTTPS verwenden
- HTTP wird NICHT unterstützt

### 2. **Microsoft Graph App Registrierung - KRITISCH!**

Überprüfen Sie in Azure Active Directory App Registration:

#### **API Berechtigungen (WICHTIG):**
- `Calendars.ReadWrite` - Application oder Delegated
- `Calendars.ReadWrite.Shared` - Delegated (für geteilte Kalender)
- `User.Read` - Delegated
- **WICHTIG**: Nach Hinzufügen der Berechtigungen → "Grant admin consent" klicken!

#### **Manifest Überprüfung:**
```json
{
  "acceptMappedClaims": null,
  "accessTokenAcceptedVersion": 2,
  "addIns": [],
  "allowPublicClient": false,
  "appId": "your-app-id",
  "appRoles": [],
  "oauth2AllowUrlPathMatching": false,
  "createdDateTime": "2023-01-01T00:00:00Z",
  "groupMembershipClaims": null,
  "identifierUris": [],
  "informationalUrls": {
    "marketing": null,
    "privacy": null,
    "support": null,
    "termsOfService": null
  },
  "keyCredentials": [],
  "knownClientApplications": [],
  "logoUrl": null,
  "logoutUrl": null,
  "name": "YourAppName",
  "oauth2AllowIdTokenImplicitFlow": false,
  "oauth2AllowImplicitFlow": false,
  "oauth2Permissions": [],
  "oauth2RequirePostResponse": false,
  "optionalClaims": null,
  "orgRestrictions": [],
  "parentalControlSettings": {
    "countriesBlockedForMinors": [],
    "legalAgeGroupRule": "Allow"
  },
  "passwordCredentials": [],
  "preAuthorizedApplications": [],
  "publisherDomain": "your-domain.com",
  "replyUrlsWithType": [
    {
      "url": "https://www.screen-board.com/auth/microsoft/callback",
      "type": "Web"
    }
  ],
  "requiredResourceAccess": [
    {
      "resourceAppId": "00000003-0000-0000-c000-000000000000",
      "resourceAccess": [
        {
          "id": "1ec239c2-5bd4-42f0-b5ea-3f4acddb8b36",
          "type": "Scope"
        },
        {
          "id": "ef54d2bf-783f-4e0f-8b8b-5f7938c00d1c",
          "type": "Scope"
        }
      ]
    }
  ],
  "samlMetadataUrl": null,
  "signInUrl": null,
  "signInAudience": "AzureADMultipleOrgs",
  "tags": [],
  "tokenEncryptionKeyId": null
}
```

### 3. **Webhook-Endpoint Validierung**

Microsoft Graph **MUSS** Ihren Webhook-Endpoint validieren:

#### **Was passiert bei der Subscription-Erstellung:**
1. Microsoft sendet GET Request mit `validationToken` Parameter
2. Ihr Endpoint MUSS das `validationToken` als Plain Text zurückgeben
3. Status Code: 200
4. Content-Type: text/plain

#### **Aktuelle Implementation (KORREKT):**
```typescript
// Microsoft Graph webhook validation (when setting up subscription)
const validationToken = req.query.validationToken;
if (validationToken) {
  console.log('Microsoft Graph webhook validation requested');
  res.status(200).send(validationToken);
  return;
}
```

### 4. **Subscription Resource Format**

Aktuelle Resource: `me/calendars/{calendarId}/events`

#### **Mögliche Alternativen testen:**
- `me/events` (alle Kalender)
- `me/calendar/events` (Hauptkalender)
- `users/{user-id}/events`

### 5. **Debugging Steps**

#### **A. Server-seitige Logs überprüfen:**
```bash
# Server starten mit Debug-Logs
cd backend
npm start
```

#### **B. Webhook-URL direkt testen:**
```bash
curl -X GET "https://www.screen-board.com/api/microsoft/calendar/webhook?validationToken=test123"
# Sollte "test123" zurückgeben
```

#### **C. Subscription Status überprüfen:**
```bash
# Mit gültigem Access Token
curl -H "Authorization: Bearer {access_token}" \
  https://graph.microsoft.com/v1.0/subscriptions
```

### 6. **Häufige Probleme**

#### **Problem: Subscription wird erstellt aber keine Notifications**
- **Lösung**: Überprüfen Sie die `clientState` in den Logs
- **Lösung**: Testen Sie mit verschiedenen `changeType` Kombinationen

#### **Problem: "Forbidden" bei Subscription-Erstellung**
- **Lösung**: Admin Consent für API Berechtigungen erteilen
- **Lösung**: Überprüfen Sie MICROSOFT_CLIENT_ID und MICROSOFT_CLIENT_SECRET

#### **Problem: Webhook-Validation fehlschlägt**
- **Lösung**: HTTPS ist zwingend erforderlich
- **Lösung**: Webhook-URL muss öffentlich erreichbar sein
- **Lösung**: Firewall/Proxy Konfiguration prüfen

### 7. **Test-Subscription erstellen**

```bash
POST https://graph.microsoft.com/v1.0/subscriptions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "changeType": "created,updated,deleted",
  "notificationUrl": "https://www.screen-board.com/api/microsoft/calendar/webhook",
  "resource": "me/events",
  "expirationDateTime": "2024-01-01T18:23:45.9356913Z",
  "clientState": "test-client-state"
}
```

### 8. **Nächste Schritte**

1. ✅ `.env` Datei mit korrekter MICROSOFT_CALENDAR_WEBHOOK_URL erstellt
2. 🔍 Azure AD App Registration überprüfen
3. 🔍 API Berechtigungen und Admin Consent überprüfen
4. 🧪 Webhook-URL Erreichbarkeit testen
5. 🧪 Subscription manuell erstellen und testen