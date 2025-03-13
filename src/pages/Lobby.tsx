
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Copy, CheckCircle2, Users } from 'lucide-react';
import { useGameConnection } from '@/hooks/useGameConnection';

const Lobby: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { 
    connect, 
    connected, 
    gameState, 
    createGame, 
    joinGame,
    setReady 
  } = useGameConnection();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connect, connected]);

  // Handle room creation
  const handleCreateRoom = () => {
    if (!username.trim() || !connected) return;
    
    setIsCreatingRoom(true);
    createGame(username);
    setIsCreatingRoom(false);
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    if (!username.trim() || !roomCodeInput.trim() || !connected) return;
    
    setIsJoiningRoom(true);
    joinGame(roomCodeInput, username);
    setIsJoiningRoom(false);
  };

  // Handle copying room code
  const handleCopyRoomCode = () => {
    if (!gameState?.gameId) return;
    
    navigator.clipboard.writeText(gameState.gameId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Get current player from game state
  const currentPlayer = gameState?.players.find(p => p.id === gameState.players[0].id);

  // Toggle ready status
  const handleReady = () => {
    if (!currentPlayer) return;
    setReady(!currentPlayer.isReady);
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Game Lobby</h1>
                <p className="text-lg text-gray-600">
                  Create a new game or join an existing one
                </p>
              </div>
              
              {/* Connection indicator */}
              <div className="mb-6 flex justify-center">
                <div className={`px-3 py-1 text-sm inline-flex items-center rounded-full ${
                  connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    connected ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {connected ? 'Connected to Game Server' : 'Disconnected'}
                </div>
              </div>
              
              {!gameState ? (
                <div className="glass rounded-2xl p-8">
                  <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input 
                      id="username"
                      type="text"
                      placeholder="Enter your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Create Room</h3>
                      <Button 
                        onClick={handleCreateRoom} 
                        disabled={!username.trim() || isCreatingRoom || !connected}
                        className="w-full"
                      >
                        {isCreatingRoom ? (
                          <span className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full"></div>
                            Creating...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Room
                          </span>
                        )}
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Join Room</h3>
                      <div className="flex space-x-2">
                        <Input 
                          type="text"
                          placeholder="Enter room code"
                          value={roomCodeInput}
                          onChange={(e) => setRoomCodeInput(e.target.value)}
                        />
                        <Button 
                          onClick={handleJoinRoom} 
                          disabled={!username.trim() || !roomCodeInput.trim() || isJoiningRoom || !connected}
                        >
                          {isJoiningRoom ? 'Joining...' : 'Join'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Room: {gameState.gameId}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyRoomCode}
                      className="flex items-center"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Players ({gameState.players.length}/4)
                    </h3>
                    <div className="space-y-2">
                      {gameState.players.map((player, index) => (
                        <div 
                          key={player.id}
                          className={`flex items-center justify-between p-3 bg-background rounded-lg border ${
                            player.isReady ? 'border-green-500' : 'border-gray-200'
                          }`}
                        >
                          <span className="font-medium">
                            {player.name}
                            {index === 0 ? ' (Host)' : ''}
                          </span>
                          <div className="flex items-center">
                            {!player.isConnected && (
                              <span className="mr-2 text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                Reconnecting...
                              </span>
                            )}
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              player.isReady 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {player.isReady ? 'Ready' : 'Not Ready'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <Button
                      variant={currentPlayer?.isReady ? "outline" : "default"}
                      onClick={handleReady}
                      className="flex-1"
                      disabled={!connected}
                    >
                      {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </TransitionEffect>
  );
};

export default Lobby;

