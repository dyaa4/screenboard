export interface CommunicationRepository {
  connect(dashboardId: string): Promise<void>;
  disconnect(): void;
  reconnect(): void;
  isConnected(): boolean;

  sendCommunicationMessage(message: string): void;
  refreshDashboard(): void;

  receiveCommunicationMessage(callback: (message: string) => void): void;
  receiveGoogleCalendarMessage(callback: (message: string) => void): void;
  receiveSmartThingsMessage(callback: (event: any) => void): void;

  receiveRefresh(callback: () => void): void;

  abmelden(event: string): void;
}
