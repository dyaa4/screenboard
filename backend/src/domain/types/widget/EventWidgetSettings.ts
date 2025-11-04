export enum EventType {
  GOOGLE = 'google',
  ICAL = 'ical',
  MICROSOFT = 'microsoft',
}

export interface EventWidgetSettings {
  type: EventType;
  calendarId?: string;
  icalLink?: string;
  maxEvents: number;
}
