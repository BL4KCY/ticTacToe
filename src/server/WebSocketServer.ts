import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GameManager } from '../game/GameManager';
import { MessageType, WSMessage, Move } from '../types';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  gameId?: string;
  playerName?: string;
}

/**
 * WebSocket server for real-time multiplayer
 */
export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, ClientConnection> = new Map();
  private gameManager: GameManager;

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.gameManager = new GameManager();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = uuidv4();
      const client: ClientConnection = { id: clientId, ws };
      this.clients.set(clientId, client);

      console.log(`Client connected: ${clientId}`);

      ws.on('message', (data: string) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          this.sendError(clientId, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    console.log(`WebSocket server started on port ${this.wss.options.port}`);
  }

  private handleMessage(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case MessageType.JOIN_GAME:
        this.handleJoinGame(clientId, message.payload);
        break;

      case MessageType.MAKE_MOVE:
        this.handleMakeMove(clientId, message.payload);
        break;

      default:
        this.sendError(clientId, 'Unknown message type');
    }
  }

  private handleJoinGame(clientId: string, payload: any): void {
    const { gameId, playerName } = payload;
    const client = this.clients.get(clientId);
    if (!client) return;

    const finalPlayerName = playerName || 'Player';
    client.playerName = finalPlayerName;

    let game;
    
    if (gameId) {
      // Join existing game
      game = this.gameManager.joinGame(gameId, clientId, finalPlayerName);
      if (!game) {
        this.sendError(clientId, 'Cannot join game');
        return;
      }
    } else {
      // Create new game
      game = this.gameManager.createGame(clientId, finalPlayerName);
    }

    client.gameId = game.id;

    // Send game state to the player who joined
    this.sendToClient(clientId, {
      type: MessageType.GAME_UPDATE,
      payload: game,
      gameId: game.id
    });

    // Notify all players in the game
    this.broadcastToGame(game.id, {
      type: MessageType.GAME_UPDATE,
      payload: game,
      gameId: game.id
    });
  }

  private handleMakeMove(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.gameId) {
      this.sendError(clientId, 'Not in a game');
      return;
    }

    const move: Move = {
      row: payload.row,
      col: payload.col,
      playerId: clientId
    };

    const result = this.gameManager.makeMove(client.gameId, move);

    if (!result.success) {
      this.sendError(clientId, result.error || 'Move failed');
      return;
    }

    // Broadcast updated game state to all players
    this.broadcastToGame(client.gameId, {
      type: MessageType.GAME_UPDATE,
      payload: result.game,
      gameId: client.gameId
    });

    // If game is over, send game over message
    if (result.game?.status === 'finished') {
      this.broadcastToGame(client.gameId, {
        type: MessageType.GAME_OVER,
        payload: {
          result: result.game.result,
          winner: result.game.winner
        },
        gameId: client.gameId
      });
    }
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    
    if (client?.gameId) {
      const affectedGames = this.gameManager.handlePlayerDisconnect(clientId);
      
      // Notify other players
      affectedGames.forEach(gameId => {
        this.broadcastToGame(gameId, {
          type: MessageType.PLAYER_LEFT,
          payload: { playerId: clientId },
          gameId
        }, clientId);
      });
    }

    this.clients.delete(clientId);
  }

  private sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToGame(gameId: string, message: WSMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (client.gameId === gameId && clientId !== excludeClientId) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify(message));
        }
      }
    });
  }

  private sendError(clientId: string, error: string): void {
    this.sendToClient(clientId, {
      type: MessageType.ERROR,
      payload: { error }
    });
  }

  /**
   * Get game manager instance
   */
  getGameManager(): GameManager {
    return this.gameManager;
  }

  /**
   * Close the WebSocket server
   */
  close(): void {
    this.wss.close();
  }
}
