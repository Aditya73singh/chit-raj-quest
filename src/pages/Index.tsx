
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RoleCard from '@/components/RoleCard';
import TransitionEffect from '@/components/TransitionEffect';

const Index: React.FC = () => {
  const roles = ['Raja', 'Mantri', 'Chor', 'Sipahi'] as const;
  
  return (
    <TransitionEffect>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="relative py-24 md:py-32">
            <div className="container mx-auto px-6">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="inline-block mb-6 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    A Traditional Game, Reimagined
                  </div>
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  Chit Raj
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-600 mb-10 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  A multiplayer role-based game of strategy, deception, and deduction.
                  Take on the roles of Raja, Mantri, Chor, and Sipahi in this classic game.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link 
                    to="/lobby" 
                    className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                  >
                    Start Playing
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
          
          {/* Roles Section */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Game Roles</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Each player is randomly assigned one of four roles. Each role has unique abilities and objectives.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {roles.map((role, index) => (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.1 * index, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <RoleCard role={role} revealed className="h-[280px]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* How To Play */}
          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">How To Play</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Chit Raj is played over 7 rounds, with roles reassigned each round.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    title: "1. Role Assignment",
                    description: "Each player is randomly assigned one of four roles: Raja, Mantri, Chor, or Sipahi."
                  },
                  {
                    title: "2. Role Revelation",
                    description: "The Raja identifies the Sipahi, then the Sipahi must identify the Chor."
                  },
                  {
                    title: "3. Scoring",
                    description: "Points are awarded based on correct identification. Play continues for 7 rounds."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    className="glass p-8 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.1 * index, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                  >
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </main>
        
        {/* Footer */}
        <footer className="py-8 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex justify-center items-center">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Chit Raj. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TransitionEffect>
  );
};

export default Index;
