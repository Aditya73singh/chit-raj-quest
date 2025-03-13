import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RoleCard from '@/components/RoleCard';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { GameRole, GameState, Player, ROLE_POINTS } from '@/lib/gameTypes';

const Game: React.FC = () => {
  // Mock initial game state
  const [gameState, setGameState] = useState<GameState>({
    gameId: 'game-123',
    round: 1,
    totalRounds: 7,
    status: 'assigning-roles',
    players: [
      { id: 'p1', name: 'You', score: 0, isReady: true, isConnected: true, role: 'Raja' },
      { id: 'p2', name: 'Alex', score: 0, isReady: true, isConnected: true },
      { id: 'p3', name: 'Taylor', score: 0, isReady: true, isConnected: true },
      { id: 'p4', name: 'Jordan', score: 0, isReady: true, isConnected: true },
    ]
  });
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Progress the game simulation
  useEffect(() => {
    if (gameState.status === 'assigning-roles') {
      // Simulate role assignment
      setTimeout(() => {
        setShowRoleReveal(true);
        setCountdown(5);
        
        // Count down
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(timer);
              
              // After revealing, move to next stage
              setTimeout(() => {
                setShowRoleReveal(false);
                setGameState(prev => ({
                  ...prev,
                  status: 'making-guess'
                }));
              }, 1500);
              
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }, 1500);
    }
  }, [gameState.status]);

  // Handle player selection for guessing
  const handlePlayerSelect = (playerId: string) => {
    if (gameState.status !== 'making-guess') return;
    setSelectedPlayer(playerId);
  };

  // Handle submitting a guess
  const handleSubmitGuess = () => {
    if (!selectedPlayer) return;
    
    // In a real game, this would send the guess to the server
    // For this demo, we'll just simulate a correct guess
    
    // Simulate the end of the round with updated scores
    setTimeout(() => {
      setGameState(prev => {
        const updatedPlayers = prev.players.map(player => {
          if (player.id === 'p1') { // The user's player
            return { ...player, score: player.score + ROLE_POINTS[player.role as GameRole] };
          }
          return player;
        });
        
        return {
          ...prev,
          status: 'round-end',
          players: updatedPlayers
        };
      });
      
      // After showing results, move to the next round
      setTimeout(() => {
        setGameState(prev => {
          // Check if we've reached the final round
          if (prev.round >= prev.totalRounds) {
            // Find winner
            const winner = [...prev.players].sort((a, b) => b.score - a.score)[0];
            return {
              ...prev,
              status: 'game-end',
              winner
            };
          }
          
          // Otherwise, next round
          return {
            ...prev,
            round: prev.round + 1,
            status: 'assigning-roles'
          };
        });
        
        setSelectedPlayer(null);
      }, 3000);
    }, 1000);
  };

  // Render different views based on game state
  const renderGameContent = () => {
    switch (gameState.status) {
      case 'assigning-roles':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Round {gameState.round} of {gameState.totalRounds}</h2>
            
            <AnimatePresence>
              {showRoleReveal ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-sm mx-auto"
                >
                  <p className="mb-6 text-lg">Your role for this round:</p>
                  <RoleCard 
                    role={gameState.players[0].role as GameRole} 
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
              {gameState.players[0].role === 'Sipahi' ? 
                'You are the Sipahi. Select who you think is the Chor.' :
                'Waiting for the Sipahi to make a guess...'}
            </p>
            
            <div className="max-w-xl mx-auto">
              <div className="glass p-6 rounded-xl mb-6">
                <h3 className="text-xl font-medium mb-4">Your Role</h3>
                <RoleCard 
                  role={gameState.players[0].role as GameRole} 
                  revealed={true}
                  className="h-[200px] max-w-xs mx-auto"
                />
              </div>
              
              {gameState.players[0].role === 'Sipahi' && (
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4">Select the Chor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gameState.players.slice(1).map(player => (
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
                    <div className="font-medium mb-1">{player.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {player.id === 'p1' ? gameState.players[0].role : 'Role Hidden'}
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
                    <div className="font-medium mb-1">{player.name}</div>
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
            {/* Game status bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex justify-between items-center p-4 glass rounded-xl">
                <div>
                  <span className="text-sm font-medium text-gray-600">Room:</span>
                  <span className="ml-2 font-medium">GAME1234</span>
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
            
            {/* Main game content */}
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
