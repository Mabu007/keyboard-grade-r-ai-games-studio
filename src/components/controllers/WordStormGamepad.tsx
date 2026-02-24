import React from 'react';
import { Crosshair } from 'lucide-react';

interface Props {
  onInput: (btn: string) => void;
  target?: string;
}

export const WordStormGamepad: React.FC<Props> = ({ onInput, target }) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const borders = ['border-red-800', 'border-blue-800', 'border-green-800', 'border-yellow-800'];
  const glow = ['shadow-[0_0_30px_rgba(239,68,68,0.3)]', 'shadow-[0_0_30px_rgba(59,130,246,0.3)]', 'shadow-[0_0_30px_rgba(34,197,94,0.3)]', 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'];
  const inputs = ['A', 'B', 'C', 'D'];

  return (
    <div className="h-full w-full bg-slate-950 p-4 flex flex-col">
      <div className="mb-4 text-center bg-slate-900 rounded-xl py-2 border border-slate-800">
        <h3 className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">CURRENT TARGET</h3>
        <div className="text-3xl font-black text-white animate-pulse tracking-widest">{target || "READY"}</div>
      </div>
      
      <div className="flex-1 grid grid-cols-4 gap-2">
        {inputs.map((btn, i) => (
          <button
            key={btn}
            onPointerDown={() => onInput(btn)}
            className={`
              ${colors[i]} ${borders[i]} ${glow[i]}
              rounded-full h-full flex flex-col items-center justify-end pb-8
              border-b-[12px] active:border-b-0 active:translate-y-3 transition-all
              relative overflow-hidden group
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <Crosshair size={40} className="text-white/80 group-active:text-white group-active:scale-110 transition-transform z-10" />
            <div className="mt-4 text-2xl font-black text-white/50">{btn}</div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center text-[10px] text-slate-500 font-mono">
         TAP TO FIRE • MATCH THE IMAGE
      </div>
    </div>
  );
};