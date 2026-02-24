import React from 'react';

interface Props {
  onInput: (btn: string) => void;
}

export const StickyGamepad: React.FC<Props> = ({ onInput }) => {
    // A linear layout often works better for "Catching" mechanics
  return (
    <div className="h-full w-full bg-sky-950 p-4 flex flex-col justify-center">
        <div className="text-center text-white/50 font-bold mb-2 uppercase tracking-widest text-xs">Tap color to catch word</div>
        <div className="flex-1 grid grid-cols-4 gap-4">
            <button onPointerDown={() => onInput('A')} className="bg-red-500 rounded-full border-4 border-white/20 active:scale-95 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.4)]"></button>
            <button onPointerDown={() => onInput('B')} className="bg-blue-500 rounded-full border-4 border-white/20 active:scale-95 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.4)]"></button>
            <button onPointerDown={() => onInput('C')} className="bg-green-500 rounded-full border-4 border-white/20 active:scale-95 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.4)]"></button>
            <button onPointerDown={() => onInput('D')} className="bg-yellow-500 rounded-full border-4 border-white/20 active:scale-95 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.4)]"></button>
        </div>
    </div>
  );
};