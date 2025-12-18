'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useGameStore((state) => state.settings.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
