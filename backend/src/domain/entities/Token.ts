import { BaseEntity } from "./BaseEntity";

export class Token extends BaseEntity {
    accessToken: string;
    refreshToken: string;
    expiration: Date;
    userId: string;
    dashboardId: string;
    serviceId: string;
    installedAppId?: string; // optional, only for SmartThings

    constructor(accessToken: string, refreshToken: string, expiration: Date, userId: string, dashboardId: string, serviceId: string, installedAppId?: string) {
        super();
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiration = expiration;
        this.userId = userId;
        this.dashboardId = dashboardId;
        this.serviceId = serviceId;
        this.installedAppId = installedAppId;
    }
}