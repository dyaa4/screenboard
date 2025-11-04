
import { Express } from 'express';
import googleRoutes from '../routes/googleRoutes';
import layoutConfigRoutes from '../routes/layoutRoutes';
import userRoutes from '../routes/userRoutes';
import widgetRoutes from '../routes/widgetRoutes';
import spotifyRoutes from '../routes/spotifyRoutes';
import dashboardRoutes from '../routes/dashboardRoutes';
import smartThingsRoutes from '../routes/smartThingsRoutes';
import eventsRoutes from '../routes/eventsRoutes';
import microsoftRoutes from '../routes/microsoftRoutes';

export const setupRoutes = (app: Express): void => {
  app.use('/api', spotifyRoutes);
  app.use('/api', userRoutes);
  app.use('/api', widgetRoutes);
  app.use('/api', googleRoutes);
  app.use('/api', microsoftRoutes);
  app.use('/api', smartThingsRoutes);
  app.use('/api', layoutConfigRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api', eventsRoutes);
};