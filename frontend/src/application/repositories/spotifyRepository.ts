export interface SpotifyRepository {
  getLoginUrl(dashboardId: string): string;
  initiateLogin(dashboardId: string): void;
  handleCallback(code: string, dashboardId: string): Promise<void>;
  saveActiveDevice(deviceId: string, dashboardId: string): Promise<void>;
  getLoginStatus(dashboardId: string): Promise<boolean>;
  logout(dashboardId: string): Promise<boolean>;
  getCurrentAccessToken(dashboardId: string): Promise<string>;
}
