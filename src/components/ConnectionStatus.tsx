
import React from 'react';

interface ConnectionStatusProps {
  connected: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connected,
  className = ""
}) => {
  return (
    <div className={`px-3 py-1 text-sm inline-flex items-center rounded-full ${
      connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    } ${className}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${
        connected ? 'bg-green-500' : 'bg-red-500'
      }`}></span>
      {connected ? 'Connected' : 'Disconnected'}
    </div>
  );
};

export default ConnectionStatus;

