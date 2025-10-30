import { SpotifyService } from "../../../../application/services/SpotifyService";
import { Request, Response } from "express";

export class SpotifyController {
  constructor(private spotifyService: SpotifyService) { }

  async handleCallback(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub;
    const { code, dashboardId } = req.query;

    // Validierung
    if (!userId || !dashboardId || typeof dashboardId !== "string") {
      res.status(400).json({ message: "User ID and Dashboard ID are required" });
      return;
    }

    if (typeof code !== "string") {
      res.status(400).json({ error: "Invalid code" });
      return;
    }
    try {
      // Spotify Tokens erhalten und speichern
      await this.spotifyService.getTokens(code, userId, dashboardId);
      res.json(true);
    } catch (error) {
      console.error("Error getting Spotify tokens:", error);
      res.status(400).json({ error: "Failed to get Spotify tokens" });
    }
  }

  initiateLogin(_req: Request, res: Response): void {
    // Login URL von Spotify erhalten
    const loginUrl = this.spotifyService.getLoginUrl();
    res.json({ loginUrl });
  }

  async setActiveDevice(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub;
    const { deviceId, dashboardId } = req.body;

    // Validierung der Eingabewerte
    if (!userId || !dashboardId || typeof dashboardId !== "string") {
      res.status(400).json({ message: "User ID and Dashboard ID are required" });
      return;
    }

    if (typeof deviceId !== "string") {
      res.status(400).json({ error: "Invalid device ID" });
      return;
    }

    try {
      // Sicherstellen, dass das Access Token gültig ist, bevor das Gerät gesetzt wird
      const accessToken = await this.spotifyService.ensureValidAccessToken(userId, dashboardId);

      // Verwende das gültige Access Token, um das Gerät zu setzen
      await this.spotifyService.saveActiveDevice(deviceId, userId, dashboardId, accessToken);

      res.json({ message: "Device set successfully" });
    } catch (error) {
      console.error("Error setting active device:", error);
      res.status(400).json({ error: "Failed to set device" });
    }
  }

  async getLogginStatus(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub;
    const { dashboardId } = req.query;

    // Validierung der Eingabewerte
    if (!userId || !dashboardId || typeof dashboardId !== "string") {
      res.status(400).json({ message: "User ID and Dashboard ID are required" });
      return;
    }
    try {
      // Prüfen, ob der Nutzer eingeloggt ist
      const isLoggedin = await this.spotifyService.getLogginStatus(userId, dashboardId);
      res.json({ isLoggedin });
    } catch (error) {
      console.error("Error getting login status:", error);
      res.status(400).json({ error: "Failed to get login status" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub;
    const { dashboardId } = req.query;
    if (!userId || !dashboardId || typeof dashboardId !== "string") {
      res.status(400).json({ message: "User ID and Dashboard ID are required" });
      return;
    }
    try {
      await this.spotifyService.logout(userId, dashboardId);
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(400).json({ error: "Failed to logout" });
    }
  }

  async getAccessToken(req: Request, res: Response): Promise<void> {
    const userId = req.auth?.payload?.sub;
    const { dashboardId } = req.query;
    if (!userId || !dashboardId || typeof dashboardId !== "string") {
      res.status(400).json({ message: "User ID and Dashboard ID are required" });
      return;
    }
    try {
      const accessToken = await this.spotifyService.ensureValidAccessToken(userId, dashboardId);
      res.json({ accessToken });
    } catch (error) {
      console.error("Error getting access token:", error);
      res.status(400).json({ error: "Failed to get access token" });
    }
  }
}
