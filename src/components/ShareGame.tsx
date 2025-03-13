
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';

interface ShareGameProps {
  gameId: string;
  className?: string;
}

const ShareGame: React.FC<ShareGameProps> = ({ gameId, className = "" }) => {
  const [copied, setCopied] = useState(false);
  
  const gameUrl = `${window.location.origin}/game?id=${gameId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Game link copied to clipboard"
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    });
  };
  
  const shareGame = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my Chit Raja game!',
        text: 'Join my game of Chit Raja!',
        url: gameUrl,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <div className={`glass p-4 rounded-xl ${className}`}>
      <div className="text-sm font-medium mb-2">Invite friends to join:</div>
      <div className="flex items-center gap-2">
        <div className="bg-gray-100 rounded px-3 py-2 text-sm flex-1 truncate">
          {gameUrl}
        </div>
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-1">
          <Copy size={14} />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
        {navigator.share && (
          <Button size="sm" onClick={shareGame} className="flex items-center gap-1">
            <Share2 size={14} />
            <span>Share</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ShareGame;
