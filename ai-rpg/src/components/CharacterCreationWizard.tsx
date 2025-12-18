'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameStore } from '@/store/gameStore';
import type { Character } from '@/types/game';

interface CharacterPreset {
  name: string;
  class: string;
  icon: string;
  description: string;
  stats: Character['stats'];
}

export function CharacterCreationWizard() {
  const { setCharacter, setCurrentPhase, unlockAchievement, addMessage } = useGameStore();
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null);
  
  const characterPresets: CharacterPreset[] = [
    {
      name: 'Aldric Warrior',
      class: 'Fighter',
      icon: '⚔️',
      description: 'A mighty warrior skilled in combat and leadership',
      stats: {
        strength: 16,
        dexterity: 12,
        intelligence: 10,
        charisma: 14,
        wisdom: 12,
        constitution: 15,
      },
    },
    {
      name: 'Elara Mage',
      class: 'Wizard',
      icon: '🧙‍♀️',
      description: 'A powerful sorceress with ancient magical knowledge',
      stats: {
        strength: 8,
        dexterity: 14,
        intelligence: 18,
        charisma: 12,
        wisdom: 16,
        constitution: 10,
      },
    },
    {
      name: 'Theron Rogue',
      class: 'Rogue',
      icon: '🗡️',
      description: 'A cunning scout skilled in stealth and deception',
      stats: {
        strength: 12,
        dexterity: 18,
        intelligence: 14,
        charisma: 10,
        wisdom: 12,
        constitution: 13,
      },
    },
    {
      name: 'Seraphina Cleric',
      class: 'Cleric',
      icon: '✨',
      description: 'A divine healer with unwavering faith',
      stats: {
        strength: 12,
        dexterity: 10,
        intelligence: 14,
        charisma: 16,
        wisdom: 18,
        constitution: 14,
      },
    },
  ];

  const handlePresetSelect = (preset: CharacterPreset) => {
    setSelectedPreset(preset);
  };

  const handleConfirmPreset = () => {
    if (selectedPreset) {
      const character: Character = {
        name: selectedPreset.name,
        class: selectedPreset.class,
        stats: selectedPreset.stats,
        level: 1,
        experience: 0,
      };
      
      setCharacter(character);
      setCurrentPhase('playing');
      unlockAchievement('character_created');
      unlockAchievement('first_steps');

      // Trigger initial narrative with image
      fetch('/api/game-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "I enter the Prancing Pony in Silverhaven",
          history: [],
          characterState: character,
        }),
      }).then(res => res.json()).then(data => {
        addMessage({ 
          content: data.narrative, 
          sender: 'ai',
          blocks: data.blocks,
          imagePrompt: data.imagePrompt,
          suggestions: data.suggestions
        });
      }).catch(err => console.error('Initial narrative failed:', err));
    }
  };

  const handleGenerateCharacter = async () => {
    if (!customDescription.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: customDescription }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const character: Character = {
        ...data,
        level: 1,
        experience: 0,
      };

      setGeneratedCharacter(character);
    } catch (error) {
      console.error('Character generation failed:', error);
      // Show error message to user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmCustom = () => {
    if (generatedCharacter) {
      setCharacter(generatedCharacter);
      setCurrentPhase('playing');
      unlockAchievement('character_created');
      unlockAchievement('first_steps');

      // Trigger initial narrative with image
      fetch('/api/game-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "I enter the Prancing Pony in Silverhaven",
          history: [],
          characterState: generatedCharacter,
        }),
      }).then(res => res.json()).then(data => {
        addMessage({ 
          content: data.narrative, 
          sender: 'ai',
          blocks: data.blocks,
          imagePrompt: data.imagePrompt,
          suggestions: data.suggestions
        });
      }).catch(err => console.error('Initial narrative failed:', err));
    }
  };

  const goBack = () => {
    setMode('preset');
    setSelectedPreset(null);
    setCustomDescription('');
    setGeneratedCharacter(null);
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-2">Create Your Hero</h2>
          <p className="text-muted-foreground">
            Choose your path in this high fantasy adventure
          </p>
        </div>

        <ScrollArea className="flex-1 p-6">
          {mode === 'preset' ? (
            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <Button
                  variant="default"
                  onClick={() => setMode('preset')}
                  className="flex-1"
                >
                  Choose Preset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMode('custom')}
                  className="flex-1"
                >
                  Describe Hero
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characterPresets.map((preset) => (
                  <Card
                    key={preset.class}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPreset?.class === preset.class
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{preset.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{preset.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {preset.description}
                        </p>
                        <div className="text-xs space-y-1">
                          {Object.entries(preset.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="capitalize">{stat.slice(0, 3).toUpperCase()}:</span>
                              <span className={value >= 16 ? 'text-green-600 font-semibold' : ''}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedPreset && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleConfirmPreset} size="lg">
                    Begin Adventure as {selectedPreset.name}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2 mb-6">
                <Button
                  variant="outline"
                  onClick={() => setMode('preset')}
                  className="flex-1"
                >
                  Choose Preset
                </Button>
                <Button
                  variant="default"
                  onClick={() => setMode('custom')}
                  className="flex-1"
                >
                  Describe Hero
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe Your Hero
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe your character's appearance, background, skills, and personality. For example: 'A brave knight from the northern kingdoms, skilled with sword and shield, with a strong sense of justice and a mysterious past...'"
                    className="w-full h-32 p-3 border rounded-md resize-none"
                  />
                </div>

                <Button
                  onClick={handleGenerateCharacter}
                  disabled={!customDescription.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Character...' : 'Generate Stats'}
                </Button>

                {generatedCharacter && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h3 className="font-semibold mb-2">Generated Character</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {generatedCharacter.name}
                        </div>
                        <div>
                          <span className="font-medium">Class:</span> {generatedCharacter.class}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(generatedCharacter.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between">
                            <span className="capitalize">{stat.slice(0, 3).toUpperCase()}:</span>
                            <span className={value >= 16 ? 'text-green-600 font-semibold' : ''}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleConfirmCustom} className="w-full">
                        Accept Character
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={goBack}>
                  Back to Presets
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}