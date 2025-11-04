/**
 * Microsoft Calendar List DTO
 * Data Transfer Object for Microsoft Graph API calendar list
 */
export interface MicrosoftCalendarListDto {
  value: MicrosoftCalendarDto[];
}

export interface MicrosoftCalendarDto {
  id: string;
  name: string;
  color?: string;
  isDefaultCalendar?: boolean;
  canEdit?: boolean;
  canShare?: boolean;
  canViewPrivateItems?: boolean;
  owner?: {
    name?: string;
    address?: string;
  };
}