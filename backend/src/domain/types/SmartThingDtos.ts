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
    status: SmartThingsDeviceStatusDTO
    // Color and brightness support
    supportsColor?: boolean
    supportsColorTemperature?: boolean
    supportsBrightness?: boolean
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

// Color Control DTOs
export interface SmartThingsColorDTO {
    hue: number        // 0-100
    saturation: number // 0-100
}

export interface SmartThingsColorTemperatureDTO {
    colorTemperature: number // Kelvin (1500-6500)
}

export interface SmartThingsBrightnessDTO {
    level: number // 0-100
}

// Command DTOs for device control
export interface SmartThingsDeviceCommandDTO {
    component?: string
    capability: string
    command: string
    arguments?: any[]
}

export interface SmartThingsColorCommandDTO extends SmartThingsDeviceCommandDTO {
    capability: 'colorControl'
    command: 'setColor'
    arguments: [{
        hue: number
        saturation: number
    }]
}

export interface SmartThingsColorTemperatureCommandDTO extends SmartThingsDeviceCommandDTO {
    capability: 'colorTemperature'
    command: 'setColorTemperature'
    arguments: [number]
}

export interface SmartThingsBrightnessCommandDTO extends SmartThingsDeviceCommandDTO {
    capability: 'switchLevel'
    command: 'setLevel'
    arguments: [number]
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



