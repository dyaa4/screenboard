import { User } from "../../domain/entities/User";
import { Document } from "mongoose";

export interface IUserDocument extends Omit<User, '_id'>, Document { }
