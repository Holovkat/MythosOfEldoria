'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ImageIcon, Wand2 } from 'lucide-react';

interface StoryImageProps {
  prompt?: string;
  url?: string;
  onImageGenerated?: (url: string) => void;
}

export function StoryImage({ prompt, url, onImageGenerated }: StoryImageProps) {
  const [loading, setLoading] = useState(!url && !!prompt);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prompt && !url && !error) {
      generateImage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, url, error]);

  const generateImage = async (imagePrompt: string) => {
    setLoading(true);
    try {
      console.log('Requesting Nano Banana image for:', imagePrompt);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (onImageGenerated && data.url) {
        onImageGenerated(data.url);
      }
    } catch (err) {
      console.error('Nano Banana generation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!prompt && !url) return null;

  return (
    <Card className="my-4 overflow-hidden border-2 border-primary/20 bg-muted/30 shadow-2xl group relative">
      <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-black/40">
        {loading ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center animate-pulse">
            <div className="relative">
              <ImageIcon className="w-12 h-12 text-primary/40" />
              <Wand2 className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="space-y-2">
              <p className="font-serif italic text-primary/80">Painting the scene...</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest break-all px-4 line-clamp-2">
                {prompt}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground w-full h-full relative justify-center">
            <div className="absolute top-0 right-1 p-1">
               <button onClick={() => { setError(null); generateImage(prompt!); }} className="text-[8px] bg-red-500/20 hover:bg-red-500/40 px-2 py-0.5 rounded border border-red-500/30 transition-colors">Retry</button>
            </div>
            <ImageIcon className="w-8 h-8 opacity-20" />
            <p className="text-sm italic">The image was lost in the mists of time...</p>
            {error && <p className="text-[10px] text-red-500/60 max-w-[80%] mx-auto font-mono">{error}</p>}
          </div>
        ) : (url && (
          <>
            <Image 
              src={url} 
              alt={prompt || "Story moment"} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onLoad={() => setLoading(false)}
              unoptimized={url.startsWith('https://pollinations.ai') || url.startsWith('data:')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-[10px] text-white/70 italic font-serif line-clamp-2">
                &quot;{prompt}&quot;
              </p>
            </div>
          </>
        ))}
      </div>
      
      {/* Decorative corners for that high fantasy feel */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br-sm pointer-events-none" />
    </Card>
  );
}
