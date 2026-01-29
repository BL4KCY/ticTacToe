/**
 * Player symbols in the game
 */
export type PlayerSymbol = 'X' | 'O';

/**
 * Cell state on the board
 */
export type CellValue = PlayerSymbol | null;

/**
 * Game board - 3x3 grid
 */
export type Board = [
  [CellValue, CellValue, CellValue],
  [CellValue, CellValue, CellValue],
  [CellValue, CellValue, CellValue]
];

/**
 * Game status
 */
export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

/**
 * Game result
 */
export enum GameResult {
  WIN = 'win',
  DRAW = 'draw',
  ONGOING = 'ongoing'
}

/**
 * Player information
 */
export interface Player {
  id: string;
  name: string;
  symbol: PlayerSymbol;
}

/**
 * Game state
 */
export interface GameState {
  id: string;
  board: Board;
  players: [Player | null, Player | null];
  currentTurn: PlayerSymbol;
  status: GameStatus;
  result: GameResult | null;
  winner: PlayerSymbol | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Move coordinate
 */
export interface Move {
  row: number;
  col: number;
  playerId: string;
}

/**
 * WebSocket message types
 */
export enum MessageType {
  JOIN_GAME = 'join_game',
  MAKE_MOVE = 'make_move',
  GAME_UPDATE = 'game_update',
  GAME_OVER = 'game_over',
  ERROR = 'error',
  PLAYER_LEFT = 'player_left'
}

/**
 * Payload for join game message
 */
export interface JoinGamePayload {
  gameId?: string;
  playerName: string;
}

/**
 * Payload for make move message
 */
export interface MakeMovePayload {
  row: number;
  col: number;
}

/**
 * Payload for error message
 */
export interface ErrorPayload {
  error: string;
}

/**
 * Payload for player left message
 */
export interface PlayerLeftPayload {
  playerId: string;
}

/**
 * WebSocket message structure
 */
export interface WSMessage {
  type: MessageType;
  payload: any; // TODO: Use discriminated union for type-safe payloads
  gameId?: string;
}
