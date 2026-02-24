import React from 'react';

interface Props {
  onInput: (btn: string) => void;
  labels: string[];
}

export const SpellingGamepad: React.FC<Props> = ({ onInput, labels }) => {
  const inputs = ['A', 'B', 'C', 'D'];
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const borders = ['border-red-800', 'border-blue-800', 'border-green-800', 'border-yellow-800'];

  return (
    <div className="h-full w-full bg-slate-900 p-6 flex items-center justify-center">
      <div className="grid grid-cols-4 gap-6 w-full h-full max-h-[300px]">
        {inputs.map((btn, i) => (
          <button
            key={btn}
            onPointerDown={() => onInput(btn)}
            className={`${colors[i]} h-full rounded-3xl border-b-[16px] ${borders[i]} active:border-b-0 active:translate-y-4 transition-all flex items-center justify-center shadow-2xl`}
          >
            <span className="text-8xl font-black text-white drop-shadow-md">
              {labels[i] || '?'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};