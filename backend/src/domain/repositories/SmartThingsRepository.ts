import { ISmartThingsToken, SmartThingsDeviceDTO, SmartThingsDeviceStatusDTO, SmartThingsSubscriptionDTO } from "../../domain/types/SmartThingDtos"

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

}