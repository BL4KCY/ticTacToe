import {
  Board,
  CellValue,
  PlayerSymbol,
  GameResult,
  Move
} from '../types';

/**
 * TicTacToe game logic
 */
export class TicTacToeGame {
  /**
   * Create an empty board
   */
  static createEmptyBoard(): Board {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
  }

  /**
   * Check if a move is valid
   */
  static isValidMove(board: Board, row: number, col: number): boolean {
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      return false;
    }
    return board[row][col] === null;
  }

  /**
   * Make a move on the board
   */
  static makeMove(board: Board, row: number, col: number, symbol: PlayerSymbol): Board {
    const newBoard = board.map(r => [...r]) as Board;
    newBoard[row][col] = symbol;
    return newBoard;
  }

  /**
   * Check for winner
   */
  static checkWinner(board: Board): PlayerSymbol | null {
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (
        board[row][0] !== null &&
        board[row][0] === board[row][1] &&
        board[row][1] === board[row][2]
      ) {
        return board[row][0];
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (
        board[0][col] !== null &&
        board[0][col] === board[1][col] &&
        board[1][col] === board[2][col]
      ) {
        return board[0][col];
      }
    }

    // Check diagonals
    if (
      board[0][0] !== null &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      return board[0][0];
    }

    if (
      board[0][2] !== null &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      return board[0][2];
    }

    return null;
  }

  /**
   * Check if board is full
   */
  static isBoardFull(board: Board): boolean {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get game result
   */
  static getGameResult(board: Board): { result: GameResult; winner: PlayerSymbol | null } {
    const winner = this.checkWinner(board);
    
    if (winner) {
      return { result: GameResult.WIN, winner };
    }
    
    if (this.isBoardFull(board)) {
      return { result: GameResult.DRAW, winner: null };
    }
    
    return { result: GameResult.ONGOING, winner: null };
  }

  /**
   * Get next player symbol
   */
  static getNextPlayer(currentPlayer: PlayerSymbol): PlayerSymbol {
    return currentPlayer === 'X' ? 'O' : 'X';
  }
}
