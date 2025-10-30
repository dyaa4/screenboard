import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument";
import { EventSubscription } from "../../domain/entities/EventSubscription";

export class EventSubscriptionMapper {
    static toData(entity: EventSubscription): IEventSubscriptionData {
        return {
            _id: entity._id as any, // wenn du kein _id brauchst, lass weg
            userId: entity.userId,
            dashboardId: entity.dashboardId,
            serviceId: entity.serviceId,
            targetId: entity.targetId,
            expiration: entity.expiration,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            resourceId: entity.resourceId,
            channelId: entity.channelId,
        };
    }

    static toEntity(doc: IEventSubscriptionData): EventSubscription {
        const entity = new EventSubscription(
            doc.userId,
            doc.dashboardId,
            doc.serviceId,
            doc.targetId,
            doc.expiration,
            doc.resourceId,
            doc.channelId
        );
        entity.createdAt = doc.createdAt;
        entity.updatedAt = doc.updatedAt;
        entity._id = doc._id.toString();
        return entity;
    }
}
