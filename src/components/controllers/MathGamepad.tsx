import React from 'react';
import { Rocket } from 'lucide-react';

interface Props {
  onInput: (btn: string) => void;
  labels: string[];
}

export const MathGamepad: React.FC<Props> = ({ onInput, labels }) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const darken = ['border-red-700', 'border-blue-700', 'border-green-700', 'border-yellow-700'];
  const inputs = ['A', 'B', 'C', 'D'];

  return (
    <div className="h-full w-full bg-slate-950 flex p-4 gap-4">
      {inputs.map((btn, i) => (
        <button
          key={btn}
          onPointerDown={() => onInput(btn)}
          className={`flex-1 ${colors[i]} rounded-2xl border-b-[12px] ${darken[i]} active:border-b-0 active:translate-y-3 transition-all flex flex-col items-center justify-end pb-8 relative overflow-hidden group`}
        >
          {/* Decorative lane marker */}
          <div className="absolute top-0 w-2 h-full bg-white/20 group-active:bg-white/40"></div>
          
          <span className="text-5xl font-black text-white drop-shadow-lg z-10 mb-4">{labels[i]}</span>
          <Rocket className="text-white/50 w-12 h-12 z-10 group-active:text-white group-active:-translate-y-20 transition-transform duration-300" />
        </button>
      ))}
    </div>
  );
};