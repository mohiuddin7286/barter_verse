import dotenv from 'dotenv';
dotenv.config();

// Import compiled JS file path so Node ESM can resolve it after build
import { app } from './app.js';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Backend listening on port ${PORT}`);
});
