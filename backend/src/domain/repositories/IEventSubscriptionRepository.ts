import { IEventSubscriptionData } from "../types/IEventSubscriptionDocument";

export interface IEventSubscriptionRepository {
    create(subscription: IEventSubscriptionData): Promise<IEventSubscriptionData>;
    findByResourceId(resourceId: string): Promise<IEventSubscriptionData | null>;
    deleteByResourceId(resourceId: string): Promise<void>;
    getExpiringSoon(): Promise<IEventSubscriptionData[]>;
}
