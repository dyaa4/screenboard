
export const config = {
    port: parseInt(process.env.BACKEND_PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      audience: process.env.AUTH0_AUDIENCE
    },
  };