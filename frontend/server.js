import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Request received:', req.hostname, req.url);
    console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);

    // Überprüfen, ob die Anfrage über HTTPS kommt
    if (req.headers['x-forwarded-proto'] !== 'https') {
      console.log('Redirecting to HTTPS');
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }

    // Überprüfen, ob die www-Subdomain vorhanden ist
    if (!req.hostname.startsWith('www.')) {
      console.log('Redirecting to www');
      return res.redirect(301, `https://www.${req.hostname}${req.url}`);
    }
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current directory:', __dirname);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
