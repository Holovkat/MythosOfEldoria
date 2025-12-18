import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, GameState, Settings, Inventory, InventoryItem, ChatMessage, CloudAdventure } from '@/types/game';
import { toast } from 'sonner';

interface GameStore {
  // State
  character: Character | null;
  gameState: GameState;
  inventory: Inventory;
  settings: Settings;
  adventureId: string | null;

  // Actions
  setCharacter: (character: Character | null) => void;
  setAdventureId: (id: string | null) => void;
  updateCharacterStats: (stats: Partial<Character['stats']>) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setCurrentPhase: (phase: GameState['currentPhase']) => void;
  setCurrentChapter: (chapter: number) => void;
  unlockAchievement: (achievementId: string) => void;
  addToInventory: (item: Omit<InventoryItem, 'id'>) => void;
  removeFromInventory: (itemId: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetGame: () => void;
  setAdventureTitle: (title: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  loadAdventure: (adventure: CloudAdventure) => void;
}


const initialGameState: GameState = {
  currentPhase: 'character-creation',
  history: [],
  currentChapter: 1,
  achievements: [
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Begin your adventure',
      unlocked: false,
      type: 'fixed',
    },
    {
      id: 'character_created',
      title: 'Hero Born',
      description: 'Create your character',
      unlocked: false,
      type: 'fixed',
    },
  ],
  adventureTitle: 'Untitled Adventure',
};

const initialSettings: Settings = {
  theme: 'dark',
  textSpeed: 'normal',
  soundEnabled: true,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      character: null,
      gameState: initialGameState,
      inventory: { items: [] },
      settings: initialSettings,
      adventureId: null,

      // Actions
      setCharacter: (character) => set({ character }),
      setAdventureId: (adventureId) => set({ adventureId }),

      updateCharacterStats: (stats) =>
        set((state) => ({
          character: state.character
            ? { ...state.character, stats: { ...state.character.stats, ...stats } }
            : null,
        })),

      addMessage: (message) =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            history: [
              ...state.gameState.history.map(msg => ({
                ...msg,
                timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
              })),
              {
                ...message,
                id: Date.now().toString(),
                timestamp: new Date(),
              },
            ],
          },
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            history: state.gameState.history.map((msg) =>
              msg.id === id ? { ...msg, ...updates } : msg
            ),
          },
        })),

      setCurrentPhase: (phase) =>
        set((state) => ({
          gameState: { ...state.gameState, currentPhase: phase },
        })),

      setCurrentChapter: (chapter) =>
        set((state) => ({
          gameState: { ...state.gameState, currentChapter: chapter },
        })),

      unlockAchievement: (achievementId) => {
        const state = get();
        const achievement = state.gameState.achievements.find(a => a.id === achievementId);
        
        if (achievement && !achievement.unlocked) {
          toast.success(`Achievement Unlocked: ${achievement.title}`, {
            description: achievement.description,
            icon: '🏆',
            className: 'font-serif border-primary/20',
          });
          
          set((state) => ({
            gameState: {
              ...state.gameState,
              achievements: state.gameState.achievements.map((a) =>
                a.id === achievementId
                  ? { ...a, unlocked: true, unlockedAt: new Date() }
                  : a
              ),
            },
          }));
        }
      },

      addToInventory: (item) =>
        set((state) => ({
          inventory: {
            items: [
              ...state.inventory.items,
              { ...item, id: Date.now().toString() },
            ],
          },
        })),

      removeFromInventory: (itemId) =>
        set((state) => ({
          inventory: {
            items: state.inventory.items.filter((item) => item.id !== itemId),
          },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      setAdventureTitle: (title) =>
        set((state) => ({
          gameState: { ...state.gameState, adventureTitle: title },
        })),

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      loadAdventure: (adventure) =>
        set({
          character: adventure.character,
          adventureId: adventure._id,
          gameState: {
            ...initialGameState,
            currentPhase: adventure.gameState.currentPhase as any,
            history: adventure.gameState.history.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            currentChapter: adventure.gameState.currentChapter,
            adventureTitle: adventure.gameState.adventureTitle || adventure.title,
          },
          inventory: adventure.inventory,
        }),

      resetGame: () =>
        set({
          character: null,
          adventureId: null,
          gameState: initialGameState,
          inventory: { items: [] },
        }),
    }),
    {
      name: 'ai-rpg-game-store',
      partialize: (state) => ({
        character: state.character,
        gameState: state.gameState,
        inventory: state.inventory,
        settings: state.settings,
        adventureId: state.adventureId,
      }),
    }
  )
);