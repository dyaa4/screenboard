import { CommunicationRepository } from '../../application/repositories/communicationRepository';
import type { FetchAccessTokenInputPort } from '../../application/useCases/app/fetchAccessTokenUseCase/ports/input';
import { FETCH_ACCESS_TOKEN_INPUT_PORT } from '@common/constants';
import { io, Socket } from 'socket.io-client';
import { inject, singleton } from 'tsyringe';

@singleton()
export default class CommunicationAdapter implements CommunicationRepository {
  private socket: Socket | null = null;
  private tokenCheckInterval: ReturnType<typeof setInterval> | null = null;
  private currentDashboardId: string | null = null;

  private receiveCallback: ((message: string) => void) | null = null;
  private receiveGoogleCalendarCallback: ((message: string) => void) | null =
    null;
  private receiveMicrosoftCalendarCallback: ((message: string) => void) | null =
    null;
  private receiveRefreshDashboardCallback: ((message: string) => void) | null =
    null;
  private receiveSmartThingsCallback: ((event: any) => void) | null = null;

  constructor(
    @inject(FETCH_ACCESS_TOKEN_INPUT_PORT)
    private readonly accessTokenUseCase: FetchAccessTokenInputPort,
  ) { }

  /**
   * Baut eine Socket-Verbindung zum Server auf.
   * Holt sich vorher ein AccessToken und registriert alle Listener.
   * @param dashboardId Die ID des Dashboards für die Verbindung
   */
  public async connect(dashboardId: string): Promise<void> {
    this.currentDashboardId = dashboardId;
    const socketUrl = import.meta.env.VITE_SERVER_API;
    const token = await this.accessTokenUseCase.getAccessToken();

    if (!token) {
      console.error('No token available. Cannot establish socket connection.');
      return;
    }

    this.socket?.connected && this.socket.disconnect();

    this.socket = io(socketUrl, {
      auth: { token },
      query: { dashboardId },
      extraHeaders: { Authorization: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    this.setupListeners();

    // Nur starten wenn wir ein gültiges Token haben und die Verbindung aufgebaut ist
    this.startTokenCheck();
  }

  /**
   * Startet ein Intervall, um alle 10 Minuten die Verbindung zu prüfen
   * und bei Bedarf einen Reconnect durchzuführen.
   */
  private startTokenCheck() {
    this.tokenCheckInterval && clearInterval(this.tokenCheckInterval);
    this.tokenCheckInterval = setInterval(
      async () => {
        // Erst prüfen, ob ein gültiges Token verfügbar ist
        const token = await this.accessTokenUseCase.getAccessToken();

        if (!token) {
          console.log('Token check: No valid token available, stopping token check interval...');
          this.stopTokenCheck();
          return;
        }

        // Nur reconnecten wenn NICHT verbunden
        if (!this.isConnected()) {
          console.log('Token check: Connection lost, reconnecting...');
          await this.reconnect();
        } else {
          console.log('Token check: Connection is healthy');
        }
      },
      5 * 60 * 1000, // Reduziere auf 5 Minuten für bessere Reaktionszeit
    );
  }

  private stopTokenCheck() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
      console.log('Token check interval stopped');
    }
  }

  /**
   * Registriert alle relevanten Listener auf der Socket-Verbindung.
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.removeAllListeners();

    this.socket.on('communication-response', (data: string) => {
      console.log('Message received:', data);
      this.receiveCallback?.(data);
    });

    this.socket.on('google-calendar-event', (data: string) => {
      console.log('Google Calendar event:', data);
      this.receiveGoogleCalendarCallback?.(data);
    });

    this.socket.on('microsoft-calendar-event', (data: string) => {
      console.log('Microsoft Calendar event:', data);
      this.receiveMicrosoftCalendarCallback?.(data);
    });

    this.socket.on('smartthings-device-event', (event: any) => {
      console.log('SmartThings event:', event);
      this.receiveSmartThingsCallback?.(event);
    });

    this.socket.on('refresh-dashboard', (data: string) => {
      console.log('Dashboard refresh:', data);
      this.receiveRefreshDashboardCallback?.(data);
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', new Date().toISOString());
      // Sende Heartbeat bei erfolgreicher Verbindung
      this.socket?.emit('heartbeat', { timestamp: Date.now() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      // Nur bei Server-initiierter Trennung Token-Check stoppen
      if (reason === 'io server disconnect') {
        console.warn('Server disconnected the socket. Attempting reconnect...');
      }
      // Bei transport close und Client-disconnect automatisch reconnecten lassen
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      // Nach Reconnect Heartbeat senden
      this.socket?.emit('heartbeat', { timestamp: Date.now() });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed after all attempts');
      // Token könnte abgelaufen sein, versuche mit neuem Token
      this.reconnect().catch(console.error);
    });

    this.socket.on('connect_error', async (error) => {
      console.error('Connection error:', error);
      // Bei Auth-Fehler Token erneuern und reconnecten
      if (error.message?.includes('Authentication') || error.message?.includes('auth')) {
        console.log('Authentication error detected, refreshing token...');
        try {
          await this.reconnect();
        } catch (reconnectError) {
          console.error('Reconnect with new token failed:', reconnectError);
        }
      }
    });

    this.socket.on('pong', () => {
      console.log('Pong received from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Sendet eine Nachricht an den Server über das 'communication'-Event.
   * @param message Die zu sendende Nachricht
   */
  public sendCommunicationMessage(message: string): void {
    this.send('communication', message);
  }

  /**
   * Sendet ein 'refresh-dashboard'-Event an den Server.
   * Verwendet dabei die aktuell gespeicherte DashboardId.
   */
  public refreshDashboard(): void {
    this.send('refresh-dashboard', { dashboardId: this.currentDashboardId });
  }

  /**
   * Sendet ein beliebiges Event mit Payload an den Server.
   * @param event Der Event-Name
   * @param message Die zu sendenden Daten
   */
  private send(event: string, message: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, message);
    } else {
      console.error('Socket not connected. Cannot send message.');
    }
  }

  /**
   * Registriert einen Callback für eingehende 'communication-response'-Events.
   * @param callback Die Callback-Funktion
   */
  public receiveCommunicationMessage(
    callback: (message: string) => void,
  ): void {
    this.receiveCallback = callback;
  }

  /**
   * Registriert einen Callback für eingehende 'google-calendar-event'-Events.
   * @param callback Die Callback-Funktion
   */
  public receiveGoogleCalendarMessage(
    callback: (message: string) => void,
  ): void {
    this.receiveGoogleCalendarCallback = callback;
  }

  /**
   * Registriert einen Callback für eingehende 'microsoft-calendar-event'-Events.
   * @param callback Die Callback-Funktion
   */
  public receiveMicrosoftCalendarMessage(
    callback: (message: string) => void,
  ): void {
    this.receiveMicrosoftCalendarCallback = callback;
  }

  /**
   *  Registriert einen Callback für eingehende 'smartthings-device-event'-Events.
   * @param callback Die Callback-Funktion für SmartThings-Events
   */
  receiveSmartThingsMessage(callback: (event: any) => void): void {
    this.receiveSmartThingsCallback = callback;
  }

  /**
   * Registriert einen Callback für eingehende 'refresh-dashboard'-Events.
   * @param callback Die Callback-Funktion
   */
  public receiveRefresh(callback: () => void): void {
    this.receiveRefreshDashboardCallback = () => callback();
  }

  /**
   * Entfernt einen Listener für ein bestimmtes Event.
   * @param event Der Event-Name
   */
  public abmelden(event: string): void {
    this.socket?.off(event);
  }

  /**
   * Trennt die Socket-Verbindung und räumt Ressourcen auf.
   */
  public disconnect(): void {
    this.tokenCheckInterval && clearInterval(this.tokenCheckInterval);
    this.tokenCheckInterval = null;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      console.log('Socket.IO connection closed.');
    }
  }

  /**
   * Führt einen Reconnect der Socket-Verbindung durch.
   * Verwendet dabei die zuletzt gespeicherte DashboardId.
   */
  public async reconnect(): Promise<void> {
    if (!this.currentDashboardId) {
      console.warn('No dashboardId available for reconnect.');
      return;
    }

    try {
      console.log('Attempting to reconnect with fresh token...');

      // Frischen Token holen
      const token = await this.accessTokenUseCase.getAccessToken();
      if (!token) {
        console.error('No token available. Cannot reconnect socket.');
        return;
      }

      // Alte Verbindung sauber trennen
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      const socketUrl = import.meta.env.VITE_SERVER_API;
      this.socket = io(socketUrl, {
        auth: { token },
        query: { dashboardId: this.currentDashboardId },
        extraHeaders: { Authorization: `Bearer ${token}` },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      });

      this.setupListeners();
      console.log('Reconnect initiated with new token');
    } catch (error) {
      console.error('Failed to reconnect socket:', error);
      // Nicht Token-Check stoppen, damit es später nochmal versucht wird
    }
  }
  /**
   * Prüft, ob eine aktive Socket-Verbindung besteht.
   * @returns true wenn verbunden, sonst false
   */
  public isConnected(): boolean {
    return !!this.socket?.connected;
  }
}
