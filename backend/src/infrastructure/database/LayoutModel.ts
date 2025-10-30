
import { ILayoutDocument } from '../../domain/types';
import mongoose, { Schema } from 'mongoose';

const Layoutschema: Schema = new Schema({
  dashboardId: { type: String, ref: 'Dashboard', required: true },
  pinProtectionEnabled: { type: Boolean, required: true, default: false },
  pinCode: { type: String, required: false },
  rotation: { type: Number, required: false, default: 0 },
  backgroundBrightness: { type: Number, required: false },
  backgroundAnimationEnabled: { type: Boolean, required: false },
  backgroundBlurEnabled: { type: Boolean, required: false },
  fontSize: { type: String, required: true },
  backgroundImages: { type: [String], required: true },
  customColor: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LayoutModel = mongoose.model<ILayoutDocument>(
  'Layout',
  Layoutschema,
);

export default LayoutModel;
