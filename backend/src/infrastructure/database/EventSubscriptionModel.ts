import { IEventSubscriptionData } from "../../domain/types/IEventSubscriptionDocument";
import mongoose, { Schema } from "mongoose";

const EventSubscriptionSchema = new Schema<IEventSubscriptionData>({
    userId: { type: String, required: true },
    dashboardId: { type: String, required: true },
    serviceId: { type: String, required: true }, // "google", "smartthings", ...
    targetId: { type: String, required: true },  // calendarId أو deviceId
    channelId: { type: String },                 // Google فقط
    resourceId: { type: String },
    expiration: { type: Date, required: true }
}, { timestamps: true });



const EventSubscriptionModel = mongoose.model<IEventSubscriptionData>(
    'EventSubscription',
    EventSubscriptionSchema,
);

export default EventSubscriptionModel;