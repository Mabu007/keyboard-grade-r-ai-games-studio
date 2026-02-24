import { 
  Cat, Dog, Sun, Moon, Cloud, Star, 
  Car, Bike, Heart, Zap, Flame, 
  Droplets, Snowflake, Ghost, Crown 
} from 'lucide-react';
import React from 'react';

export interface TargetDef {
  word: string;
  icon: React.ElementType;
}

export const TARGETS: TargetDef[] = [
  { word: "CAT", icon: Cat },
  { word: "DOG", icon: Dog },
  { word: "SUN", icon: Sun },
  { word: "MOON", icon: Moon },
  { word: "RAIN", icon: Cloud },
  { word: "STAR", icon: Star },
  { word: "CAR", icon: Car },
  { word: "BIKE", icon: Bike },
  { word: "LOVE", icon: Heart },
  { word: "ZAP", icon: Zap },
  { word: "FIRE", icon: Flame },
  { word: "WATER", icon: Droplets },
  { word: "COLD", icon: Snowflake },
  { word: "GHOST", icon: Ghost },
  { word: "KING", icon: Crown }
];

export interface StormWord {
  id: number;
  text: string;
  lane: 0 | 1 | 2 | 3;
  y: number;
  active: boolean;
  color: string;
}

export interface Bullet {
  id: number;
  lane: 0 | 1 | 2 | 3;
  y: number;
  active: boolean;
}

export const getLaneColor = (lane: number) => {
  switch(lane) {
    case 0: return '#ef4444'; // Red
    case 1: return '#3b82f6'; // Blue
    case 2: return '#22c55e'; // Green
    case 3: return '#eab308'; // Yellow
    default: return '#fff';
  }
};