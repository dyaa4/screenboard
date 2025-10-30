export interface GoogleCalendarDto {
    kind: 'calendar#calendarListEntry'; // Gibt den Typ der Ressource an
    etag: string; // Version der Ressource für Caching-Zwecke
    id: string; // Einzigartige ID des Kalenders
    summary: string; // Titel des Kalenders
    description?: string; // Beschreibung des Kalenders (optional)
    location?: string; // Standort des Kalenders (optional)
    timeZone?: string; // Zeitzone des Kalenders (optional)
    summaryOverride?: string; // Benutzerdefinierter Titel des Kalenders (optional)
    colorId?: string; // Farb-ID des Kalenders (optional)
    backgroundColor?: string; // Hintergrundfarbe des Kalenders (optional)
    foregroundColor?: string; // Vordergrundfarbe des Kalenders (optional)
    hidden?: boolean; // Ob der Kalender ausgeblendet ist (optional)
    selected?: boolean; // Ob der Kalender ausgewählt ist (optional)
    accessRole: string; // Zugriffsrolle des Nutzers für diesen Kalender
    primary?: boolean; // Ob dies der primäre Kalender ist (optional)
    deleted?: boolean; // Ob der Kalender gelöscht wurde (optional)
}
