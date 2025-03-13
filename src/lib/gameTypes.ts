
export type GameRole = 'Raja' | 'Mantri' | 'Chor' | 'Sipahi';

export interface Player {
  id: string;
  name: string;
  role?: GameRole;
  score: number;
  isReady: boolean;
  isConnected: boolean;
}

export interface GameState {
  gameId: string;
  round: number;
  totalRounds: number;
  players: Player[];
  status: 'waiting' | 'assigning-roles' | 'revealing-roles' | 'making-guess' | 'round-end' | 'game-end';
  winner?: Player;
}

export const ROLE_POINTS: Record<GameRole, number> = {
  'Raja': 800,
  'Mantri': 900,
  'Chor': 0,
  'Sipahi': 1000
};

export const ROLE_DESCRIPTIONS: Record<GameRole, string> = {
  'Raja': 'The King who knows the identity of the Sipahi (Guard).',
  'Mantri': 'The Minister who identifies the Chor to the Sipahi.',
  'Chor': 'The Thief who must remain hidden to avoid being caught.',
  'Sipahi': 'The Guard who works with the Raja to identify the Chor.'
};
