
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GameState, Player } from '@/lib/gameTypes';
import { toast } from '@/hooks/use-toast';
import MockGameServer from '@/lib/mockGameServer';

// Define message types for WebSocket communication
export interface GameMessage {
  type: 'JOIN_GAME' | 'LEAVE_GAME' | 'PLAYER_READY' | 'START_GAME' | 'ASSIGN_ROLES' |
        'REVEAL_ROLE' | 'MAKE_GUESS' | 'ROUND_END' | 'GAME_END' | 'ERROR' | 'GAME_STATE';
  payload: any;
  gameId?: string;
  playerId?: string;
}

export function useGameConnection() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const mockServer = useRef(MockGameServer.getInstance());
  const navigate = useNavigate();
  
  // Initialize player ID from local storage or generate new one
  useEffect(() => {
    // Try to get existing player ID from localStorage
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      // Generate a new player ID
      const newPlayerId = `player-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem('playerId', newPlayerId);
      setPlayerId(newPlayerId);
    }
  }, []);

  // Connect to game server
  const connect = useCallback(() => {
    if (socket || !playerId) return; // Already connected or no player ID

    try {
      // Use our mock server instead of a real WebSocket connection
      const ws = mockServer.current.connect(playerId, (message: string) => {
        // This is the message handler that will be called by the mock server
        try {
          const parsedMessage = JSON.parse(message);
          
          switch (parsedMessage.type) {
            case 'GAME_STATE':
              setGameState(parsedMessage.payload as GameState);
              break;
            case 'ERROR':
              toast({
                title: "Game Error",
                description: parsedMessage.payload.message,
                variant: "destructive"
              });
              break;
            default:
              console.log('Received message:', parsedMessage);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      });
      
      ws.onopen = () => {
        setSocket(ws);
        setConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to game server",
        });
        
        // If we have a game ID in URL, join that game
        if (gameId) {
          // Get player name from localStorage or use a default
          const playerName = localStorage.getItem('playerName') || 'Player ' + playerId.substring(7);
          sendMessage('JOIN_GAME', { gameId, playerName });
        }
      };
      
      ws.onclose = () => {
        setSocket(null);
        setConnected(false);
        toast({
          title: "Disconnected",
          description: "Connection to game server lost",
          variant: "destructive"
        });
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to game server",
          variant: "destructive"
        });
      };
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  }, [socket, playerId, gameId]);

  // Auto-reconnect logic
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (!connected && playerId) {
        console.log('Attempting to reconnect...');
        connect();
      }
    }, 5000); // Try to reconnect every 5 seconds
    
    return () => clearInterval(reconnectInterval);
  }, [connected, playerId, connect]);

  // Send message to server
  const sendMessage = useCallback((type: GameMessage['type'], payload: any = {}, gameIdOverride?: string) => {
    if (!socket) {
      toast({
        title: "Not Connected",
        description: "Please wait for connection to be established",
        variant: "destructive"
      });
      return false;
    }
    
    const message: GameMessage = {
      type,
      payload,
      gameId: gameIdOverride || gameId || undefined,
      playerId
    };
    
    socket.send(JSON.stringify(message));
    return true;
  }, [socket, playerId, gameId]);

  // Join a game room
  const joinGame = useCallback((gameId: string, playerName: string) => {
    // Store player name for reconnections
    localStorage.setItem('playerName', playerName);
    
    const success = sendMessage('JOIN_GAME', { gameId, playerName });
    if (success) {
      navigate(`/game?id=${gameId}`);
    }
    return success;
  }, [sendMessage, navigate]);

  // Create a new game room
  const createGame = useCallback((playerName: string) => {
    // Store player name for reconnections
    localStorage.setItem('playerName', playerName);
    
    const gameId = `game-${Math.random().toString(36).substring(2, 9)}`;
    const success = sendMessage('JOIN_GAME', { gameId, playerName, isCreator: true });
    if (success) {
      navigate(`/game?id=${gameId}`);
    }
    return success;
  }, [sendMessage, navigate]);

  // Set player ready status
  const setReady = useCallback((ready: boolean) => {
    if (!gameState) return false;
    return sendMessage('PLAYER_READY', { ready });
  }, [sendMessage, gameState]);

  // Make a guess (for Sipahi)
  const makeGuess = useCallback((targetPlayerId: string) => {
    if (!gameState) return false;
    return sendMessage('MAKE_GUESS', { targetPlayerId });
  }, [sendMessage, gameState]);

  // Start the game (for room creator)
  const startGame = useCallback(() => {
    if (!gameState) return false;
    return sendMessage('START_GAME', {});
  }, [sendMessage, gameState]);

  return {
    connect,
    connected,
    gameState,
    playerId,
    joinGame,
    createGame,
    setReady,
    makeGuess,
    startGame
  };
}
