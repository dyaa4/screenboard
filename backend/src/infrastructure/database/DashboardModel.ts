import { IDashboardDocument } from "../../domain/types/IDashboardDocument";
import mongoose, { Schema } from "mongoose";
import LayoutModel from "./LayoutModel";
import { WidgetModel } from "./WidgetModel";
import TokenModel from "./TokenModel";
import EventSubscriptionModel from "./EventSubscriptionModel";

const DashboardSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        userId: { type: String, required: true }, // Dashboard gehört zu einem User
    },

);

DashboardSchema.pre('findOneAndDelete', async function (next) {
    try {
        const query = this.getQuery();
        const dashboardId = query._id;

        if (dashboardId) {
            // Lösche alle Layouts, die zu diesem Dashboard gehören
            await LayoutModel.deleteMany({ dashboardId });

            // Lösche alle Widgets, die zu diesem Dashboard gehören
            await WidgetModel.deleteMany({ dashboardId });

            // Lösche alle Tokens, die zu diesem Dashboard gehören
            await TokenModel.deleteMany({ dashboardId });

            // Lösche alle EventSubscriptions, die zu diesem Dashboard gehören
            await EventSubscriptionModel.deleteMany({ dashboardId });
        }

        next();
    } catch (error: unknown) {
        next(error as Error);
    }
});


// Erstelle das Modell basierend auf dem Schema
const DashboardModel = mongoose.model<IDashboardDocument>('Dashboard', DashboardSchema);



export default DashboardModel;
