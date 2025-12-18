'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Edit2, Check, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AdventureTitle() {
  const { gameState, setAdventureTitle, character } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(gameState.adventureTitle || 'Untitled Adventure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSave = () => {
    if (tempTitle.trim()) {
      setAdventureTitle(tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(gameState.adventureTitle || 'Untitled Adventure');
    setIsEditing(false);
  };

  const generateTitles = async () => {
    if (!character || isGenerating) return;

    setIsGenerating(true);
    setShowSuggestions(true);
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: gameState.history.map(msg => `${msg.sender}: ${msg.content}`),
          characterState: character,
        }),
      });

      const data = await response.json();
      if (data.titles) {
        setSuggestions(data.titles);
      }
    } catch (error) {
      console.error('Failed to generate titles:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSuggestion = (title: string) => {
    setAdventureTitle(title);
    setTempTitle(title);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className={`relative group w-full max-w-2xl mx-auto flex items-center justify-center gap-2 ${showSuggestions ? 'z-50' : ''}`}>
      {isEditing ? (
        <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <Input
            value={tempTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempTitle(e.target.value)}
            className="text-xl font-bold font-serif text-center h-10 bg-background/50 border-primary/20 focus:ring-primary/30"
            autoFocus
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          <h1 
            className="text-2xl font-bold font-serif tracking-tight text-primary transition-all duration-300 group-hover:text-primary/80 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {gameState.adventureTitle || 'Untitled Adventure'}
          </h1>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            
            <div className="relative">
              <Button 
                size="icon" 
                variant="ghost" 
                className={`h-8 w-8 transition-all ${isGenerating ? 'text-primary animate-pulse' : 'text-amber-500 hover:text-amber-600'}`}
                onClick={generateTitles}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              </Button>

              {showSuggestions && (
                <Card className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 z-50 p-2 shadow-xl border-primary/20 bg-background/95 backdrop-blur-md animate-in zoom-in-95 fade-in duration-200">
                  <div className="flex items-center justify-between mb-2 px-2 py-1 border-b border-primary/10">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">AI Suggestions</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => setShowSuggestions(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {isGenerating ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-[10px] text-muted-foreground italic">Consulting the Elders...</span>
                      </div>
                    ) : (
                      suggestions.map((title, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-3 py-2 text-sm font-serif rounded-md transition-colors hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
                          onClick={() => selectSuggestion(title)}
                        >
                          {title}
                        </button>
                      ))
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
