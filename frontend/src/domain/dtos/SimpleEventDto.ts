export interface SimpleEventDto {
  id: string; // ID des Events
  summary: string; // Name des Events
  start: {
    date?: string; // Datum im Format YYYY-MM-DD, falls nur Datum vorhanden ist
    dateTime?: string; // Datum und Uhrzeit im Format YYYY-MM-DDTHH:mm:ssZ
  };
  end: {
    date?: string; // Datum im Format YYYY-MM-DD, falls nur Datum vorhanden ist
    dateTime?: string; // Datum und Uhrzeit im Format YYYY-MM-DDTHH:mm:ssZ
  };
  location?: string; // Ort des Events
  description?: string; // Beschreibung des Events
  creator?: {
    email: string; // Email-Adresse des Erstellers
    displayName?: string; // Name des Erstellers
  };
}
