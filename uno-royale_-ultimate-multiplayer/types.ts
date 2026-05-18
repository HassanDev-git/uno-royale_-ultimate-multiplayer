
export type CardColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'WILD';

export type CardValue = 
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'SKIP' | 'REVERSE' | 'DRAW2' | 'WILD' | 'WILD4';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PlayerEquipped {
  cardTheme: string;
  bgTheme: string;
  nameTag: string;
  chatTheme: string;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  hand: Card[];
  isBot: boolean;
  avatar: string;
  unoDeclared: boolean;
  difficulty?: AIDifficulty;
  isReady?: boolean;
  isOnline?: boolean;
  coins?: number;
  wins?: number;
  inventory?: string[];
  equipped?: PlayerEquipped;
  isFinished?: boolean;
  rank?: number;
}

export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'PLAYING' | 'WINNER' | 'COLOR_PICKER' | 'SETTINGS' | 'RULES' | 'SHOP' | 'LEADERBOARD' | 'DISCONNECTED' | 'ACCOUNT';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  chatTheme?: string;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  direction: 1 | -1;
  activeColor: CardColor | null;
  status: GameStatus;
  winner: Player | null;
  rankings: string[];
  lastAction: string | null;
  pendingDrawCount: number;
  aiDifficulty: AIDifficulty;
  messages?: ChatMessage[];
  maxPlayers: number;
  countdown?: number;
  rematchRequested?: boolean;
  turnId: number; // Incrementing ID to force bot re-evaluation
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'card' | 'bg' | 'tag' | 'chat';
  price: number;
  isAnimated: boolean;
  previewColor: string;
}
