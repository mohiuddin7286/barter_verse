import dotenv from 'dotenv';
dotenv.config();

console.log('Starting server...');

import { app } from './app';
import { initializeWebSocket } from './services/websocket.service';
import http from 'http';

console.log('App imported successfully');

const PORT = Number(process.env.PORT) || 5000;

console.log('PORT:', PORT);

// Create HTTP server and initialize WebSocket
const server = http.createServer(app);
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`🔥 Backend listening on port ${PORT}`);
  console.log('✅ WebSocket server initialized');
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
