export interface Character {
  name: string;
  class: string;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    wisdom: number;
    constitution: number;
  };
  level: number;
  experience: number;
}

export interface Inventory {
  items: InventoryItem[];
}

export interface MessageBlock {
  type: 'narration' | 'dialogue';
  content: string;
  speaker?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
}

export interface ChatMessage {
  id: string;
  content: string;
  blocks?: MessageBlock[];
  sender: 'user' | 'ai';
  timestamp: Date;
  imagePrompt?: string;
  imageUrl?: string;
  suggestions?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date | string;
  type: 'fixed' | 'dynamic';
}

export interface GameState {
  currentPhase: 'character-creation' | 'playing' | 'paused';
  history: ChatMessage[];
  currentChapter: number;
  achievements: Achievement[];
  adventureTitle?: string;
}

export interface Settings {
  theme: 'dark' | 'light';
  textSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
}

export interface CloudAdventure {
  _id: string;
  title: string;
  character: Character;
  gameState: {
    currentPhase: string;
    history: ChatMessage[];
    currentChapter: number;
    adventureTitle?: string;
  };
  inventory: Inventory;
  lastUpdated: number;
}