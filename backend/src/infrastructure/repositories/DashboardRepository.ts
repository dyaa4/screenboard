import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { IDashboardDocument } from '../../domain/types/IDashboardDocument';

import DashboardModel from '../../infrastructure/database/DashboardModel';

export class DashboardRepository implements IDashboardRepository {
    create(dashboard: IDashboardDocument): Promise<IDashboardDocument> {
        return DashboardModel.create(dashboard);
    }

    getDashboardByIdAndUserId(
        dashboardId: string,
        userId: string,
    ): Promise<IDashboardDocument | null> {
        return DashboardModel.findOne({ _id: dashboardId, userId }).exec();
    }

    getDashboardListByUserId(userId: string): Promise<IDashboardDocument[]> {
        return DashboardModel.find({ userId }).exec();
    }

    update(dashboard: IDashboardDocument): Promise<IDashboardDocument | null> {
        return DashboardModel.findOneAndUpdate(
            { _id: dashboard._id, userId: dashboard.userId },
            dashboard,
            { new: true },
        ).exec();
    }

    async delete(dashboardId: string, userId: string): Promise<void> {
        await DashboardModel.findOneAndDelete({ _id: dashboardId, userId }).exec();
    }
}
