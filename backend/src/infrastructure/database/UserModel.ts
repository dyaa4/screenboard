
import { IUserDocument } from '../../domain/types';
import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: { type: String, required: false },
  email: { type: String, required: true },
  picture: { type: String },
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;