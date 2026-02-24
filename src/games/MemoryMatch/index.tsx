import React, { useEffect, useState } from 'react';
import { GameProps } from '../../types';
import { getInitialCards, Card, CardState } from './gameLogic';

const MemoryMatch: React.FC<GameProps> = ({ lastInput }) => {
  const [cards, setCards] = useState<Card[]>(getInitialCards());
  const [cardStates, setCardStates] = useState<CardState[]>(['hidden', 'hidden', 'hidden', 'hidden']);
  const [selection, setSelection] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!lastInput) return;

    if (selection.length >= 2) return; 

    const buttonMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const index = buttonMap[lastInput.button];

    if (index !== undefined && cardStates[index] === 'hidden') {
      // Flip card
      const newStates = [...cardStates];
      newStates[index] = 'flipped';
      setCardStates(newStates);
      setSelection(prev => [...prev, index]);
    }
  }, [lastInput]);

  useEffect(() => {
    if (selection.length === 2) {
      const [first, second] = selection;
      if (cards[first].color === cards[second].color) {
        // Match
        setTimeout(() => {
          setCardStates(prev => {
            const ns = [...prev];
            ns[first] = 'matched';
            ns[second] = 'matched';
            return ns;
          });
          setSelection([]);
          setScore(s => s + 10);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCardStates(prev => {
            const ns = [...prev];
            ns[first] = 'hidden';
            ns[second] = 'hidden';
            return ns;
          });
          setSelection([]);
        }, 1000);
      }
    }
  }, [selection, cards]);

  useEffect(() => {
    if (cardStates.every(s => s === 'matched')) {
      setTimeout(() => {
        setCards(getInitialCards());
        setCardStates(['hidden', 'hidden', 'hidden', 'hidden']);
      }, 1500);
    }
  }, [cardStates]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-indigo-950 p-8">
      <h2 className="text-3xl text-white font-bold mb-8">Memory Match</h2>
      <div className="text-xl text-yellow-300 mb-4">Score: {score}</div>
      
      <div className="grid grid-cols-2 gap-8">
        {cards.map((card, i) => (
          <div 
            key={card.id}
            className={`w-40 h-40 rounded-2xl flex items-center justify-center text-white text-4xl font-bold transition-all duration-500 transform ${cardStates[i] === 'flipped' || cardStates[i] === 'matched' ? 'rotate-y-180' : ''} ${card.buttonColor} border-4 border-white/30 relative`}
          >
            <div className="absolute top-2 left-2 text-xs font-mono opacity-50 text-white">KEY {i+1}</div>
            {cardStates[i] === 'hidden' ? (
              <span className="opacity-50">?</span>
            ) : (
              <div className="w-full h-full rounded-xl" style={{ backgroundColor: card.color }}></div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 text-white/50">Match the cards using keys 1, 2, 3, 4!</p>
    </div>
  );
};

export default MemoryMatch;