import React, { createContext, useContext, useEffect, useState } from 'react';
import { InputEvent } from '../types';

interface InputContextType {
  lastInput: InputEvent | null;
}

const InputContext = createContext<InputContextType | null>(null);

export const InputProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastInput, setLastInput] = useState<InputEvent | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Ignore game inputs if user is typing in a form field
      if (isInput) return;

      // If pressing Enter on a button, don't trigger Game 'A' input to prevent conflicts
      if (target.tagName === 'BUTTON' && e.code === 'Enter') return;
      
      const timestamp = Date.now();
      let button = '';
      
      // --- MAPPINGS ---
      // Navigation / Platformer
      if (e.code === 'ArrowLeft') button = 'LEFT_DOWN';
      if (e.code === 'ArrowRight') button = 'RIGHT_DOWN';
      if (e.code === 'ArrowUp') button = 'UP_DOWN';
      if (e.code === 'ArrowDown') button = 'DOWN_DOWN';
      if (e.code === 'Space') button = 'UP_DOWN'; // Jump alias
      if (e.code === 'KeyZ') button = 'SQUARE_DOWN'; // Shoot alias
      
      // Standard Game Buttons (1-4)
      if (e.key === '1') button = 'A';
      if (e.key === '2') button = 'B';
      if (e.key === '3') button = 'C';
      if (e.key === '4') button = 'D';
      
      // Menu / Generic Aliases
      if (e.code === 'Enter') button = 'A'; // Select
      
      // Navigation Back
      if (e.code === 'Escape' || e.code === 'Backspace') button = 'BACK';
      
      // Emit if valid
      if (button) setLastInput({ button, timestamp });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
       const target = e.target as HTMLElement;
       const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
       if (isInput) return;

       const timestamp = Date.now();
       let button = '';
       if (e.code === 'ArrowLeft') button = 'LEFT_UP';
       if (e.code === 'ArrowRight') button = 'RIGHT_UP';
       if (e.code === 'ArrowUp') button = 'UP_UP';
       if (e.code === 'ArrowDown') button = 'DOWN_UP';
       if (e.code === 'Space') button = 'UP_UP';
       if (e.code === 'KeyZ') button = 'SQUARE_UP';
       
       if (button) setLastInput({ button, timestamp });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    }
  }, []);

  return (
    <InputContext.Provider value={{ lastInput }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => {
  const context = useContext(InputContext);
  if (!context) throw new Error('useInput must be used within InputProvider');
  return context;
};