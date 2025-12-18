"use client";

import { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter = ({
  text,
  speed = 20,
  onComplete,
}: TypewriterProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chars, setChars] = useState<{ char: string; id: number }[]>([]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setChars((prev) => [...prev, { char: text[currentIndex], id: currentIndex }]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {chars.map((item) => (
        <span key={item.id} className="animate-fade-in-slow inline">
          {item.char}
        </span>
      ))}
    </span>
  );
};
