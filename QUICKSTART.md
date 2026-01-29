# TicTacToe Backend - Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Testing the Backend

### Option 1: Using the Example Client

Run the provided example client (requires the server to be running):

```bash
node examples/client-example.js
```

This will simulate two AI players creating and playing games.

### Option 2: Using curl/HTTPie for REST API

Check server health:
```bash
curl http://localhost:3000/health
```

Get API information:
```bash
curl http://localhost:3000/api
```

List waiting games:
```bash
curl http://localhost:3000/api/games/waiting
```

### Option 3: Using WebSocket Client

You can use any WebSocket client tool or library. Here's a simple Node.js example:

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  // Create a new game
  ws.send(JSON.stringify({
    type: 'join_game',
    payload: {
      playerName: 'Player 1'
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
  
  if (message.type === 'game_update' && message.payload.status === 'in_progress') {
    // Make a move (row 1, col 1)
    ws.send(JSON.stringify({
      type: 'make_move',
      payload: {
        row: 1,
        col: 1
      }
    }));
  }
});
```

## Game Flow

### 1. Player 1 Creates a Game

Send a `join_game` message without `gameId`:

```json
{
  "type": "join_game",
  "payload": {
    "playerName": "Alice"
  }
}
```

**Response:** Game update with status "waiting" and a `gameId`

### 2. Player 2 Joins the Game

Send a `join_game` message with the `gameId` from step 1:

```json
{
  "type": "join_game",
  "payload": {
    "gameId": "abc-123-def-456",
    "playerName": "Bob"
  }
}
```

**Response:** Game update with status "in_progress"

### 3. Players Make Moves

Players take turns sending `make_move` messages:

```json
{
  "type": "make_move",
  "payload": {
    "row": 0,
    "col": 1
  }
}
```

- `row` and `col` are 0-indexed (0-2)
- Players must wait for their turn
- Invalid moves will return an error

### 4. Game Ends

When someone wins or the board is full, the server sends a `game_over` message:

```json
{
  "type": "game_over",
  "gameId": "abc-123-def-456",
  "payload": {
    "result": "win",
    "winner": "X"
  }
}
```

## Board Coordinates

The board uses 0-indexed coordinates:

```
     Col 0   Col 1   Col 2
Row 0   0,0  |  0,1  |  0,2
       ----- | ----- | -----
Row 1   1,0  |  1,1  |  1,2
       ----- | ----- | -----
Row 2   2,0  |  2,1  |  2,2
```

## Message Types Reference

### Client → Server

| Type | Description | Required Payload |
|------|-------------|------------------|
| `join_game` | Create or join a game | `{ playerName, gameId? }` |
| `make_move` | Make a move | `{ row, col }` |

### Server → Client

| Type | Description | Payload |
|------|-------------|---------|
| `game_update` | Game state changed | Full game state |
| `game_over` | Game finished | `{ result, winner? }` |
| `error` | Error occurred | `{ error }` |
| `player_left` | Player disconnected | `{ playerId }` |

## Environment Variables

Configure the server with environment variables:

```bash
# WebSocket server port (default: 8080)
WS_PORT=8080

# HTTP API server port (default: 3000)
API_PORT=3000
```

Example:
```bash
WS_PORT=9000 API_PORT=4000 npm start
```

## Troubleshooting

**Port already in use:**
- Change the ports using environment variables
- Or stop the process using the port: `lsof -ti:8080 | xargs kill`

**Cannot connect:**
- Make sure the server is running
- Check firewall settings
- Verify the correct port numbers

**Game not starting:**
- Both players must join before the game starts
- Check that you're sending valid JSON messages
- Look at server logs for error messages

## Next Steps

- Implement a frontend client (React, Vue, etc.)
- Add authentication and user accounts
- Implement matchmaking
- Add game history and statistics
- Add AI opponent mode
- Implement different board sizes
