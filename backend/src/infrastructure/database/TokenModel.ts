import { ITokenDocument } from '../../domain/types/ITokenDocument';
import mongoose, { Schema } from 'mongoose';

const TokenSchema = new Schema<ITokenDocument>({
    userId: { type: String, required: true },
    dashboardId: { type: String, required: true },
    serviceId: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiration: { type: Date, required: true },
    installedAppId: { type: String, required: false }, // optional, nur SmartThings
}, { timestamps: true });

export default mongoose.model<ITokenDocument>('Token', TokenSchema);