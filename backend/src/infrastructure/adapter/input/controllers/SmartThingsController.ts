import { Request, Response } from "express";
import { SmartThingsService } from "../../../../application/services/SmartThingsService";
import logger from "../../../../utils/logger";

export class SmartThingsController {
    constructor(private readonly smartThingsService: SmartThingsService) { }

    /**
     * Handler for client-side callback POST. The popup can POST code and state
     * directly to this endpoint. The state is base64 encoded JSON containing
     * dashboardId and userId (same as server-side flow). Returns JSON success.
     */
    async handleClientCallback(req: Request, res: Response) {
        const timer = logger.startTimer('SmartThings OAuth Callback');

        try {
            const { code, state } = req.body;

            logger.auth('SmartThings OAuth callback attempt', undefined, 'SmartThings');

            if (!code) {
                logger.warn('SmartThings callback missing code', {}, 'SmartThingsController');
                return res.status(400).json({ message: `Code is required` });
            }
            if (!state) {
                logger.warn('SmartThings callback missing state', {}, 'SmartThingsController');
                return res.status(400).json({ message: `State is required` });
            }

            let stateData;
            try {
                stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
            } catch (e) {
                logger.warn('SmartThings callback invalid state parameter', { error: (e as Error).message }, 'SmartThingsController');
                return res.status(400).json({ message: "Invalid state parameter" });
            }

            const { dashboardId, userId } = stateData;
            if (!dashboardId || !userId) {
                logger.warn('SmartThings callback missing dashboardId or userId', { dashboardId: !!dashboardId, userId: !!userId }, 'SmartThingsController');
                return res.status(400).json({ message: "dashboardId or userId missing in state" });
            }

            logger.info('Processing SmartThings auth callback', { userId, dashboardId }, 'SmartThingsController');

            await this.smartThingsService.handleAuthCallback(
                userId,
                dashboardId,
                code as string
            );

            logger.auth('SmartThings OAuth callback successful', userId, 'SmartThings', true);
            timer();
            return res.json({ success: true });
        } catch (error: any) {
            logger.error('SmartThings OAuth callback failed', error, 'SmartThingsController');
            logger.auth('SmartThings OAuth callback failed', undefined, 'SmartThings', false);
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
                logger.warn('SmartThings getDevices: Missing required parameters', {
                    userId: !!userId,
                    dashboardId: !!dashboardId,
                    authPayload: !!req.auth?.payload
                }, 'SmartThingsController');
                res.status(400).json({ message: "User ID and Dashboard ID are required" });
                return;
            }

            const devices = await this.smartThingsService.getDevices(userId, dashboardId)
            res.json(devices)
        } catch (error: any) {
            logger.error('SmartThings getDevices failed', error, 'SmartThingsController');
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
        logger.info("Incoming SmartThings webhook", { messageType: req.body?.messageType, lifecycle: req.body?.lifecycle }, 'SmartThingsController');

        if (req.body.messageType === 'CONFIRMATION') {
            return res.status(200).send(req.body.confirmationData.confirmationUrl);
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

    // === COLOR CONTROL ENDPOINTS ===

    /**
     * Set device color using hue and saturation values
     * POST /api/smartthings/device/:deviceId/color
     * Body: { hue: number, saturation: number }
     */
    async setDeviceColor(req: Request, res: Response) {
        const timer = logger.startTimer('SmartThings Set Device Color');

        try {
            const { deviceId } = req.params;
            const { hue, saturation } = req.body;
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId || req.body.dashboardId;

            if (!deviceId) {
                return res.status(400).json({ message: 'Device ID is required' });
            }
            if (hue === undefined || saturation === undefined) {
                return res.status(400).json({ message: 'Hue and saturation values are required' });
            }
            if (!userId || !dashboardId) {
                return res.status(400).json({ message: 'User ID and Dashboard ID are required in headers' });
            }

            logger.info('Setting SmartThings device color', {
                deviceId,
                hue,
                saturation,
                userId,
                dashboardId
            }, 'SmartThingsController');

            await this.smartThingsService.setDeviceColor(
                userId,
                dashboardId,
                deviceId,
                Number(hue),
                Number(saturation)
            );

            res.status(200).json({
                message: 'Device color set successfully',
                deviceId,
                hue: Number(hue),
                saturation: Number(saturation)
            });

        } catch (error: any) {
            logger.error('Failed to set SmartThings device color', {
                error: error.message,
                deviceId: req.params.deviceId
            }, 'SmartThingsController');

            res.status(500).json({
                message: 'Failed to set device color',
                error: error.message
            });
        } finally {
            timer();
        }
    }

    /**
     * Set device color temperature in Kelvin
     * POST /api/smartthings/device/:deviceId/color-temperature
     * Body: { colorTemperature: number }
     */
    async setDeviceColorTemperature(req: Request, res: Response) {
        const timer = logger.startTimer('SmartThings Set Device Color Temperature');

        try {
            const { deviceId } = req.params;
            const { colorTemperature } = req.body;
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId || req.body.dashboardId;

            if (!deviceId) {
                return res.status(400).json({ message: 'Device ID is required' });
            }
            if (colorTemperature === undefined) {
                return res.status(400).json({ message: 'Color temperature is required' });
            }
            if (!userId || !dashboardId) {
                return res.status(400).json({ message: 'User ID and Dashboard ID are required in headers' });
            }

            logger.info('Setting SmartThings device color temperature', {
                deviceId,
                colorTemperature,
                userId,
                dashboardId
            }, 'SmartThingsController');

            await this.smartThingsService.setDeviceColorTemperature(
                userId,
                dashboardId,
                deviceId,
                Number(colorTemperature)
            );

            res.status(200).json({
                message: 'Device color temperature set successfully',
                deviceId,
                colorTemperature: Number(colorTemperature)
            });

        } catch (error: any) {
            logger.error('Failed to set SmartThings device color temperature', {
                error: error.message,
                deviceId: req.params.deviceId
            }, 'SmartThingsController');

            res.status(500).json({
                message: 'Failed to set device color temperature',
                error: error.message
            });
        } finally {
            timer();
        }
    }

    /**
     * Set device brightness level
     * POST /api/smartthings/device/:deviceId/brightness
     * Body: { level: number }
     */
    async setDeviceBrightness(req: Request, res: Response) {
        const timer = logger.startTimer('SmartThings Set Device Brightness');

        try {
            const { deviceId } = req.params;
            const { level } = req.body;
            const userId = req.auth?.payload?.sub;
            const dashboardId = req.params.dashboardId || req.body.dashboardId;

            if (!deviceId) {
                return res.status(400).json({ message: 'Device ID is required' });
            }
            if (level === undefined) {
                return res.status(400).json({ message: 'Brightness level is required' });
            }
            if (!userId || !dashboardId) {
                return res.status(400).json({ message: 'User ID and Dashboard ID are required in headers' });
            }

            logger.info('Setting SmartThings device brightness', {
                deviceId,
                level,
                userId,
                dashboardId
            }, 'SmartThingsController');

            await this.smartThingsService.setDeviceBrightness(
                userId,
                dashboardId,
                deviceId,
                Number(level)
            );

            res.status(200).json({
                message: 'Device brightness set successfully',
                deviceId,
                level: Number(level)
            });

        } catch (error: any) {
            logger.error('Failed to set SmartThings device brightness', {
                error: error.message,
                deviceId: req.params.deviceId
            }, 'SmartThingsController');

            res.status(500).json({
                message: 'Failed to set device brightness',
                error: error.message
            });
        } finally {
            timer();
        }
    }

}
