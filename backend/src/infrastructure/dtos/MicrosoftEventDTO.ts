/**
 * Microsoft Calendar Event DTO
 * Data Transfer Object for Microsoft Graph API events
 */
export interface MicrosoftEventDTO {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName?: string;
  };
  organizer?: {
    emailAddress?: {
      name?: string;
      address?: string;
    };
  };
  isAllDay?: boolean;
  webLink?: string;
}

/**
 * Microsoft Token Response DTO
 */
export interface MicrosoftTokenDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: string;
  scope: string;
}