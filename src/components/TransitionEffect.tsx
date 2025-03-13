
import React from 'react';
import { motion } from 'framer-motion';

interface TransitionEffectProps {
  children: React.ReactNode;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default TransitionEffect;
