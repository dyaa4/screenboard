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

    async findByUserAndDashboard(userId: string, dashboardId: string): Promise<IEventSubscriptionData[]> {
        return await EventSubscriptionModel.find({ userId, dashboardId });
    }

    async updateById(id: string, updates: Partial<IEventSubscriptionData>): Promise<IEventSubscriptionData | null> {
        console.log(`🔄 EventSubscriptionRepository.updateById called:`, {
            id,
            updates: JSON.stringify(updates, null, 2)
        });

        const result = await EventSubscriptionModel.findByIdAndUpdate(id, updates, { new: true }).exec();

        console.log(`📋 EventSubscriptionRepository.updateById result:`, {
            id,
            result: result ? {
                _id: result._id,
                resourceId: result.resourceId,
                expiration: result.expiration,
                updatedAt: result.updatedAt
            } : null
        });

        return result;
    }
}