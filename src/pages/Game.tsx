import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RoleCard from '@/components/RoleCard';
import ConnectionStatus from '@/components/ConnectionStatus';
import ShareGame from '@/components/ShareGame';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { GameRole, GameState, Player, ROLE_POINTS } from '@/lib/gameTypes';
import { useGameConnection } from '@/hooks/useGameConnection';
import { toast } from '@/hooks/use-toast';

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const {
    connect,
    connected,
    gameState,
    playerId,
    setReady,
    makeGuess,
    startGame
  } = useGameConnection();
  
  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connect, connected]);
  
  useEffect(() => {
    if (!gameId) {
      toast({
        title: "Missing Game ID",
        description: "No game ID was provided. Please join from the lobby.",
        variant: "destructive"
      });
    }
  }, [gameId]);
  
  useEffect(() => {
    if (gameState?.status === 'revealing-roles') {
      setShowRoleReveal(true);
      setCountdown(5);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setShowRoleReveal(false);
    }
  }, [gameState?.status]);
  
  const currentPlayer = gameState?.players.find(player => player.id === playerId);
  
  const handlePlayerSelect = (targetPlayerId: string) => {
    if (gameState?.status !== 'making-guess' || currentPlayer?.role !== 'Sipahi') return;
    setSelectedPlayer(targetPlayerId);
  };
  
  const handleSubmitGuess = () => {
    if (!selectedPlayer || !gameState || currentPlayer?.role !== 'Sipahi') return;
    makeGuess(selectedPlayer);
    setSelectedPlayer(null);
  };
  
  const handleReady = () => {
    if (!currentPlayer) return;
    setReady(!currentPlayer.isReady);
  };
  
  const handleStartGame = () => {
    startGame();
  };
  
  if (!gameState) {
    return (
      <TransitionEffect>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="glass p-8 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Connecting to Game</h2>
                <div className="flex justify-center">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
                    <div className="h-12 w-12 bg-primary/30 rounded-full"></div>
                    <div className="h-12 w-12 bg-primary/40 rounded-full"></div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">Waiting for game data...</p>
              </div>
            </div>
          </main>
        </div>
      </TransitionEffect>
    );
  }
  
  const renderGameContent = () => {
    switch (gameState.status) {
      case 'waiting':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Waiting for Players</h2>
            
            {gameState.players.length < 4 && (
              <ShareGame gameId={gameState.gameId} className="mb-8" />
            )}
            
            <div className="glass p-6 rounded-xl mb-8">
              <h3 className="text-xl font-medium mb-4">Players</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.players.map(player => (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-lg border ${
                      player.isReady ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        {player.name} {player.id === playerId ? '(You)' : ''}
                      </p>
                      <div className="flex items-center space-x-2">
                        <ConnectionStatus 
                          connected={player.isConnected} 
                          className="text-xs py-0.5 px-2"
                        />
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          player.isReady 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {player.isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {gameState.players.length < 4 && (
                <p className="mt-4 text-gray-600">
                  Waiting for {4 - gameState.players.length} more players...
                </p>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
              <Button
                variant={currentPlayer?.isReady ? "outline" : "default"}
                onClick={handleReady}
                className="flex-1"
              >
                {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
              </Button>
              
              {gameState.players[0]?.id === playerId && gameState.players.length >= 4 && (
                <Button
                  onClick={handleStartGame}
                  disabled={!gameState.players.every(p => p.isReady)}
                  className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/20"
                >
                  Start Game
                </Button>
              )}
            </div>
          </div>
        );
      
      case 'assigning-roles':
      case 'revealing-roles':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Round {gameState.round} of {gameState.totalRounds}</h2>
            
            <AnimatePresence>
              {showRoleReveal && currentPlayer?.role ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-sm mx-auto"
                >
                  <p className="mb-6 text-lg">Your role for this round:</p>
                  <RoleCard 
                    role={currentPlayer.role as GameRole} 
                    revealed={true}
                    className="h-[300px] mx-auto"
                  />
                  {countdown !== null && (
                    <p className="mt-4 text-gray-600">
                      Continuing in {countdown}...
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10"
                >
                  <div className="glass p-8 rounded-xl max-w-md mx-auto">
                    <h3 className="text-xl font-medium mb-4">Assigning Roles</h3>
                    <div className="flex justify-center">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-12 w-12 bg-primary/20 rounded-full"></div>
                        <div className="h-12 w-12 bg-primary/30 rounded-full"></div>
                        <div className="h-12 w-12 bg-primary/40 rounded-full"></div>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">Shuffling roles...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
        
      case 'making-guess':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Round {gameState.round} of {gameState.totalRounds}</h2>
            <p className="mb-6 text-lg">
              {currentPlayer?.role === 'Sipahi' ? 
                'You are the Sipahi. Select who you think is the Chor.' :
                'Waiting for the Sipahi to make a guess...'}
            </p>
            
            <div className="max-w-xl mx-auto">
              <div className="glass p-6 rounded-xl mb-6">
                <h3 className="text-xl font-medium mb-4">Your Role</h3>
                {currentPlayer?.role ? (
                  <RoleCard 
                    role={currentPlayer.role as GameRole} 
                    revealed={true}
                    className="h-[200px] max-w-xs mx-auto"
                  />
                ) : (
                  <p>Role not assigned</p>
                )}
              </div>
              
              {currentPlayer?.role === 'Sipahi' && (
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4">Select the Chor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gameState.players.filter(p => p.id !== playerId).map(player => (
                      <div 
                        key={player.id}
                        onClick={() => handlePlayerSelect(player.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedPlayer === player.id 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <p className="font-medium">{player.name}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleSubmitGuess}
                    disabled={!selectedPlayer}
                    className="mt-6"
                  >
                    Submit Guess
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'round-end':
        return (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Round {gameState.round} Complete</h2>
            <p className="mb-8 text-lg">The Sipahi's guess was correct!</p>
            
            <div className="glass p-6 rounded-xl max-w-2xl mx-auto">
              <h3 className="text-xl font-medium mb-6">Round Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gameState.players.map(player => (
                  <div key={player.id} className="text-center">
                    <div className="font-medium mb-1">
                      {player.name} {player.id === playerId ? '(You)' : ''}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {player.role || 'Unknown Role'}
                    </div>
                    <div className="text-xl font-bold">{player.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
        
      case 'game-end':
        return (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Game Complete!</h2>
            
            <div className="glass p-8 rounded-xl max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-medium mb-6">Final Scores</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gameState.players.map(player => (
                  <motion.div 
                    key={player.id}
                    className={`text-center p-4 rounded-lg ${
                      gameState.winner?.id === player.id ? 'bg-primary/20' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="font-medium mb-1">
                      {player.name} {player.id === playerId ? '(You)' : ''}
                    </div>
                    <div className="text-2xl font-bold">{player.score}</div>
                    {gameState.winner?.id === player.id && (
                      <div className="mt-2 text-sm text-primary font-medium">Winner!</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <Button onClick={() => window.location.href = '/lobby'}>
              Back to Lobby
            </Button>
          </motion.div>
        );
        
      default:
        return (
          <div className="text-center">
            <p>Waiting for game to start...</p>
          </div>
        );
    }
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex justify-between items-center p-4 glass rounded-xl">
                <div>
                  <span className="text-sm font-medium text-gray-600">Room:</span>
                  <span className="ml-2 font-medium">{gameState.gameId}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Round:</span>
                  <span className="ml-2 font-medium">{gameState.round} of {gameState.totalRounds}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">
                    {gameState.status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto mb-4">
              <div className={`px-3 py-1 text-sm inline-flex items-center rounded-full ${
                connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                {connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {renderGameContent()}
            </div>
          </div>
        </main>
      </div>
    </TransitionEffect>
  );
};

export default Game;
