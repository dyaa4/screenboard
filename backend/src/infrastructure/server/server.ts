
import '../../config/generalVariables';
import { config } from '../../config/config';
import connectDB from '../database/mongoose';
import express from 'express';
import http from 'http';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { setupErrorHandlers } from './errorHandlers';
import { setupProxy } from './middlewares/proxyMiddleware';
import { Express } from 'express';
import { setupSocketIO } from './socketIo';
import path from 'path';


export class Server {
  private app: Express;
  private httpServer: http.Server;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  async start(): Promise<void> {
    try {
      await this.setupServer();
      await connectDB();

      this.httpServer.listen(config.port, config.host, () => {
        console.log(`Server is running on ${config.host}:${config.port}`);
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  }

  private async setupServer(): Promise<void> {
    setupMiddleware(this.app);
    setupProxy(this.app);
    setupRoutes(this.app);
    setupSocketIO(this.httpServer);
    setupErrorHandlers(this.app);

    // statische Dateien (Frontend build)
    const publicPath = path.join(process.cwd(), 'backend', 'public');
    this.app.use(express.static(publicPath))

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