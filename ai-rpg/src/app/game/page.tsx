'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CharacterCreationWizard } from '@/components/CharacterCreationWizard';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

import ReactMarkdown from 'react-markdown';
import { Typewriter } from '@/components/Typewriter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Package, Trophy, Info, Sun, Moon, Cloud, CloudUpload, History, X, Home, Save } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StoryImage } from '@/components/StoryImage';
import { AdventureTitle } from '@/components/AdventureTitle';
import type { InventoryItem, CloudAdventure } from '@/types/game';

export default function GamePage() {
  const router = useRouter();
  const { gameState, addMessage, updateMessage, character, inventory, updateCharacterStats, addToInventory, unlockAchievement, settings, setTheme, adventureId, setAdventureId, loadAdventure } = useGameStore();
  const saveAdventure = useMutation(api.adventures.saveAdventure);
  const adventures = useQuery(api.adventures.listAdventures);
  const deleteAdventureMutation = useMutation(api.adventures.deleteAdventure);
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [gameState.history, completedMessages]);

  const handleCloudSave = useCallback(async () => {
    if (!character) return;
    
    setIsCloudSaving(true);
    try {
      // Ensure history is serializable for Convex (convert Dates to numbers, prune large images)
      const serializableHistory = gameState.history.map(msg => {
        const { imageUrl, ...rest } = msg;
        return {
          ...rest,
          // Prune base64 data URIs to stay under Convex 1MB limit
          // External URLs (like Pollinations.ai) are preserved
          imageUrl: (imageUrl && !imageUrl.startsWith('data:')) ? imageUrl : undefined,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.getTime() : msg.timestamp
        };
      });

      const savedId = await saveAdventure({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (adventureId || undefined) as any,
        title: gameState.adventureTitle || "Untitled Adventure",
        character,
        gameState: {
          currentPhase: gameState.currentPhase,
          history: serializableHistory,
          currentChapter: gameState.currentChapter,
          adventureTitle: gameState.adventureTitle,
        },
        inventory,
      });

      if (!adventureId && savedId) {
        setAdventureId(savedId as string);
      }

      toast.success("Adventure saved to the cloud!", {
        description: "Your legend has been preserved in the celestial archives.",
        icon: <Save className="w-4 h-4 text-primary" />,
      });
    } catch (saveError) {
      console.error("Cloud save failed:", saveError);
      toast.error("Failed to save to cloud", {
        description: "The scrolls could not be delivered to the archives.",
      });
    } finally {
      setIsCloudSaving(false);
    }
  }, [character, gameState, adventureId, saveAdventure, setAdventureId, inventory]);

  // Auto-save on page leave or closure
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Trigger a silent cloud save attempt
      if (character && gameState.history.length > 0) {
        handleCloudSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [character, gameState.history.length, handleCloudSave]); // Re-run if adventure ID or history changes

  const handleSendMessage = async (message: string) => {
    if (!character || isLoading) return;

    setIsLoading(true);

    // Add user message immediately
    const userMsgId = Date.now().toString();
    addMessage({ content: message, sender: 'user' });
    setCompletedMessages(prev => new Set(prev).add(userMsgId));

    try {
      console.log('Sending message:', message);

      // Send to Gemini API
      const response = await fetch('/api/game-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: message,
          history: gameState.history.map(msg => `${msg.sender}: ${msg.content}`),
          characterState: character,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add AI response
      addMessage({ 
        content: data.narrative, 
        sender: 'ai',
        blocks: data.blocks,
        imagePrompt: data.imagePrompt,
        suggestions: data.suggestions
      });

      // Apply state updates if present
      if (data.stateUpdates) {
        if (data.stateUpdates.character) {
          updateCharacterStats(data.stateUpdates.character);
        }
        if (data.stateUpdates.inventory) {
          data.stateUpdates.inventory.forEach((item: InventoryItem) => addToInventory(item));
        }
        if (data.stateUpdates.achievements) {
          data.stateUpdates.achievements.forEach((id: string) => unlockAchievement(id));
        }
      }

      // Auto-save every 5 interactions (10 messages = user + ai)
      const interactionCount = Math.floor(gameState.history.length / 2) + 1;
      if (interactionCount % 5 === 0) {
        console.log(`Auto-saving at interaction #${interactionCount}...`);
        handleCloudSave();
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      addMessage({
        content: 'The ancient magic flickers momentarily, but the story continues...',
        sender: 'ai'
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoadStory = (adventure: CloudAdventure) => {
    try {
      loadAdventure(adventure);
      toast.success("Legend Restored", {
        description: `Successfully loaded "${adventure.title}".`,
        icon: "📜",
      });
    } catch (error) {
      console.error("Load failed:", error);
      toast.error("Restoration Failed", {
        description: "The scrolls are unreadable.",
      });
    }
  };

  const handleDeleteStory = async (id: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await deleteAdventureMutation({ id: id as any });
      toast.success("Legend Erased", {
        description: "The story has been removed from the archives.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete story");
    }
  };

  if (gameState.currentPhase === 'character-creation') {
    return <CharacterCreationWizard />;
  }

  return (
    <div className="relative flex h-screen bg-background overflow-hidden">
      {/* Immersive Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/landing/hero-bg.png"
          alt="Game Backdrop"
          fill
          className="object-cover opacity-15 blur-[6px] transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60" />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className="bg-background/40 backdrop-blur-md px-4 h-16 flex-shrink-0 flex items-center justify-between gap-4 relative z-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => router.push('/')}
              title="Return to Landing Page"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-primary/10" />
            <AdventureTitle />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {settings.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 text-muted-foreground hover:text-primary transition-colors ${isCloudSaving ? 'animate-pulse' : ''}`}
              onClick={handleCloudSave}
              disabled={isCloudSaving || !character}
              title="Save to Cloud"
            >
              {isCloudSaving ? <CloudUpload className="h-4 w-4 animate-bounce" /> : <Cloud className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Chat Messages - Takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {gameState.history.map((message, idx) => (
                  <div key={message.id} className="space-y-4">
                    {message.blocks ? (
                      message.blocks.map((block, idx) => (
                        <div
                          key={`${message.id}-${idx}`}
                          className={`flex ${
                            block.type === 'dialogue' ? 'justify-start' : 'justify-center w-full'
                          }`}
                        >
                        {block.type === 'dialogue' ? (
                          <div className="relative pt-3 max-w-[85%]">
                            {block.speaker && (
                              <div className="absolute top-0 left-2 z-10 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-t-sm border-x border-t border-primary/20 text-[10px] uppercase tracking-widest font-bold text-primary-foreground font-sans">
                                {block.speaker}
                              </div>
                            )}
                            <Card className={`p-4 bg-muted border-primary/20 shadow-lg ${block.speaker ? 'rounded-tl-none' : ''}`}>
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                              </div>
                            </Card>
                          </div>
                        ) : (
                          <div className="max-w-[90%] py-4 text-center text-muted-foreground font-serif italic border-y border-primary/5 my-2">
                            <ReactMarkdown>{block.content}</ReactMarkdown>
                          </div>
                        )}
                        </div>
                      ))
                    ) : (
                      // Fallback for old messages or user messages
                    <div
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`relative pt-3 max-w-[85%]`}>
                        {message.sender === 'user' && character ? (
                          <div className="absolute top-0 right-2 z-10 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-t-sm border-x border-t border-primary/20 text-[10px] uppercase tracking-widest font-bold text-primary-foreground font-sans">
                            {character.name}
                          </div>
                        ) : message.sender === 'ai' ? (
                          <div className="absolute top-0 left-2 z-10 bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded-t-sm border-x border-t border-primary/20 text-[10px] uppercase tracking-widest font-bold text-primary-foreground font-sans">
                            Game Master
                          </div>
                        ) : null}
                        <Card
                          className={`p-4 border-primary/20 shadow-lg backdrop-blur-md transition-all ${
                            message.sender === 'user'
                              ? `bg-primary/90 text-primary-foreground ${character ? 'rounded-tr-none' : ''}`
                              : `bg-card/50 ${message.sender === 'ai' ? 'rounded-tl-none' : ''}`
                          }`}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {message.sender === 'ai' && !completedMessages.has(message.id) ? (
                              <Typewriter 
                                text={message.content} 
                                onComplete={() => setCompletedMessages(prev => new Set(prev).add(message.id))}
                              />
                            ) : (
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                    )}

                    {/* Render Image if available for this specific message metadata */}
                    {(message.imageUrl || message.imagePrompt) && (
                      <div className="flex justify-center">
                        <div className="max-w-[85%] w-full">
                          <StoryImage 
                            prompt={message.imagePrompt}
                            url={message.imageUrl}
                            onImageGenerated={(url) => updateMessage(message.id, { imageUrl: url })}
                          />
                        </div>
                      </div>
                    )}
                    
                  {/* Render Suggestions for the very last AI message */}
                  {message.sender === 'ai' && 
                   message.suggestions && 
                   message.suggestions.length > 0 && 
                   idx === gameState.history.length - 1 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {message.suggestions.map((suggestion, sIdx) => (
                        <Button
                          key={`suggestion-${sIdx}`}
                          variant="outline"
                          size="sm"
                          className="text-xs border-primary/30 hover:bg-primary/10 transition-colors"
                          onClick={() => handleSendMessage(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] opacity-30 mt-1 text-center font-mono">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>


        {/* Message Input - Fixed at bottom */}
        <div className="p-4 bg-background flex-shrink-0">
          {isLoading && (
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>The ancient magic is weaving your tale...</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="What do you want to do?"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              disabled={!character || isLoading}
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() && !isLoading) {
                  handleSendMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              onClick={() => {
                const input = inputRef.current;
                if (input && input.value.trim()) {
                  console.log('Sending message:', input.value);
                  handleSendMessage(input.value);
                  input.value = '';
                }
              }}
              disabled={!character || isLoading}
            >
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
          {!character && (
            <p className="text-xs text-muted-foreground mt-2">
              Create a character first to begin your adventure
            </p>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 bg-card/30 backdrop-blur-xl flex flex-col z-10 relative">
        <Tabs defaultValue="character" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 rounded-none bg-transparent h-16">
            <TabsTrigger value="character" title="Character">
              <Shield className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="inventory" title="Inventory">
              <Package className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="achievements" title="Achievements">
              <Trophy className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="archive" title="Cloud Archive">
              <History className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="info" title="Game Info">
              <Info className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <TabsContent value="character" className="mt-0 space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 font-serif">
                    <Shield className="w-4 h-4" /> Character Status
                  </h3>
                  {character ? (
                    <div className="space-y-4 text-sm font-sans">
                      <div className="flex justify-between items-end">
                        <span className="text-xl font-bold font-serif">{character.name}</span>
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Level {character.level}</span>
                      </div>
                      <div className="text-primary font-medium italic">{character.class}</div>

                      <Separator className="bg-primary/10" />

                      <div className="grid grid-cols-1 gap-3">
                        <StatItem label="Strength" value={character.stats.strength} />
                        <StatItem label="Dexterity" value={character.stats.dexterity} />
                        <StatItem label="Intelligence" value={character.stats.intelligence} />
                        <StatItem label="Charisma" value={character.stats.charisma} />
                        <StatItem label="Wisdom" value={character.stats.wisdom} />
                        <StatItem label="Constitution" value={character.stats.constitution} />
                      </div>

                      <Separator className="bg-primary/10" />

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                          <span>Experience</span>
                          <span>{character.experience} XP</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${Math.min((character.experience % 1000) / 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm italic py-8 text-center">
                      No character created yet
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="inventory" className="mt-0 space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 font-serif">
                    <Package className="w-4 h-4" /> Inventory
                  </h3>
                  {inventory.items.length > 0 ? (
                    <div className="grid gap-2">
                      {inventory.items.map((item) => (
                        <Card key={item.id} className="p-3 bg-muted/30 border-primary/5 hover:border-primary/20 transition-colors shadow-none">
                          <div className="flex justify-between items-center font-sans">
                            <span className="font-medium text-sm">{item.name}</span>
                            <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border font-mono">
                              x{item.quantity}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm italic py-8 text-center">
                      Your inventory is empty
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="achievements" className="mt-0 space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 font-serif">
                    <Trophy className="w-4 h-4" /> Achievements
                  </h3>
                  <div className="space-y-3">
                    {gameState.achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`text-sm p-3 rounded-lg border transition-all duration-500 ${
                          achievement.unlocked
                            ? 'bg-primary/5 border-primary/20 shadow-inner'
                            : 'bg-muted/20 border-transparent opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 font-sans">
                          <div className="font-semibold">{achievement.title}</div>
                          {achievement.unlocked && (
                            <Trophy className="w-3 h-3 text-primary animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed italic">
                          {achievement.description}
                        </div>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-[9px] text-primary/60 mt-2 font-mono uppercase tracking-tighter">
                            Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="archive" className="mt-0 space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 font-serif">
                    <History className="w-4 h-4" /> Celestial Archives
                  </h3>
                  <div className="space-y-3">
                    {!adventures ? (
                      <div className="py-8 text-center text-muted-foreground animate-pulse text-xs italic">
                        Consulting the stars...
                      </div>
                    ) : adventures.filter(adv => adv._id === adventureId).length === 0 ? (
                      <div className="py-12 text-center text-white/40 italic">
                        The archives of this tale are yet to be written. Save your progress to begin.
                      </div>
                    ) : (
                      adventures
                        .filter(adv => adv._id === adventureId)
                        .map((adv: CloudAdventure) => (
                          <Card key={adv._id} className="p-3 bg-card/40 border-primary/10 border shadow-none transition-all group hover:bg-card/60">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-serif font-bold text-sm truncate pr-2">{adv.title}</div>
                            <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {new Date(adv.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground mb-3 flex items-center gap-2">
                            <span>{adv.character?.name || "Unknown Hero"}</span>
                            <span>•</span>
                            <span>Level {adv.character?.level || 1}</span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-7 text-[10px] flex-1"
                              onClick={() => handleLoadStory(adv)}
                            >
                              Restore
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteStory(adv._id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="info" className="mt-0 space-y-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 font-serif">
                    <Info className="w-4 h-4" /> Game Info
                  </h3>
                  <div className="space-y-4 font-sans">
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm border-l-2 border-primary/40">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Chapter</span>
                        <span className="font-bold">{gameState.currentChapter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stage</span>
                        <span className="capitalize font-medium">
                          {gameState.currentPhase.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-[11px] text-muted-foreground leading-relaxed italic text-center px-4">
                      <p>Your progress is saved automatically to your device&apos;s ancient archives.</p>
                      <p className="mt-2 text-primary/70">May your choices lead you to glory in the realm of Eldoria.</p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </aside>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  const maxValue = 20; // Standard D&D cap
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-end">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest group-hover:text-primary transition-colors">
          {label}
        </span>
        <span className="text-sm font-serif font-bold leading-none">{value}</span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary/60 group-hover:bg-primary transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}