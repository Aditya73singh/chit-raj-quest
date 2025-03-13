
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Copy, CheckCircle2, Clock, Users } from 'lucide-react';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [waitingPlayers, setWaitingPlayers] = useState<string[]>([
    'Player 1 (You)', 'Player 2', 'Player 3'
  ]);
  const [isReady, setIsReady] = useState(false);

  // Mock function for room creation
  const handleCreateRoom = () => {
    if (!username.trim()) return;
    setIsCreatingRoom(true);
    setRoomCode('GAME' + Math.floor(1000 + Math.random() * 9000));
    
    // Simulate waiting for players
    setTimeout(() => {
      setIsCreatingRoom(false);
    }, 1000);
  };

  // Mock function for joining a room
  const handleJoinRoom = () => {
    if (!username.trim() || !roomCode.trim()) return;
    setIsJoiningRoom(true);
    
    // Simulate joining
    setTimeout(() => {
      setIsJoiningRoom(false);
      setRoomCode('GAME' + Math.floor(1000 + Math.random() * 9000));
    }, 1000);
  };

  // Mock function to copy room code
  const handleCopyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Mock function to start the game
  const handleStartGame = () => {
    navigate('/game');
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
              
              {!roomCode ? (
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
                        disabled={!username.trim() || isCreatingRoom}
                        className="w-full"
                      >
                        {isCreatingRoom ? (
                          <span className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
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
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value)}
                        />
                        <Button 
                          onClick={handleJoinRoom} 
                          disabled={!username.trim() || !roomCode.trim() || isJoiningRoom}
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
                    <h2 className="text-2xl font-bold">Room: {roomCode}</h2>
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
                      Players ({waitingPlayers.length}/4)
                    </h3>
                    <div className="space-y-2">
                      {waitingPlayers.map((player, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-200"
                        >
                          <span>{player}</span>
                          {index === 0 && (
                            <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              {isReady ? 'Ready' : 'Not Ready'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <Button
                      variant={isReady ? "outline" : "default"}
                      onClick={() => setIsReady(!isReady)}
                      className="flex-1"
                    >
                      {isReady ? 'Cancel Ready' : 'Ready Up'}
                    </Button>
                    <Button
                      onClick={handleStartGame}
                      disabled={!isReady}
                      className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/20"
                    >
                      Start Game
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
