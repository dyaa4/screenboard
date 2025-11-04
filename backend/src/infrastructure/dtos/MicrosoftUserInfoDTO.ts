/**
 * Microsoft User Info DTO
 * Data Transfer Object for Microsoft Graph API user information
 */
export interface MicrosoftUserInfoDTO {
  id: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  mail?: string;
  mobilePhone?: string;
  jobTitle?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  businessPhones?: string[];
}