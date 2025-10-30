import { Layout } from "../../domain/entities/Layout";
import { Document } from "mongoose";

export interface ILayoutDocument extends Omit<Layout, '_id'>, Document { }