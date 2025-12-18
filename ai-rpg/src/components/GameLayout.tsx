'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';

export function GameLayout({ children }: { children: React.ReactNode }) {
  const { character, gameState, inventory } = useGameStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground">AI RPG Adventure</h1>
        </header>
          
        <main className="flex-1 flex-1 overflow-hidden">
          {children}
        </main>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 border-l bg-muted/10 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Character Status */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Character Status</h3>
              {character ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-muted-foreground">Lvl {character.level}</span>
                  </div>
                  <div className="text-muted-foreground">{character.class}</div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>STR:</span>
                      <span>{character.stats.strength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DEX:</span>
                      <span>{character.stats.dexterity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INT:</span>
                      <span>{character.stats.intelligence}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CHA:</span>
                      <span>{character.stats.charisma}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WIS:</span>
                      <span>{character.stats.wisdom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CON:</span>
                      <span>{character.stats.constitution}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{character.experience} XP</span>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No character created yet
                </div>
              )}
            </Card>

            {/* Inventory */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Inventory</h3>
              {inventory.items.length > 0 ? (
                <div className="space-y-1 text-sm">
                  {inventory.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Your inventory is empty
                </div>
              )}
            </Card>

            {/* Achievements */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Achievements</h3>
              <div className="space-y-2">
                {gameState.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`text-sm p-2 rounded ${
                      achievement.unlocked
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-xs">{achievement.description}</div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-xs mt-1">
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Game Info</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Chapter:</span>
                  <span>{gameState.currentChapter}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phase:</span>
                  <span className="capitalize">{gameState.currentPhase.replace('-', ' ')}</span>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}