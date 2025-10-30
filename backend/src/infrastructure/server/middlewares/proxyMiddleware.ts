// src/proxy/setupProxy.ts

import { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const setupProxy = (app: Express) => {
  app.use('/proxy', (req: Request, res: Response, next: NextFunction) => {
    const targetUrl = req.query.url as string | undefined;
    
    if (!targetUrl) {
      return res.status(400).send('Missing target URL in query parameter');
    }

    const proxyMiddleware = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      pathRewrite: () => '',
      on: {
        proxyRes: (proxyRes) => {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        },
        error: (err) => {
          console.error('Proxy error:', err);
        }
      },
      logger: console,
    });

    return proxyMiddleware(req, res, next);
  });
};