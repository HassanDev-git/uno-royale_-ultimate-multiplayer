
import { Card, CardColor, CardValue, ShopItem } from './types';

export const COLORS: CardColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
export const VALUES: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REVERSE', 'DRAW2'];

export const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liliana',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
];

export const SHOP_ITEMS: ShopItem[] = [
  // Card Themes
  { id: 'card_classic', name: 'Classic UNO', category: 'card', price: 0, isAnimated: false, previewColor: '#ff0000' },
  { id: 'card_neon', name: 'Neon Cyber', category: 'card', price: 500, isAnimated: true, previewColor: '#00f2ff' },
  { id: 'card_gold', name: 'Holo Legend', category: 'card', price: 2000, isAnimated: true, previewColor: '#ffd700' },
  { id: 'card_dark', name: 'Midnight', category: 'card', price: 300, isAnimated: false, previewColor: '#1a1a1a' },
  
  // Background Themes
  { id: 'bg_dark', name: 'Default Void', category: 'bg', price: 0, isAnimated: false, previewColor: '#1a1a1a' },
  { id: 'bg_space', name: 'Deep Space', category: 'bg', price: 800, isAnimated: true, previewColor: '#0b0e1a' },
  { id: 'bg_casino', name: 'Royal Table', category: 'bg', price: 400, isAnimated: false, previewColor: '#004d00' },
  
  // Name Tags
  { id: 'tag_none', name: 'Basic', category: 'tag', price: 0, isAnimated: false, previewColor: '#555' },
  { id: 'tag_pro', name: 'Pro Elite', category: 'tag', price: 300, isAnimated: false, previewColor: '#3b82f6' },
  { id: 'tag_legend', name: 'KING', category: 'tag', price: 1500, isAnimated: true, previewColor: '#ec4899' },
  
  // Chat Themes
  { id: 'chat_default', name: 'Standard', category: 'chat', price: 0, isAnimated: false, previewColor: '#3b82f6' },
  { id: 'chat_matrix', name: 'The Matrix', category: 'chat', price: 1200, isAnimated: true, previewColor: '#22c55e' },
  { id: 'chat_royal', name: 'Golden Chat', category: 'chat', price: 600, isAnimated: false, previewColor: '#f59e0b' },
];

export const COLOR_CLASSES: Record<CardColor, string> = {
  RED: 'bg-red-600',
  BLUE: 'bg-blue-600',
  GREEN: 'bg-green-600',
  YELLOW: 'bg-yellow-400',
  WILD: 'bg-zinc-800'
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let idCounter = 0;
  COLORS.forEach(color => {
    deck.push({ id: `c-${idCounter++}`, color, value: '0' });
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REVERSE', 'DRAW2'].forEach(val => {
      deck.push({ id: `c-${idCounter++}`, color, value: val as CardValue });
      deck.push({ id: `c-${idCounter++}`, color, value: val as CardValue });
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c-${idCounter++}`, color: 'WILD', value: 'WILD' });
    deck.push({ id: `c-${idCounter++}`, color: 'WILD', value: 'WILD4' });
  }
  return deck.sort(() => Math.random() - 0.5);
};

export const GAME_RULES = [
  { title: "Objective", description: "Race to be the first to discard all your cards. Match by color or number/type.", type: 'basic' },
  { title: "Action Cards", description: "Skip stops next player. Reverse changes order. Draw Two forces next player to draw 2 cards.", type: 'action' },
  { title: "Wild & Wild +4", description: "Wilds pick the active color. Wild +4 forces drawing 4 cards.", type: 'wild' },
  { title: "The UNO Rule", description: "Press UNO before playing your second-to-last card!", type: 'penalty' },
];
