import { 
  Cat, Dog, Fish, Bug, Bird, 
  Sun, Moon, Star, Cloud,
  Car, Bus, Bike, Ship, 
  Bed, Coffee, Key, Box, 
  Pen, Map, Gift, 
  Cake, Milk, Home, 
  Palette, Phone
} from 'lucide-react';
import React from 'react';

export interface SpellChallenge {
  icon: React.ElementType;
  word: string;
  missingIndex: number;
  options: string[]; // 4 options
  correctOption: string;
  color: string; // Icon color
}

const words = [
  // NATURE & ANIMALS
  { word: 'cat', icon: Cat, color: 'text-orange-400' },
  { word: 'dog', icon: Dog, color: 'text-amber-700' },
  { word: 'fish', icon: Fish, color: 'text-blue-400' },
  { word: 'bug', icon: Bug, color: 'text-green-500' },
  { word: 'bird', icon: Bird, color: 'text-sky-400' },
  { word: 'sun', icon: Sun, color: 'text-yellow-400' },
  { word: 'moon', icon: Moon, color: 'text-slate-300' },
  { word: 'star', icon: Star, color: 'text-yellow-300' },
  { word: 'rain', icon: Cloud, color: 'text-blue-300' },
  
  // VEHICLES
  { word: 'car', icon: Car, color: 'text-red-500' },
  { word: 'bus', icon: Bus, color: 'text-yellow-500' },
  { word: 'bike', icon: Bike, color: 'text-purple-500' },
  { word: 'ship', icon: Ship, color: 'text-blue-600' },
  
  // HOUSE & OBJECTS
  { word: 'bed', icon: Bed, color: 'text-indigo-400' },
  { word: 'cup', icon: Coffee, color: 'text-amber-800' },
  { word: 'key', icon: Key, color: 'text-yellow-500' },
  { word: 'box', icon: Box, color: 'text-amber-600' },
  { word: 'pen', icon: Pen, color: 'text-blue-500' },
  { word: 'map', icon: Map, color: 'text-emerald-500' },
  { word: 'gift', icon: Gift, color: 'text-pink-500' },
  { word: 'cake', icon: Cake, color: 'text-pink-400' },
  { word: 'milk', icon: Milk, color: 'text-slate-100' },
  { word: 'home', icon: Home, color: 'text-orange-500' },
  
  // OTHERS
  { word: 'red', icon: Palette, color: 'text-red-500' },
  { word: 'blue', icon: Palette, color: 'text-blue-500' }
];

const generateChallenges = (): SpellChallenge[] => {
  return words.map((item) => {
    // Pick a random missing letter index
    const missingIndex = Math.floor(Math.random() * item.word.length);
    const correctLetter = item.word[missingIndex];
    
    // Generate distractors
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const options = new Set<string>();
    options.add(correctLetter);
    
    while(options.size < 4) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (randomChar !== correctLetter) {
        options.add(randomChar);
      }
    }

    return {
      icon: item.icon, 
      word: item.word,
      color: item.color,
      missingIndex,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      correctOption: correctLetter
    };
  });
};

// Shuffle the full deck
export const challenges: SpellChallenge[] = generateChallenges().sort(() => Math.random() - 0.5);

export const getNextChallenge = (currentIndex: number) => {
  return challenges[(currentIndex + 1) % challenges.length];
};