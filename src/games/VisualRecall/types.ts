export type InteractionType = 'TAP_SELECT' | 'DRAG_MATCH';

export interface Asset {
  id: string;
  data: string; // Base64 string
  type: 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'audio/mpeg' | 'audio/wav' | 'audio/mp3';
}

export interface Option {
  id: string;
  assetId?: string; // The image for this option
  text?: string;    // Fallback or label
  isCorrect: boolean;
  // For Drag-Match:
  matchZoneId?: string; // Which zone does this belong to?
}

export interface DropZone {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number;
  height: number;
  label?: string;
  assetId?: string; // Visual target
}

export interface Question {
  id: string;
  type: InteractionType;
  promptText?: string;
  promptAudioId?: string;
  backgroundImageId?: string; // For drag-match scenes
  options: Option[];
  dropZones?: DropZone[]; // Only for Drag-Match
}

export interface Quiz {
  id: string;
  title: string;
  thumbnailId?: string;
  questions: Question[];
  createdAt: number;
}
