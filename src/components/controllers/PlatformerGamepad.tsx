import React from 'react';
import { Triangle, Circle, Square, X } from 'lucide-react';

interface Props {
  onInput: (btn: string) => void;
}

const handlePress = (e: React.PointerEvent, code: string, onInput: (btn: string) => void) => {
  e.preventDefault(); // Prevent scrolling
  if (navigator.vibrate) navigator.vibrate(15);
  onInput(`${code}_DOWN`);
};

const handleRelease = (e: React.PointerEvent, code: string, onInput: (btn: string) => void) => {
  e.preventDefault();
  onInput(`${code}_UP`);
};

interface DPadBtnProps {
  code: string;
  rotate?: string;
  className?: string;
  onInput: (btn: string) => void;
}

const DPadBtn: React.FC<DPadBtnProps> = ({ code, rotate, className, onInput }) => (
  <button
    className={`absolute w-14 h-14 bg-slate-800 active:bg-slate-700 flex items-center justify-center ${className}`}
    onPointerDown={(e) => handlePress(e, code, onInput)}
    onPointerUp={(e) => handleRelease(e, code, onInput)}
    onPointerLeave={(e) => handleRelease(e, code, onInput)}
    onPointerCancel={(e) => handleRelease(e, code, onInput)}
  >
    <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-slate-400 ${rotate}`}></div>
  </button>
);

interface ActionBtnProps {
  code: string;
  color: string;
  children: React.ReactNode;
  size?: number;
  onInput: (btn: string) => void;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ code, color, children, size = 64, onInput }) => (
  <button
      className={`w-${size/4} h-${size/4} rounded-full bg-slate-800 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 active:bg-slate-700 flex items-center justify-center shadow-lg transition-all`}
      style={{ width: size, height: size }}
      onPointerDown={(e) => handlePress(e, code, onInput)}
      onPointerUp={(e) => handleRelease(e, code, onInput)}
      onPointerLeave={(e) => handleRelease(e, code, onInput)}
      onPointerCancel={(e) => handleRelease(e, code, onInput)}
  >
      {children}
  </button>
);

export const PlatformerGamepad: React.FC<Props> = ({ onInput }) => {
  return (
    <div className="h-full w-full bg-zinc-900 flex px-2 relative overflow-hidden select-none">
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-zinc-900 to-black"></div>

      {/* LEFT: D-PAD */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-slate-900/50 rounded-full blur-xl"></div>
            
            {/* Cross Shape Container */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40">
                <DPadBtn code="UP" className="top-0 left-1/2 -translate-x-1/2 rounded-t-lg" onInput={onInput} />
                <DPadBtn code="DOWN" rotate="rotate-180" className="bottom-0 left-1/2 -translate-x-1/2 rounded-b-lg" onInput={onInput} />
                <DPadBtn code="LEFT" rotate="-rotate-90" className="left-0 top-1/2 -translate-y-1/2 rounded-l-lg" onInput={onInput} />
                <DPadBtn code="RIGHT" rotate="rotate-90" className="right-0 top-1/2 -translate-y-1/2 rounded-r-lg" onInput={onInput} />
                
                {/* Center fill */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-slate-800"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 rounded-full shadow-inner"></div>
            </div>
        </div>
      </div>

      {/* CENTER: MENU / PAUSE */}
      <div className="w-24 flex flex-col items-center justify-center gap-6 z-10 opacity-50">
         <div className="text-slate-500 font-bold tracking-widest text-[10px]">SELECT</div>
         <div className="w-16 h-8 bg-slate-800 rounded-full border border-slate-700"></div>
         <div className="w-16 h-8 bg-slate-800 rounded-full border border-slate-700"></div>
         <div className="text-slate-500 font-bold tracking-widest text-[10px]">START</div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="relative w-64 h-64">
           {/* Triangle (Top) - Interact/Dash */}
           <div className="absolute top-2 left-1/2 -translate-x-1/2">
             <ActionBtn code="TRIANGLE" color="text-green-500" onInput={onInput}>
                <Triangle className="text-green-500 fill-current" size={32} />
             </ActionBtn>
           </div>

           {/* Circle (Right) - Back */}
           <div className="absolute right-2 top-1/2 -translate-y-1/2">
             <ActionBtn code="CIRCLE" color="text-red-500" onInput={onInput}>
                <Circle className="text-red-500 fill-current" size={32} />
             </ActionBtn>
           </div>

           {/* X (Bottom) - JUMP (Main) */}
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
             <ActionBtn code="X" color="text-blue-500" size={80} onInput={onInput}>
                <X className="text-blue-500" strokeWidth={5} size={40} />
             </ActionBtn>
           </div>

           {/* Square (Left) - SHOOT */}
           <div className="absolute left-2 top-1/2 -translate-y-1/2">
             <ActionBtn code="SQUARE" color="text-pink-500" onInput={onInput}>
                <Square className="text-pink-500 fill-current" size={32} />
             </ActionBtn>
           </div>
        </div>
      </div>
    </div>
  );
};