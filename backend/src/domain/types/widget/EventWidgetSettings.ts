export enum EventType {
    GOOGLE = 'google',
    ICAL = 'ical',
  }

  export interface EventWidgetSettings {
    type: EventType;
    calendarId?: string;
    icalLink?: string;
    maxEvents: number;
  }
  