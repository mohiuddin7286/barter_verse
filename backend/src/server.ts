import dotenv from 'dotenv';
dotenv.config();

console.log('Starting server...');

import { app } from './app';

console.log('App imported successfully');

const PORT = Number(process.env.PORT) || 5000;

console.log('PORT:', PORT);

const server = app.listen(PORT, () => {
  console.log(`🔥 Backend listening on port ${PORT}`);
  console.log('Server callback executed');
});

console.log('listen() called');

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
