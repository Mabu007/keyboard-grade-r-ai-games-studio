import React from 'react';

interface Props {
  onInput: (btn: string) => void;
}

export const MemoryGamepad: React.FC<Props> = ({ onInput }) => {
  return (
    <div className="h-full w-full bg-indigo-950 p-6 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg aspect-square">
        <button
          onPointerDown={() => onInput('A')}
          className="bg-red-500 rounded-3xl border-b-[12px] border-red-800 active:border-b-0 active:translate-y-3 transition-all flex items-center justify-center shadow-lg"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full"></div>
        </button>
        <button
          onPointerDown={() => onInput('B')}
          className="bg-blue-500 rounded-3xl border-b-[12px] border-blue-800 active:border-b-0 active:translate-y-3 transition-all flex items-center justify-center shadow-lg"
        >
           <div className="w-16 h-16 bg-white/20 rounded-full"></div>
        </button>
        <button
          onPointerDown={() => onInput('C')}
          className="bg-green-500 rounded-3xl border-b-[12px] border-green-800 active:border-b-0 active:translate-y-3 transition-all flex items-center justify-center shadow-lg"
        >
           <div className="w-16 h-16 bg-white/20 rounded-full"></div>
        </button>
        <button
          onPointerDown={() => onInput('D')}
          className="bg-yellow-500 rounded-3xl border-b-[12px] border-yellow-800 active:border-b-0 active:translate-y-3 transition-all flex items-center justify-center shadow-lg"
        >
           <div className="w-16 h-16 bg-white/20 rounded-full"></div>
        </button>
      </div>
    </div>
  );
};