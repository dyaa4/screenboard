import EventSubscriptionModel from "../../infrastructure/database/EventSubscriptionModel";
import { IEventSubscriptionRepository } from "../../domain/repositories/IEventSubscriptionRepository";
import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument";

export class EventSubscriptionRepository implements IEventSubscriptionRepository {
    findByResourceId(resourceId: string): Promise<IEventSubscriptionData | null> {
        return EventSubscriptionModel.findOne({ resourceId }).exec();
    }

    findById(id: string): Promise<IEventSubscriptionData | null> {
        return EventSubscriptionModel.findById(id).exec();
    }

    async create(subscription: IEventSubscriptionData): Promise<IEventSubscriptionData> {
        const doc = new EventSubscriptionModel(subscription);
        return await doc.save();
    }


    async deleteByResourceId(resourceId: string): Promise<void> {
        await EventSubscriptionModel.deleteOne({ resourceId });
    }

    async getExpiringSoon(): Promise<IEventSubscriptionData[]> {
        const now = new Date();
        const soon = new Date(Date.now() + 24 * 60 * 60 * 1000); //for the next 24 hours
        return await EventSubscriptionModel.find({ expiration: { $gte: now, $lte: soon } });
    }

    async deleteAllForUserDashboard(userId: string, dashboardId: string): Promise<void> {
        await EventSubscriptionModel.deleteMany({ userId, dashboardId });
    }
}