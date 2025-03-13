
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameRole, ROLE_DESCRIPTIONS, ROLE_POINTS } from '@/lib/gameTypes';

interface RoleCardProps {
  role: GameRole;
  revealed?: boolean;
  onClick?: () => void;
  className?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  revealed = false, 
  onClick,
  className = "" 
}) => {
  const [isFlipped, setIsFlipped] = useState(revealed);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!revealed) {
      setIsFlipped(!isFlipped);
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'Raja': return 'from-blue-500 to-blue-700';
      case 'Mantri': return 'from-purple-500 to-purple-700';
      case 'Chor': return 'from-red-500 to-red-700';
      case 'Sipahi': return 'from-green-500 to-green-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'Raja': return '👑';
      case 'Mantri': return '📜';
      case 'Chor': return '🎭';
      case 'Sipahi': return '🛡️';
      default: return '❓';
    }
  };

  return (
    <div 
      className={`perspective ${className}`}
      onClick={handleClick}
    >
      <motion.div
        className="w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        {/* Card Front (Hidden) */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="w-full h-full glass rounded-xl flex flex-col items-center justify-center p-6 subtle-shadow">
            <div className="text-3xl font-bold mb-2">?</div>
            <div className="text-center text-lg font-medium">Role Card</div>
            <div className="text-sm text-center text-gray-500 mt-2">Tap to reveal</div>
          </div>
        </div>
        
        {/* Card Back (Revealed Role) */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-6 bg-gradient-to-br ${getRoleColor()} text-white`}>
            <div className="text-4xl mb-3">{getRoleIcon()}</div>
            <div className="text-xl font-bold mb-1">{role}</div>
            <div className="text-sm text-center opacity-90 mb-2">{ROLE_DESCRIPTIONS[role]}</div>
            <div className="mt-auto pt-2 text-sm font-semibold">
              Points: {ROLE_POINTS[role]}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleCard;
