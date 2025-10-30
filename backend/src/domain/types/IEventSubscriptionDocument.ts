import { Types } from "mongoose";

export interface IEventSubscriptionData {
    _id: Types.ObjectId;
    userId: string;
    dashboardId: string;
    serviceId: string;
    targetId: string;
    expiration: Date;
    createdAt: Date;
    updatedAt: Date;
    channelId?: string;
    resourceId?: string;
}