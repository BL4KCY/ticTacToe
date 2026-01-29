import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  Player,
  PlayerSymbol,
  GameStatus,
  GameResult,
  Move
} from '../types';
import { TicTacToeGame } from './TicTacToeGame';

/**
 * Manages multiple game instances
 */
export class GameManager {
  private games: Map<string, GameState> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly GAME_EXPIRY_MS = 3600000; // 1 hour

  constructor() {
    // Cleanup finished games every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldGames();
    }, 300000);
  }

  /**
   * Clean up old finished games to prevent memory leaks
   */
  private cleanupOldGames(): void {
    const now = new Date();
    const gamesToDelete: string[] = [];

    this.games.forEach((game, gameId) => {
      if (game.status === GameStatus.FINISHED) {
        const gameAge = now.getTime() - game.updatedAt.getTime();
        if (gameAge > this.GAME_EXPIRY_MS) {
          gamesToDelete.push(gameId);
        }
      }
    });

    gamesToDelete.forEach(gameId => {
      this.games.delete(gameId);
      console.log(`Cleaned up expired game: ${gameId}`);
    });

    if (gamesToDelete.length > 0) {
      console.log(`Cleaned up ${gamesToDelete.length} expired game(s)`);
    }
  }

  /**
   * Create a new game
   */
  createGame(playerId: string, playerName: string): GameState {
    const gameId = uuidv4();
    const player: Player = {
      id: playerId,
      name: playerName,
      symbol: 'X'
    };

    const gameState: GameState = {
      id: gameId,
      board: TicTacToeGame.createEmptyBoard(),
      players: [player, null],
      currentTurn: 'X',
      status: GameStatus.WAITING,
      result: null,
      winner: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  /**
   * Join an existing game
   */
  joinGame(gameId: string, playerId: string, playerName: string): GameState | null {
    const game = this.games.get(gameId);
    
    if (!game) {
      return null;
    }

    if (game.status !== GameStatus.WAITING) {
      return null;
    }

    if (game.players[1] !== null) {
      return null;
    }

    const player: Player = {
      id: playerId,
      name: playerName,
      symbol: 'O'
    };

    game.players[1] = player;
    game.status = GameStatus.IN_PROGRESS;
    game.updatedAt = new Date();

    return game;
  }

  /**
   * Make a move in a game
   */
  makeMove(gameId: string, move: Move): { success: boolean; game?: GameState; error?: string } {
    const game = this.games.get(gameId);
    
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      return { success: false, error: 'Game is not in progress' };
    }

    // Find player
    const player = game.players.find(p => p?.id === move.playerId);
    if (!player) {
      return { success: false, error: 'Player not in game' };
    }

    // Check if it's player's turn
    if (player.symbol !== game.currentTurn) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate move
    if (!TicTacToeGame.isValidMove(game.board, move.row, move.col)) {
      return { success: false, error: 'Invalid move' };
    }

    // Make move
    game.board = TicTacToeGame.makeMove(game.board, move.row, move.col, player.symbol);
    
    // Check game result
    const { result, winner } = TicTacToeGame.getGameResult(game.board);
    game.result = result;
    game.winner = winner;

    if (result !== GameResult.ONGOING) {
      game.status = GameStatus.FINISHED;
    } else {
      game.currentTurn = TicTacToeGame.getNextPlayer(game.currentTurn);
    }

    game.updatedAt = new Date();

    return { success: true, game };
  }

  /**
   * Get game by ID
   */
  getGame(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  /**
   * Get all waiting games
   */
  getWaitingGames(): GameState[] {
    return Array.from(this.games.values()).filter(
      game => game.status === GameStatus.WAITING
    );
  }

  /**
   * Delete a game
   */
  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  /**
   * Clean up resources and stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Handle player disconnect
   */
  handlePlayerDisconnect(playerId: string): string[] {
    const affectedGames: string[] = [];

    this.games.forEach((game, gameId) => {
      const hasPlayer = game.players.some(p => p?.id === playerId);
      
      if (hasPlayer) {
        affectedGames.push(gameId);
        if (game.status === GameStatus.WAITING) {
          // Delete game if still waiting
          this.games.delete(gameId);
        } else if (game.status === GameStatus.IN_PROGRESS) {
          // Mark game as finished (forfeit)
          game.status = GameStatus.FINISHED;
          const remainingPlayer = game.players.find(p => p?.id !== playerId);
          if (remainingPlayer) {
            game.winner = remainingPlayer.symbol;
            game.result = GameResult.WIN;
          }
        }
      }
    });

    return affectedGames;
  }
}
