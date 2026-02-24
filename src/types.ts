import React from 'react';

export type MessageType = 
  | 'CREATE_SESSION' 
  | 'SESSION_CREATED' 
  | 'JOIN_SESSION' 
  | 'JOINED' 
  | 'PLAYER_JOINED' 
  | 'PLAYER_LEFT' 
  | 'INPUT' 
  | 'GAME_STATE'
  | 'NAV_HOME'
  | 'ERROR'
  | 'REQUEST_STATE'; // Payload: {}

export interface WSMessage {
  type: MessageType;
  payload: any;
}

export interface InputEvent {
  button: string;
  timestamp: number;
}

export interface GameProps {
  onGameOver: (score: number) => void;
  lastInput: InputEvent | null;
  playerCount: number;
}

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  component: React.FC<GameProps>;
  color: string;
  icon: string;
}