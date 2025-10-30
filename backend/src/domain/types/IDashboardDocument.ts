import { Dashboard } from '../../domain/entities/Dashboard';
import { Document } from 'mongoose';

// Interface für das Dashboard-Dokument
export interface IDashboardDocument extends Omit<Dashboard, '_id'>, Document { }
