import { EventSubscriptionMapper } from "../../application/mappers/EventSubscriptionMapper";
import { EventSubscription } from "../../domain/entities/EventSubscription";
import { IEventSubscriptionRepository } from "../../domain/repositories/IEventSubscriptionRepository";
import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument";

export class EventSubscriptionService {
    constructor(private eventSubscriptionRepository: IEventSubscriptionRepository) { }

    async createSubscription(subscription: IEventSubscriptionData): Promise<IEventSubscriptionData> {
        return this.eventSubscriptionRepository.create(subscription);
    }

    async getSubscriptionByResourceId(resourceId: string): Promise<IEventSubscriptionData | null> {
        return this.eventSubscriptionRepository.findByResourceId(resourceId);
    }

    async deleteSubscriptionByResourceId(resourceId: string): Promise<void> {
        return this.eventSubscriptionRepository.deleteByResourceId(resourceId);
    }

    async getExpiringSoonSubscriptions(): Promise<IEventSubscriptionData[]> {
        return this.eventSubscriptionRepository.getExpiringSoon();
    }

    async createSubscriptionFromDomain(entity: EventSubscription): Promise<void> {
        const data = EventSubscriptionMapper.toData(entity);
        await this.eventSubscriptionRepository.create(data);
    }
}

