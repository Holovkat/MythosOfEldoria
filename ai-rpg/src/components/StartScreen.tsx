'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Sparkles, Play, BookOpen, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import type { CloudAdventure } from '@/types/game';

export function StartScreen() {
  const router = useRouter();
  const resetGame = useGameStore((state) => state.resetGame);
  const loadAdventure = useGameStore((state) => state.loadAdventure);
  const adventures = useQuery(api.adventures.listAdventures);
  const [showArchive, setShowArchive] = useState(false);

  const handleNewGame = () => {
    resetGame();
    router.push('/game');
  };

  const handleResumeAdventure = (adv: CloudAdventure) => {
    loadAdventure(adv);
    router.push('/game');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing/hero-bg.png"
          alt="Mythos of Eldoria Cinematic Background"
          fill
          className="object-cover opacity-60 scale-105 animate-pulse-slow font-sans"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 font-sans" />
      </div>

      {/* Content Card with Glassmorphism */}
      <div className="relative z-10 w-full max-w-lg p-10 mx-4 text-center space-y-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-1000">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] uppercase tracking-[0.2em] font-bold animate-bounce-slow">
            <Sparkles className="w-3 h-3" />
            Empowered by AI
          </div>
          
          <h1 className="text-6xl font-black text-white font-serif tracking-tighter drop-shadow-2xl">
            Mythos of <span className="text-primary italic font-serif">Eldoria</span>
          </h1>
          
          <p className="text-lg text-white/70 font-serif italic max-w-sm mx-auto leading-relaxed">
            &ldquo;Step into an infinite saga where your choices weave the very fabric of legend.&rdquo;
          </p>
        </div>

        {!showArchive ? (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              onClick={handleNewGame}
              size="lg"
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Play className="w-5 h-5 mr-2 fill-current transition-transform group-hover:translate-x-1" />
              Begin New Legend
            </Button>

            <Button
              onClick={() => setShowArchive(true)}
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Continue Tale
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Legends
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/60 hover:text-white"
                onClick={() => setShowArchive(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </div>

            <ScrollArea className="h-64 pr-4">
              <div className="space-y-3">
                {!adventures ? (
                  <div className="py-12 text-center text-white/40 italic animate-pulse">
                    Consulting the archives...
                  </div>
                ) : adventures.length === 0 ? (
                  <div className="py-12 text-center text-white/40 italic">
                    No adventures found in the stars.
                  </div>
                ) : (
                  adventures.map((adv: CloudAdventure) => (
                    <Card 
                      key={adv._id}
                      className="p-4 bg-white/5 border-white/10 hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => handleResumeAdventure(adv)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="font-serif font-bold text-white group-hover:text-primary transition-colors">
                            {adv.title}
                          </div>
                          <div className="text-xs text-white/40 flex items-center gap-2">
                            <span>{adv.character?.name || "Nameless Hero"}</span>
                            <span>•</span>
                            <span>{new Date(adv.lastUpdated).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary" /> Procedural Narratives</span>
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary" /> Dynamic World State</span>
          </div>
        </div>
      </div>

      {/* Ambient Vignette */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
    </div>
  );
}