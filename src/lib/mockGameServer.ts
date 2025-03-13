
import { Player, GameState, GameRole, ROLE_POINTS } from './gameTypes';

// This simulates a WebSocket server in the browser
// In a real application, this would be a separate backend service

type ClientHandler = (message: string) => void;
type ClientConnection = {
  id: string;
  name: string;
  handler: ClientHandler;
  isConnected: boolean;
};

interface MockServerState {
  games: Map<string, GameState>;
  clients: Map<string, ClientConnection>;
}

class MockGameServer {
  private static instance: MockGameServer;
  private state: MockServerState = {
    games: new Map(),
    clients: new Map(),
  };

  private constructor() {}

  public static getInstance(): MockGameServer {
    if (!MockGameServer.instance) {
      MockGameServer.instance = new MockGameServer();
    }
    return MockGameServer.instance;
  }

  // Simulate a client connecting to the server
  public connect(clientId: string, handler: ClientHandler): WebSocket {
    // Create fake WebSocket interface
    const mockWs = {
      send: (message: string) => {
        // Handle message from client
        this.handleClientMessage(clientId, message);
      },
      close: () => {
        this.disconnectClient(clientId);
      },
      onmessage: (evt: any) => {},
      onclose: (evt: any) => {},
      onopen: (evt: any) => {},
      onerror: (evt: any) => {},
      readyState: 1,
      OPEN: 1 as const,
    };

    // Store client connection
    const existingClient = this.state.clients.get(clientId);
    if (existingClient) {
      existingClient.handler = handler;
      existingClient.isConnected = true;
      this.state.clients.set(clientId, existingClient);
      
      // Update player connection status in any games they're in
      this.updatePlayerConnectionStatus(clientId, true);
      
      // Send the game state back if they were in a game
      const game = this.findGameByPlayerId(clientId);
      if (game) {
        setTimeout(() => {
          this.sendToClient(clientId, {
            type: 'GAME_STATE',
            payload: game,
          });
        }, 500);
      }
    } else {
      this.state.clients.set(clientId, {
        id: clientId,
        name: '',
        handler,
        isConnected: true,
      });
    }

    // Simulate connection established
    setTimeout(() => {
      mockWs.onopen({});
    }, 100);

    return mockWs as unknown as WebSocket;
  }

  private findGameByPlayerId(playerId: string): GameState | undefined {
    for (const game of this.state.games.values()) {
      const playerInGame = game.players.find(p => p.id === playerId);
      if (playerInGame) {
        return game;
      }
    }
    return undefined;
  }

  private disconnectClient(clientId: string) {
    const client = this.state.clients.get(clientId);
    if (client) {
      client.isConnected = false;
      this.state.clients.set(clientId, client);
      
      // Update the player's connection status in any games
      this.updatePlayerConnectionStatus(clientId, false);
    }
  }

  private updatePlayerConnectionStatus(playerId: string, isConnected: boolean) {
    // Find any games this player is in and update their connection status
    for (const [gameId, gameState] of this.state.games.entries()) {
      const playerIndex = gameState.players.findIndex(p => p.id === playerId);
      if (playerIndex >= 0) {
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          isConnected
        };
        
        const updatedGame = {
          ...gameState,
          players: updatedPlayers
        };
        
        this.state.games.set(gameId, updatedGame);
        
        // Broadcast the updated game state to all players in this game
        this.broadcastGameState(gameId);
      }
    }
  }

  private handleClientMessage(clientId: string, message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, payload, gameId, playerId } = parsedMessage;

      switch (type) {
        case 'JOIN_GAME':
          this.handleJoinGame(clientId, payload);
          break;
        case 'PLAYER_READY':
          this.handlePlayerReady(gameId, playerId, payload.ready);
          break;
        case 'START_GAME':
          this.handleStartGame(gameId);
          break;
        case 'MAKE_GUESS':
          this.handleMakeGuess(gameId, playerId, payload.targetPlayerId);
          break;
        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  }

  private handleJoinGame(clientId: string, payload: any) {
    const { gameId, playerName, isCreator = false } = payload;
    const client = this.state.clients.get(clientId);
    
    if (!client) return;
    
    // Update client name
    client.name = playerName;
    this.state.clients.set(clientId, client);
    
    // Check if game exists
    let game = this.state.games.get(gameId);
    
    if (!game) {
      // Create new game if it doesn't exist
      game = {
        gameId,
        round: 1,
        totalRounds: 7,
        players: [],
        status: 'waiting',
      };
      this.state.games.set(gameId, game);
    }
    
    // Check if player is already in the game
    const existingPlayerIndex = game.players.findIndex(p => p.id === clientId);
    
    if (existingPlayerIndex >= 0) {
      // Update existing player
      game.players[existingPlayerIndex].isConnected = true;
      game.players[existingPlayerIndex].name = playerName;
    } else {
      // Add new player
      game.players.push({
        id: clientId,
        name: playerName,
        score: 0,
        isReady: false,
        isConnected: true,
      });
    }
    
    // Update game state
    this.state.games.set(gameId, game);
    
    // Broadcast updated game state
    this.broadcastGameState(gameId);
  }

  private handlePlayerReady(gameId: string, playerId: string, ready: boolean) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    // Find player and update ready status
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex >= 0) {
      game.players[playerIndex].isReady = ready;
      this.state.games.set(gameId, game);
      
      // Broadcast updated game state
      this.broadcastGameState(gameId);
    }
  }

  private handleStartGame(gameId: string) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    // Check if all players are ready
    if (!game.players.every(p => p.isReady)) {
      return;
    }
    
    // Start the game
    const updatedGame: GameState = {
      ...game,
      status: 'assigning-roles'
    };
    
    this.state.games.set(gameId, updatedGame);
    
    // Broadcast game state
    this.broadcastGameState(gameId);
    
    // Simulate role assignment
    setTimeout(() => {
      this.assignRoles(gameId);
    }, 2000);
  }

  private assignRoles(gameId: string) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    const roles: GameRole[] = ['Raja', 'Mantri', 'Chor', 'Sipahi'];
    
    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    // Assign roles to players
    const updatedPlayers = game.players.map((player, index) => ({
      ...player,
      role: roles[index % roles.length],
    }));
    
    // Update game state
    const updatedGame: GameState = {
      ...game,
      players: updatedPlayers,
      status: 'revealing-roles'
    };
    
    this.state.games.set(gameId, updatedGame);
    
    // Broadcast updated state
    this.broadcastGameState(gameId);
    
    // After role reveal, transition to making-guess phase
    setTimeout(() => {
      this.transitionToGuessingPhase(gameId);
    }, 5000);
  }

  private transitionToGuessingPhase(gameId: string) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    const updatedGame: GameState = {
      ...game,
      status: 'making-guess'
    };
    
    this.state.games.set(gameId, updatedGame);
    
    // Broadcast updated state
    this.broadcastGameState(gameId);
  }

  private handleMakeGuess(gameId: string, sipahiId: string, targetPlayerId: string) {
    const game = this.state.games.get(gameId);
    if (!game || game.status !== 'making-guess') return;
    
    // Find Sipahi
    const sipahi = game.players.find(p => p.id === sipahiId);
    if (!sipahi || sipahi.role !== 'Sipahi') return;
    
    // Find target player
    const targetPlayer = game.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;
    
    // Check if the guess is correct
    const isCorrectGuess = targetPlayer.role === 'Chor';
    
    // Calculate round scores
    const updatedPlayers = game.players.map(player => {
      let roundScore = 0;
      
      if (isCorrectGuess) {
        // Sipahi guessed correctly, normal scoring
        roundScore = player.role ? ROLE_POINTS[player.role] : 0;
      } else {
        // Sipahi guessed incorrectly, Chor gets Sipahi points
        if (player.role === 'Chor') {
          roundScore = ROLE_POINTS['Sipahi'];
        } else if (player.role === 'Sipahi') {
          roundScore = 0;
        } else {
          roundScore = player.role ? ROLE_POINTS[player.role] : 0;
        }
      }
      
      return {
        ...player,
        score: player.score + roundScore,
      };
    });
    
    // Find the current leader
    let highestScore = -1;
    let winner: Player | undefined;
    
    for (const player of updatedPlayers) {
      if (player.score > highestScore) {
        highestScore = player.score;
        winner = player;
      }
    }
    
    // Update game state to round-end
    const updatedGame: GameState = {
      ...game,
      players: updatedPlayers,
      status: 'round-end',
      winner: winner,
    };
    
    this.state.games.set(gameId, updatedGame);
    
    // Broadcast updated state
    this.broadcastGameState(gameId);
    
    // After short delay, start the next round or end the game
    setTimeout(() => {
      this.startNextRoundOrEndGame(gameId);
    }, 5000);
  }

  private startNextRoundOrEndGame(gameId: string) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    if (game.round >= game.totalRounds) {
      // This was the last round, end the game
      const updatedGame: GameState = {
        ...game,
        status: 'game-end',
      };
      
      this.state.games.set(gameId, updatedGame);
      this.broadcastGameState(gameId);
    } else {
      // Reset for next round
      const updatedGame: GameState = {
        ...game,
        round: game.round + 1,
        status: 'assigning-roles',
      };
      
      this.state.games.set(gameId, updatedGame);
      this.broadcastGameState(gameId);
      
      // Assign new roles
      setTimeout(() => {
        this.assignRoles(gameId);
      }, 2000);
    }
  }

  private broadcastGameState(gameId: string) {
    const game = this.state.games.get(gameId);
    if (!game) return;
    
    // Send game state to all players in the game
    for (const player of game.players) {
      this.sendToClient(player.id, {
        type: 'GAME_STATE',
        payload: game,
      });
    }
  }

  private sendToClient(clientId: string, message: any) {
    const client = this.state.clients.get(clientId);
    if (!client || !client.isConnected) return;
    
    try {
      client.handler(JSON.stringify(message));
    } catch (err) {
      console.error(`Error sending to client ${clientId}:`, err);
    }
  }
}

export default MockGameServer;
