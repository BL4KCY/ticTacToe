# TicTacToe Multiplayer Backend

A TypeScript-based multiplayer TicTacToe backend game with WebSocket support for real-time gameplay.

## Features

- ✅ Real-time multiplayer gameplay using WebSockets
- ✅ RESTful API for game queries
- ✅ Room-based game management
- ✅ Automatic player disconnect handling
- ✅ Full TypeScript type safety
- ✅ Easy to extend and customize

## Architecture

The backend consists of:

1. **Game Logic** (`src/game/TicTacToeGame.ts`) - Core game rules and board management
2. **Game Manager** (`src/game/GameManager.ts`) - Manages multiple game instances
3. **WebSocket Server** (`src/server/WebSocketServer.ts`) - Real-time communication
4. **HTTP API Server** (`src/server/APIServer.ts`) - RESTful API endpoints

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Configuration

Environment variables:
- `WS_PORT` - WebSocket server port (default: 8080)
- `API_PORT` - HTTP API server port (default: 3000)

## API Endpoints

### HTTP REST API

- `GET /health` - Health check
- `GET /api` - API information and documentation
- `GET /api/games/waiting` - List all games waiting for players
- `GET /api/games/:gameId` - Get specific game details

### WebSocket Messages

Connect to `ws://localhost:8080`

#### Client → Server Messages

**Join/Create Game:**
```json
{
  "type": "join_game",
  "payload": {
    "gameId": "optional-game-id",
    "playerName": "Player Name"
  }
}
```

**Make Move:**
```json
{
  "type": "make_move",
  "payload": {
    "row": 0,
    "col": 1
  }
}
```

#### Server → Client Messages

**Game Update:**
```json
{
  "type": "game_update",
  "gameId": "game-id",
  "payload": {
    "id": "game-id",
    "board": [[null, null, null], [null, null, null], [null, null, null]],
    "players": [...],
    "currentTurn": "X",
    "status": "in_progress",
    "result": null,
    "winner": null
  }
}
```

**Game Over:**
```json
{
  "type": "game_over",
  "gameId": "game-id",
  "payload": {
    "result": "win",
    "winner": "X"
  }
}
```

**Error:**
```json
{
  "type": "error",
  "payload": {
    "error": "Error message"
  }
}
```

**Player Left:**
```json
{
  "type": "player_left",
  "gameId": "game-id",
  "payload": {
    "playerId": "player-id"
  }
}
```

## Game Flow

1. **Create Game**: First player sends `join_game` without gameId
2. **Join Game**: Second player sends `join_game` with the gameId
3. **Play**: Players alternate sending `make_move` messages
4. **Game End**: Server broadcasts `game_over` when game finishes

## Project Structure

```
src/
├── types/
│   └── index.ts          # TypeScript types and interfaces
├── game/
│   ├── TicTacToeGame.ts  # Core game logic
│   └── GameManager.ts    # Game instance manager
├── server/
│   ├── WebSocketServer.ts # WebSocket server
│   └── APIServer.ts       # HTTP API server
└── index.ts               # Main entry point
```

## Example Client Usage

```typescript
const ws = new WebSocket('ws://localhost:8080');

// Create/Join game
ws.send(JSON.stringify({
  type: 'join_game',
  payload: {
    playerName: 'Alice'
  }
}));

// Make a move
ws.send(JSON.stringify({
  type: 'make_move',
  payload: {
    row: 1,
    col: 1
  }
}));

// Listen for updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## License

MIT
