import { IEventSubscriptionData } from "../types/IEventSubscriptionDocument";

export interface IEventSubscriptionRepository {
    create(subscription: IEventSubscriptionData): Promise<IEventSubscriptionData>;
    findByResourceId(resourceId: string): Promise<IEventSubscriptionData | null>;
    findById(id: string): Promise<IEventSubscriptionData | null>;
    deleteByResourceId(resourceId: string): Promise<void>;
    deleteById(id: string): Promise<void>;
    deleteAllForUserDashboard(userId: string, dashboardId: string): Promise<void>;
    deleteAllForUserDashboardAndService(userId: string, dashboardId: string, serviceId: string): Promise<void>;
    findByUserAndDashboard(userId: string, dashboardId: string): Promise<IEventSubscriptionData[]>;
    getExpiringSoon(): Promise<IEventSubscriptionData[]>;
    updateById(id: string, updates: Partial<IEventSubscriptionData>): Promise<IEventSubscriptionData | null>;
}
