// SmartThingsAdapter.ts
import logger from "../../../utils/logger"
import { SmartThingsRepository } from "../../../domain/repositories/SmartThingsRepository"
import { ISmartThingsToken, SmartThingsDeviceDTO, SmartThingsDeviceStatusDTO, SmartThingsSubscriptionDTO } from "../../../domain/types/SmartThingDtos"
import axios, { AxiosError } from "axios"


export class SmartThingsAdapter implements SmartThingsRepository {
    private readonly clientId: string | undefined
    private readonly clientSecret: string | undefined

    constructor() {
        this.clientId = process.env.CLIENT_ID_SMARTTHINGS
        this.clientSecret = process.env.CLIENT_SECRET_SMARTTHINGS

        if (!this.clientId || !this.clientSecret) {
            logger.warn("SmartThings Client ID or Secret is not defined in environment variables. SmartThings integration will not work.")
        }
    }


    async subscribeToDeviceEvents(accessToken: string, deviceId: string, installedAppId: string): Promise<SmartThingsSubscriptionDTO> {
        try {

            const response = await axios.post(
                `https://api.smartthings.com/v1/installedapps/${installedAppId}/subscriptions`,
                {
                    sourceType: "DEVICE",
                    device: {
                        deviceId,
                        componentId: "main",
                        capability: "switch",
                        attribute: "switch",
                        stateChangeOnly: true,
                        value: "*",

                    },

                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log("Data from SmartThings subscription response:", JSON.stringify(response.data, null, 2));
            return {
                resourceId: response.data.id,
                installedAppId: response.data.installedAppId,
                sourceType: response.data.sourceType,
                deviceId: response.data.device.deviceId
            };
        } catch (error: any) {
            console.error("Error subscribing to device events:", error.response?.data || error.message);
            throw new Error("Failed to subscribe to device events");
        }
    }

    async exchangeAuthCodeForTokens(code: string): Promise<ISmartThingsToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                throw new Error("Client ID oder Client Secret fehlen");
            }

            const redirectUri = process.env.REDIRECT_URI_SMARTTHINGS;
            if (!redirectUri) {
                throw new Error("Redirect URI fehlt");
            }

            // Verwende Methode mit Basic Auth
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const params = new URLSearchParams();
            params.append('code', code);
            params.append('grant_type', 'authorization_code');
            params.append('client_id', this.clientId);
            params.append('redirect_uri', redirectUri);


            const response = await axios.post("https://api.smartthings.com/oauth/token", params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                }
            });


            const { access_token, refresh_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in,
                installedAppId: response.data.installed_app_id
            };
        } catch (error: any) {
            if (error.response) {
                console.error("Fehlerantwort:", error.response.data);
            }
            throw new Error("Failed to exchange authorization code for tokens.");

        }
    }


    async refreshAccessToken(refreshToken: string): Promise<ISmartThingsToken> {
        try {
            if (!this.clientId || !this.clientSecret) {
                throw new Error("Client ID oder Client Secret fehlen");
            }

            // Basic Auth generieren
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);
            params.append('client_id', this.clientId);

            const response = await axios.post(
                "https://api.smartthings.com/oauth/token",
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${auth}`
                    }
                }
            );

            const { access_token, refresh_token, expires_in } = response.data;

            return {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in
            };
        } catch (error: any) {
            logger.error("Fehler beim Aktualisieren des Access Tokens SmartThings:", error.message);



            if (error instanceof AxiosError && error.response && error.response.status === 401) {
                logger.warn("Unauthorized access smartthings - possibly invalid token");
            }

            throw error;
        }
    }


    async fetchDevices(accessToken: string): Promise<SmartThingsDeviceDTO[]> {
        const response = await axios.get(
            "https://api.smartthings.com/v1/devices",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )

        return response.data.items.map((device: any) => ({
            deviceId: device.deviceId,
            name: device.name,
            label: device.label,
            deviceTypeName: device.deviceTypeName,
            deviceNetworkType: device.deviceNetworkType,
            capabilities: device.capabilities,
            status: device.status
        }))
    }

    async fetchDeviceStatus(
        accessToken: string,
        deviceId: string
    ): Promise<SmartThingsDeviceStatusDTO> {
        const response = await axios.get(
            `https://api.smartthings.com/v1/devices/${deviceId}/status`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )

        return response.data
    }

    async executeDeviceCommand(
        accessToken: string,
        deviceId: string,
        command: any
    ): Promise<void> {
        await axios.post(
            `https://api.smartthings.com/v1/devices/${deviceId}/commands`,
            command,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )
    }

    async deleteDeviceSubscription(
        accessToken: string,
        subscriptionId: string,
        installedAppId: string
    ): Promise<void> {
        try {
            await axios.delete(
                `https://api.smartthings.com/v1/installedapps/${installedAppId}/subscriptions/${subscriptionId}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
        } catch (error: any) {
            console.error('Error deleting SmartThings subscription:', error.response?.data || error.message);
            // Wir werfen hier keinen Fehler, da die Subscription vielleicht schon gelöscht ist
        }
    }

}