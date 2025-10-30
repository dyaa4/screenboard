// config.ts
import dotenv from 'dotenv';
import path from 'path';

// Lädt .env aus dem Projektroot (eine Ebene über "backend")
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
