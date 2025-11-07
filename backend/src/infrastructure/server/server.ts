import '../../config/generalVariables';
import { config } from '../../config/config';
import connectDB from '../database/mongoose';
import express from 'express';
import http from 'http';
import { setupMiddleware } from './middleware';
import { setupErrorHandlers } from './errorHandlers';
import { setupProxy } from './middlewares/proxyMiddleware';
import { Express } from 'express';
import { setupSocketIO } from './socketIo';
import path from 'path';
import { setupRoutes } from './routes';
import logger from '../../utils/logger';


export class Server {
  private app: Express;
  private httpServer: http.Server;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  async start(): Promise<void> {
    try {
      logger.system('Starting ScreenBoard Backend Server');

      await this.setupServer();
      await connectDB();

      this.httpServer.listen(config.port, config.host, () => {
        logger.success(`Server is running on ${config.host}:${config.port}`, {
          port: config.port,
          host: config.host,
          env: process.env.NODE_ENV || 'development'
        }, 'Server');
      });
    } catch (error) {
      logger.error('Error starting server', error as Error, 'Server');
      process.exit(1);
    }
  }

  private async setupServer(): Promise<void> {
    logger.info('Setting up server middleware and routes', {}, 'Server');

    // Add request logging middleware first
    this.app.use(logger.expressMiddleware());

    setupMiddleware(this.app);
    setupProxy(this.app);
    setupRoutes(this.app);
    setupSocketIO(this.httpServer);
    setupErrorHandlers(this.app);

    // statische Dateien (Frontend build)
    this.setupStaticAssets();

    logger.success('Server setup completed', {}, 'Server');
  }

  /**
   * Serve frontend static files from backend/public and fall back to index.html
   */
  private setupStaticAssets(): void {
    const publicPath = path.join(process.cwd(), 'backend', 'public');
    this.app.use(express.static(publicPath));

    // Fall back: if route is not /api, serve index.html to let the frontend router handle it
    this.app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      console.log('🟢 Frontend route requested:', req.path);
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  public getHttpServer(): http.Server {
    return this.httpServer;
  }
}

// Usage
if (require.main === module) {
  const server = new Server();
  server.start();
}