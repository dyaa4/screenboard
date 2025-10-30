import { Token } from "../../domain/entities/Token";
import { Document } from "mongoose";

export interface ITokenDocument extends Omit<Token, '_id'>, Document { }