export interface GoogleEventDTO {
  kind: string
  etag: string
  id: string
  status: string
  htmlLink: string
  created: string
  updated: string
  summary: string
  creator: {
    email: string
    displayName?: string
  }
  organizer: any
  start: {
    date?: string
    dateTime?: string
  }
  end: {
    date?: string
    dateTime?: string
  }
  recurringEventId?: string
  originalStartTime?: any
  transparency?: string
  iCalUID: string
  sequence: number
  reminders: any
  eventType: string
  location?: string
  description?: string
}

export interface GoogleSubscriptionDTO {
  kind: string
  id: string
  resourceId: string
  resourceUri: string,
  expiration: number
}
