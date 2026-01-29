import express, { Request, Response } from 'express';
import { GameManager } from '../game/GameManager';

/**
 * HTTP API Server for game operations
 */
export class APIServer {
  private app: express.Application;
  private gameManager: GameManager;
  private wsPort: number;

  constructor(gameManager: GameManager, apiPort: number = 3000, wsPort: number = 8080) {
    this.app = express();
    this.gameManager = gameManager;
    this.wsPort = wsPort;
    this.setupMiddleware();
    this.setupRoutes();
    this.start(apiPort);
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // CORS middleware
    // WARNING: This allows all origins for development. 
    // In production, restrict this to specific origins.
    const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', allowedOrigins);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Get all waiting games
    this.app.get('/api/games/waiting', (req: Request, res: Response) => {
      const waitingGames = this.gameManager.getWaitingGames();
      res.json({ games: waitingGames });
    });

    // Get game by ID
    this.app.get('/api/games/:gameId', (req: Request, res: Response) => {
      const { gameId } = req.params;
      const game = this.gameManager.getGame(gameId);
      
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }
      
      res.json({ game });
    });

    // API info
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        name: 'TicTacToe Multiplayer API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /health',
          waitingGames: 'GET /api/games/waiting',
          gameDetails: 'GET /api/games/:gameId'
        },
        websocket: {
          port: this.wsPort,
          messages: {
            joinGame: 'JOIN_GAME - Join or create a game',
            makeMove: 'MAKE_MOVE - Make a move in the game'
          }
        }
      });
    });
  }

  private start(port: number): void {
    this.app.listen(port, () => {
      console.log(`HTTP API server started on port ${port}`);
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}
