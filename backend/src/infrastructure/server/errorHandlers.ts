import express,{Express} from 'express';

export const setupErrorHandlers = (app: Express): void => {
  // Global error handler for unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
  });

  // Global error handler for uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Application specific logging, throwing an error, or other logic here
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:');
    console.log(req.url, req.method, err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received. Closing HTTP server.');
    // You might want to close your database connection here as well
    process.exit(0);
  });
};