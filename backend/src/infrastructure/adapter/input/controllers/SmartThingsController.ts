import { Request, Response } from "express";
import { SmartThingsService } from "../../../../application/services/SmartThingsService";

export class SmartThingsController {
    constructor(private readonly smartThingsService: SmartThingsService) { }

    /**
     * Handler for client-side callback POST. The popup can POST code and state
     * directly to this endpoint. The state is base64 encoded JSON containing
     * dashboardId and userId (same as server-side flow). Returns JSON success.
     */
    async handleClientCallback(req: Request, res: Response) {
        try {
            const { code, state } = req.body;
            if (!code) {
                return res.status(400).json({ message: `Code is required` });
            }
            if (!state) {
                return res.status(400).json({ message: `State is required` });
            }

            let stateData;
            try {
                stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
            } catch (e) {
                return res.status(400).json({ message: "Invalid state parameter" });
            }

            const { dashboardId, userId } = stateData;
            if (!dashboardId || !userId) {
                return res.status(400).json({ message: "dashboardId or userId missing in state" });
            }

            await this.smartThingsService.handleAuthCallback(
                userId,
                dashboardId,
                code as string
            );

            return res.json({ success: true });
        } catch (error: any) {
            console.error('handleClientCallback error', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAccessToken(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId;

            if (!userId || !dashboardId) {
                res.status(400).json({ message: "User ID and Dashboard ID are required" });
                return;
            }

            const accessToken = await this.smartThingsService.ensureValidAccessToken(userId, dashboardId);
            res.json({ accessToken });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async initiateLogin(req: Request, res: Response) {
        try {
            const dashboardId = req.query.dashboardId as string;
            const userId = req.auth?.payload?.sub;

            if (!dashboardId) {
                return res.status(400).json({ message: "Dashboard ID ist erforderlich" });
            }

            if (!userId) {
                return res.status(400).json({ message: "User ID fehlt" });
            }

            // State-Parameter erstellen, der die Dashboard-ID enthält
            // (optional: für zusätzliche Sicherheit kann ein zufälliger String hinzugefügt werden)
            const state = Buffer.from(JSON.stringify({ dashboardId, userId })).toString('base64');

            // Wichtig: Verwende URLSearchParams für korrekte Formatierung der Query-Parameter
            const params = new URLSearchParams({
                client_id: process.env.CLIENT_ID_SMARTTHINGS || '',
                response_type: 'code',
                redirect_uri: process.env.REDIRECT_URI_SMARTTHINGS || '',
                scope: 'r:devices:* r:devices:* r:hubs:* r:installedapps r:locations:* r:rules:* r:scenes:* w:devices:* w:devices:* w:installedapps w:locations:* w:rules:* x:devices:* x:devices:* x:locations:* x:scenes:*',
                state
            });

            if (!process.env.CLIENT_ID_SMARTTHINGS || !process.env.REDIRECT_URI_SMARTTHINGS) {
                console.error('Missing environment variables');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            // Die URL und Parameter korrekt formatieren
            const authUrl = `https://api.smartthings.com/oauth/authorize?${params.toString()}`;
            // Statt Redirect, gib die URL zurück, damit das Frontend den Benutzer dorthin leiten kann
            res.status(200).json({ authUrl });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getLoginStatus(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId

            if (!userId || !dashboardId) {
                res.status(400).json({ message: "User ID and Dashboard ID are required" });
                return;
            }
            const status = await this.smartThingsService.getLoginStatus(userId, dashboardId)

            res.json({ isLoggedin: status })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async logout(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId

            if (!userId || !dashboardId) {
                res.status(400).json({ message: "User ID and Dashboard ID are required" });
                return;
            }
            await this.smartThingsService.logout(userId, dashboardId)
            res.json({ success: true })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async getDevices(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId

            if (!userId || !dashboardId) {
                res.status(400).json({ message: "User ID and Dashboard ID are required" });
                return;
            }

            const devices = await this.smartThingsService.getDevices(userId, dashboardId)
            res.json(devices)
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async getDeviceStatus(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId
            const { deviceId } = req.params

            if (!userId || !dashboardId || !deviceId) {
                res.status(400).json({ message: "User ID, Dashboard ID and Device ID are required" });
                return;
            }

            const status = await this.smartThingsService.getDeviceStatus(
                userId,
                dashboardId,
                deviceId
            )
            res.json(status)
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async executeDeviceCommand(req: Request, res: Response) {
        try {
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId
            const { deviceId } = req.params
            const command = req.body


            if (!userId || !dashboardId || !deviceId || !command) {
                res.status(400).json({ message: "User ID, Dashboard ID, Device ID and Command are required" });
                return;
            }

            await this.smartThingsService.executeDeviceCommand(
                userId,
                dashboardId,
                deviceId,
                command
            )
            res.json({ success: true })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }


    async handleWebhook(req: Request, res: Response) {
        console.log("Incoming SmartThings webhook:", req.body);

        if (req.body.messageType === 'CONFIRMATION') {
            return res.status(200).send(req.body.confirmationToken);
        }

        if (req.body.lifecycle === "PING") {
            return res.json({ pingData: { challenge: req.body.pingData.challenge } });
        }

        try {
            await this.smartThingsService.handleWebhookEvent(req.body);
            res.status(200).send();

        } catch (error: any) {
            console.error("Webhook Error:", error);
            res.status(500).json({ error: error.message });
        }
    }
}
