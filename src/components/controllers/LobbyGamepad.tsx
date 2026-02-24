import React from 'react';
import { Gamepad2 } from 'lucide-react';

export const LobbyGamepad: React.FC = () => {
  return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
        <Gamepad2 size={80} className="text-white relative z-10 animate-bounce" />
      </div>
      <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-8 animate-pulse text-center">
        GRADE R<br/>STUDIO
      </h1>
      <p className="text-slate-500 mt-4 text-sm font-mono text-center">Waiting for game selection...</p>
    </div>
  );
};