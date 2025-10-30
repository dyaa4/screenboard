export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: '0.0.0.0', // wichtig: damit der Server von außen erreichbar ist
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE
  },
};