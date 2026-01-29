import { WebSocketServer } from './server/WebSocketServer';
import { APIServer } from './server/APIServer';

/**
 * Main entry point for the TicTacToe multiplayer backend
 */
function main() {
  console.log('Starting TicTacToe Multiplayer Backend...');
  
  // WebSocket server for real-time game communication
  const WS_PORT = parseInt(process.env.WS_PORT || '8080', 10);
  const wsServer = new WebSocketServer(WS_PORT);
  
  // HTTP API server for game queries
  const API_PORT = parseInt(process.env.API_PORT || '3000', 10);
  const apiServer = new APIServer(wsServer.getGameManager(), API_PORT, WS_PORT);
  
  console.log('\n=================================');
  console.log('TicTacToe Backend is running!');
  console.log('=================================');
  console.log(`WebSocket Server: ws://localhost:${WS_PORT}`);
  console.log(`HTTP API Server: http://localhost:${API_PORT}`);
  console.log(`API Documentation: http://localhost:${API_PORT}/api`);
  console.log('=================================\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    wsServer.close();
    process.exit(0);
  });
}

// Start the server
main();
