import { BaseEntity } from "./BaseEntity";

export class EventSubscription extends BaseEntity {
    userId: string;
    dashboardId: string;
    serviceId: string;
    targetId: string;
    channelId?: string;
    resourceId?: string;
    expiration: Date;

    constructor(
        userId: string,
        dashboardId: string,
        serviceId: string,
        targetId: string,
        expiration: Date,
        resourceId?: string,
        channelId?: string
    ) {
        super();
        this.userId = userId;
        this.dashboardId = dashboardId;
        this.serviceId = serviceId;
        this.targetId = targetId;
        this.resourceId = resourceId;
        this.expiration = expiration;
        this.channelId = channelId;
    }


}

