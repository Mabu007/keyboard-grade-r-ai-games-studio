import React, { useEffect, useState, useRef } from 'react';
import { GameProps } from '../../types';

interface Word {
  id: number;
  text: string;
  type: 'A' | 'B' | 'C' | 'D'; // Maps to controller buttons
  color: string;
  top: number;
  left: number;
}

const WORDS_LIST = ['CAT', 'DOG', 'SUN', 'FUN', 'RUN', 'SKY', 'RED', 'BLUE'];

const StickyWords: React.FC<GameProps> = ({ lastInput }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Spawn words
  useEffect(() => {
    const loop = (time: number) => {
      if (time - lastSpawnRef.current > 1500) { // Spawn every 1.5s
        lastSpawnRef.current = time;
        const types: ('A'|'B'|'C'|'D')[] = ['A', 'B', 'C', 'D'];
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
        const typeIndex = Math.floor(Math.random() * 4);
        
        const newWord: Word = {
          id: Date.now(),
          text: WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)],
          type: types[typeIndex],
          color: colors[typeIndex],
          top: -10, // Start above screen
          left: Math.random() * 80 + 10 // 10% to 90% width
        };
        setWords(prev => [...prev, newWord]);
      }

      setWords(prev => prev.map(w => ({ ...w, top: w.top + 0.5 })).filter(w => w.top < 110));
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  // Handle Input
  useEffect(() => {
    if (!lastInput) return;
    
    // Find matching word
    setWords(prev => {
      const matchIndex = prev.findIndex(w => w.type === lastInput.button && w.top > 0 && w.top < 90);
      if (matchIndex !== -1) {
        setScore(s => s + 10);
        const newWords = [...prev];
        newWords.splice(matchIndex, 1);
        return newWords;
      }
      return prev;
    });

  }, [lastInput]);

  return (
    <div className="relative w-full h-full bg-sky-900 overflow-hidden">
      <div className="absolute top-4 left-4 text-white text-3xl font-bold z-10">Score: {score}</div>
      <div className="absolute bottom-0 w-full h-2 bg-white/20"></div>
      
      {words.map(word => (
        <div
          key={word.id}
          className={`absolute px-4 py-2 rounded-full text-white font-bold text-xl shadow-lg border-2 border-white ${word.color}`}
          style={{ top: `${word.top}%`, left: `${word.left}%`, transform: 'translateX(-50%)' }}
        >
          {word.text}
        </div>
      ))}
      
      <div className="absolute bottom-8 w-full text-center text-white/50">
        Press 1 (Red), 2 (Blue), 3 (Green), or 4 (Yellow)!
      </div>
    </div>
  );
};

export default StickyWords;