
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState, Player } from '@/lib/gameTypes';
import { toast } from '@/hooks/use-toast';

// Define message types for WebSocket communication
export interface GameMessage {
  type: 'JOIN_GAME' | 'LEAVE_GAME' | 'PLAYER_READY' | 'START_GAME' | 'ASSIGN_ROLES' |
        'REVEAL_ROLE' | 'MAKE_GUESS' | 'ROUND_END' | 'GAME_END' | 'ERROR' | 'GAME_STATE';
  payload: any;
  gameId?: string;
  playerId?: string;
}

// This would be replaced with your actual backend URL in production
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export function useGameConnection() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize WebSocket connection
  useEffect(() => {
    // For demonstration purposes, generate a random player ID
    // In a real app, this would come from authentication
    if (!playerId) {
      setPlayerId(`player-${Math.floor(Math.random() * 1000)}`);
    }
    
    return () => {
      // Clean up socket on unmount
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Connect to game server
  const connect = useCallback(() => {
    if (socket) return; // Already connected

    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        setSocket(ws);
        setConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to game server",
        });
      };
      
      ws.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'GAME_STATE':
              setGameState(message.payload as GameState);
              break;
            case 'ERROR':
              toast({
                title: "Game Error",
                description: message.payload.message,
                variant: "destructive"
              });
              break;
            case 'GAME_END':
              // Handle game end if needed
              break;
            default:
              console.log('Received message:', message);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
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
      
      return ws;
    } catch (err) {
      console.error('Failed to connect:', err);
      return null;
    }
  }, [socket, playerId]);

  // Send message to server
  const sendMessage = useCallback((type: GameMessage['type'], payload: any = {}, gameId?: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
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
      gameId,
      playerId
    };
    
    socket.send(JSON.stringify(message));
    return true;
  }, [socket, playerId]);

  // Join a game room
  const joinGame = useCallback((gameId: string, playerName: string) => {
    const success = sendMessage('JOIN_GAME', { gameId, playerName });
    if (success) {
      navigate(`/game?id=${gameId}`);
    }
    return success;
  }, [sendMessage, navigate]);

  // Create a new game room
  const createGame = useCallback((playerName: string) => {
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
    return sendMessage('PLAYER_READY', { ready }, gameState.gameId);
  }, [sendMessage, gameState]);

  // Make a guess (for Sipahi)
  const makeGuess = useCallback((targetPlayerId: string) => {
    if (!gameState) return false;
    return sendMessage('MAKE_GUESS', { targetPlayerId }, gameState.gameId);
  }, [sendMessage, gameState]);

  // Start the game (for room creator)
  const startGame = useCallback(() => {
    if (!gameState) return false;
    return sendMessage('START_GAME', {}, gameState.gameId);
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

