import {
    ISmartThingsToken,
    SmartThingsDeviceDTO,
    SmartThingsDeviceStatusDTO,
    SmartThingsSubscriptionDTO,
    SmartThingsColorDTO
} from "../../domain/types/SmartThingDtos"

export interface SmartThingsRepository {
    exchangeAuthCodeForTokens(code: string): Promise<ISmartThingsToken>
    refreshAccessToken(refreshToken: string): Promise<ISmartThingsToken>
    fetchDevices(accessToken: string): Promise<SmartThingsDeviceDTO[]>
    fetchDeviceStatus(accessToken: string, deviceId: string): Promise<SmartThingsDeviceStatusDTO>
    executeDeviceCommand(accessToken: string, deviceId: string, command: any): Promise<void>
    subscribeToDeviceEvents(
        accessToken: string,
        deviceId: string,
        installedAppId: string
    ): Promise<SmartThingsSubscriptionDTO>
    deleteDeviceSubscription(
        accessToken: string,
        subscriptionId: string,
        installedAppId: string
    ): Promise<void>
    deleteAllSubscriptionsForApp(
        accessToken: string,
        installedAppId: string
    ): Promise<void>

    // Color control methods
    setDeviceColor(
        accessToken: string,
        deviceId: string,
        color: SmartThingsColorDTO
    ): Promise<void>
    setDeviceColorTemperature(
        accessToken: string,
        deviceId: string,
        colorTemperature: number
    ): Promise<void>
    setDeviceBrightness(
        accessToken: string,
        deviceId: string,
        level: number
    ): Promise<void>
}