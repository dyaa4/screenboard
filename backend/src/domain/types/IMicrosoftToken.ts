/**
 * Microsoft Token Interface
 * Represents Microsoft OAuth tokens
 */
export interface IMicrosoftToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: string;
  scope: string;
}