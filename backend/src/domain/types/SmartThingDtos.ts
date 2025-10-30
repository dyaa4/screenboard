// ISmartThingsToken.ts
export interface ISmartThingsToken {
    accessToken: string
    refreshToken: string
    expiresIn: number
    installedAppId?: string // optional, only for SmartThings

}

// SmartThingsDTO.ts
export interface SmartThingsDeviceDTO {
    deviceId: string
    name: string
    label: string
    deviceTypeName: string
    deviceNetworkType: string
    capabilities: string[]
    status: any
}

export interface SmartThingsSubscriptionDTO {
    resourceId: string
    installedAppId: string
    sourceType: string
    deviceId: string
}


export interface SmartThingsDeviceStatusDTO {
    components: {
        [key: string]: {
            [capability: string]: {
                [attribute: string]: any
            }
        }
    }
}

export interface WebhookSmartthingsEvent {
    messageType?: string;
    eventData?: {
        installedApp?: {
            installedAppId?: string;
            locationId?: string;
        };
        events?: Array<{
            eventId?: string;
            locationId?: string;
            ownerId?: string;
            ownerType?: string;
            eventType?: string;
            eventTime?: string;
            deviceEvent?: {
                eventId?: string;
                locationId?: string;
                ownerId?: string;
                ownerType?: string;
                deviceId?: string;
                componentId?: string;
                capability?: string;
                attribute?: string;
                value?: string;
                valueType?: string;
                stateChange?: boolean;
                data?: Record<string, any>;
                subscriptionName?: string;
            };
        }>;
    };
}



