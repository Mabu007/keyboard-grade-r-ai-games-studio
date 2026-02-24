import React from 'react';
import { ArrowLeft, ArrowRight, Play, Settings } from 'lucide-react';

interface Props {
  onInput: (btn: string) => void;
}

export const MenuGamepad: React.FC<Props> = ({ onInput }) => {
  return (
    <div className="h-full w-full bg-slate-900 flex flex-col p-6">
      <div className="flex-1 flex gap-4 mb-4">
        {/* Previous */}
        <button 
          onPointerDown={() => onInput('C')}
          className="flex-1 bg-slate-800 rounded-3xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 active:bg-slate-700 active:ring-4 ring-indigo-500/50 transition-all flex items-center justify-center group"
        >
          <ArrowLeft size={48} className="text-slate-400 group-active:text-white group-active:scale-125 transition-transform" />
        </button>

        {/* Next */}
        <button 
          onPointerDown={() => onInput('B')}
          className="flex-1 bg-slate-800 rounded-3xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 active:bg-slate-700 active:ring-4 ring-indigo-500/50 transition-all flex items-center justify-center group"
        >
          <ArrowRight size={48} className="text-slate-400 group-active:text-white group-active:scale-125 transition-transform" />
        </button>
      </div>

      <div className="h-32 flex gap-4">
        {/* Config */}
        <button 
          onPointerDown={() => onInput('D')}
          className="w-32 bg-slate-800 rounded-3xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 active:bg-slate-700 active:ring-4 ring-indigo-500/50 transition-all flex items-center justify-center group"
        >
          <Settings size={32} className="text-slate-500 group-active:text-white group-active:rotate-90 transition-all" />
        </button>

        {/* Select */}
        <button 
          onPointerDown={() => onInput('A')}
          className="flex-1 bg-green-500 rounded-3xl border-b-8 border-green-700 active:border-b-0 active:translate-y-2 active:bg-green-600 active:ring-4 ring-green-400/50 transition-all flex items-center justify-center gap-2 group"
        >
          <Play size={32} className="text-white fill-current group-active:scale-110 transition-transform" />
          <span className="text-2xl font-black text-white uppercase tracking-wider">PLAY</span>
        </button>
      </div>
    </div>
  );
};