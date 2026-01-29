/**
 * Example WebSocket client for TicTacToe game
 * 
 * This demonstrates how to connect and play the game
 * 
 * Usage:
 * 1. Start the backend server: npm start
 * 2. Run this client: node examples/client-example.js
 */

const WebSocket = require('ws');

class TicTacToeClient {
  constructor(url, playerName) {
    this.ws = new WebSocket(url);
    this.playerName = playerName;
    this.gameId = null;
    this.mySymbol = null;
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.on('open', () => {
      console.log(`[${this.playerName}] Connected to server`);
      this.joinGame();
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.handleMessage(message);
    });

    this.ws.on('close', () => {
      console.log(`[${this.playerName}] Disconnected from server`);
    });

    this.ws.on('error', (error) => {
      console.error(`[${this.playerName}] WebSocket error:`, error);
    });
  }

  handleMessage(message) {
    console.log(`\n[${this.playerName}] Received:`, message.type);
    
    switch (message.type) {
      case 'game_update':
        this.handleGameUpdate(message.payload);
        break;
        
      case 'game_over':
        this.handleGameOver(message.payload);
        break;
        
      case 'error':
        console.error(`[${this.playerName}] Error:`, message.payload.error);
        break;
        
      case 'player_left':
        console.log(`[${this.playerName}] Player left the game`);
        break;
    }
  }

  handleGameUpdate(game) {
    this.gameId = game.id;
    
    // Determine my symbol
    const player = game.players.find(p => p && p.name === this.playerName);
    if (player) {
      this.mySymbol = player.symbol;
    }
    
    console.log(`\n[${this.playerName}] Game State:`);
    console.log(`Game ID: ${game.id}`);
    console.log(`Status: ${game.status}`);
    console.log(`Current Turn: ${game.currentTurn}`);
    console.log(`My Symbol: ${this.mySymbol}`);
    this.printBoard(game.board);
    
    // Make a move if it's my turn and game is in progress
    if (game.status === 'in_progress' && game.currentTurn === this.mySymbol) {
      setTimeout(() => this.makeRandomMove(game.board), 1000);
    }
  }

  handleGameOver(payload) {
    console.log(`\n[${this.playerName}] ========== GAME OVER ==========`);
    console.log(`Result: ${payload.result}`);
    if (payload.winner) {
      const didIWin = payload.winner === this.mySymbol;
      console.log(`Winner: ${payload.winner} ${didIWin ? '(ME!)' : ''}`);
    } else {
      console.log('It\'s a draw!');
    }
    console.log('==============================\n');
  }

  printBoard(board) {
    console.log('\nBoard:');
    console.log('  0   1   2');
    for (let i = 0; i < 3; i++) {
      const row = board[i].map(cell => cell || ' ').join(' | ');
      console.log(`${i} ${row}`);
      if (i < 2) console.log('  ---------');
    }
    console.log('');
  }

  joinGame(gameId = null) {
    const message = {
      type: 'join_game',
      payload: {
        gameId: gameId,
        playerName: this.playerName
      }
    };
    
    this.ws.send(JSON.stringify(message));
    console.log(`[${this.playerName}] ${gameId ? 'Joining' : 'Creating'} game...`);
  }

  makeRandomMove(board) {
    const availableMoves = [];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          availableMoves.push({ row, col });
        }
      }
    }
    
    if (availableMoves.length === 0) return;
    
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
    console.log(`[${this.playerName}] Making move at (${move.row}, ${move.col})`);
    
    const message = {
      type: 'make_move',
      payload: move
    };
    
    this.ws.send(JSON.stringify(message));
  }
}

// Example: Create two clients to play against each other
function runExample() {
  console.log('=================================');
  console.log('TicTacToe Client Example');
  console.log('=================================\n');
  console.log('Creating two AI players...\n');
  
  // First player creates a game
  const player1 = new TicTacToeClient('ws://localhost:8080', 'Alice');
  
  // Second player creates a separate game after a short delay
  // NOTE: In this demo, both players create separate games for simplicity.
  // To make them play together, you would need to:
  // 1. Wait for player1's game_update message to get the gameId
  // 2. Pass that gameId to player2's joinGame() method
  // Example: player2.joinGame(gameIdFromPlayer1)
  setTimeout(() => {
    const player2 = new TicTacToeClient('ws://localhost:8080', 'Bob');
  }, 2000);
}

// Run the example
runExample();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});
