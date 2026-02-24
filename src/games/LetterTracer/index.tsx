import React, { useState, useRef, useMemo } from 'react';
import { GameProps } from '../../types';
import { Play, RotateCcw, Eraser, ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const PATHS: Record<string, string> = {
  'A': "M50,10 L20,85 M50,10 L80,85 M35,55 L65,55",
  'B': "M30,10 L30,85 M30,10 Q80,10 80,45 M30,45 Q80,45 80,85 L30,85",
  'C': "M80,30 Q80,10 50,10 Q20,10 20,45 Q20,85 50,85 Q80,85 80,60",
  'D': "M30,10 L30,85 M30,10 Q85,10 85,45 Q85,85 30,85",
  'E': "M80,10 L30,10 L30,85 L80,85 M30,45 L65,45",
  'F': "M80,10 L30,10 L30,85 M30,45 L65,45",
  'G': "M80,30 Q80,10 50,10 Q20,10 20,45 Q20,85 50,85 Q80,85 80,50 L55,50",
  'H': "M30,10 L30,85 M80,10 L80,85 M30,45 L80,45",
  'I': "M30,10 L70,10 M50,10 L50,85 M30,85 L70,85",
  'J': "M70,10 L70,60 Q70,85 45,85 Q20,85 20,60",
  'K': "M30,10 L30,85 M75,10 L30,45 M35,40 L75,85",
  'L': "M30,10 L30,85 L75,85",
  'M': "M20,85 L20,10 L50,45 L80,10 L80,85",
  'N': "M25,85 L25,10 L75,85 L75,10",
  'O': "M50,10 Q20,10 20,45 Q20,85 50,85 Q80,85 80,45 Q80,10 50,10",
  'P': "M30,85 L30,10 Q80,10 80,45 Q80,55 30,55",
  'Q': "M50,10 Q20,10 20,45 Q20,85 50,85 Q80,85 80,45 Q80,10 50,10 M60,60 L85,85",
  'R': "M30,85 L30,10 Q80,10 80,45 Q80,55 30,55 M45,55 L80,85",
  'S': "M75,30 Q75,10 50,10 Q25,10 25,30 Q25,45 50,50 Q75,55 75,70 Q75,85 50,85 Q25,85 25,70",
  'T': "M20,10 L80,10 M50,10 L50,85",
  'U': "M25,10 L25,60 Q25,85 50,85 Q75,85 75,60 L75,10",
  'V': "M20,10 L50,85 L80,10",
  'W': "M15,10 L30,85 L50,45 L70,85 L85,10",
  'X': "M25,10 L75,85 M75,10 L25,85",
  'Y': "M20,10 L50,45 L80,10 M50,45 L50,85",
  'Z': "M25,10 L75,10 L25,85 L75,85",
  '1': "M35,30 L50,10 L50,85",
  '2': "M25,35 Q25,10 50,10 Q75,10 75,40 Q75,60 25,85 L75,85",
  '3': "M25,25 Q75,10 75,45 Q75,55 50,55 M50,55 Q75,55 75,90 Q75,100 25,85",
  '4': "M60,10 L20,60 L80,60 M60,10 L60,85",
  '5': "M75,10 L30,10 L30,45 Q75,40 75,65 Q75,85 25,85",
  '6': "M70,15 Q30,10 30,50 Q30,85 55,85 Q80,85 80,60 Q80,40 55,40 Q30,40 30,50",
  '7': "M25,10 L80,10 L45,85",
  '8': "M50,45 Q30,45 30,25 Q30,10 50,10 Q70,10 70,25 Q70,45 50,45 M50,45 Q75,45 75,65 Q75,85 50,85 Q25,85 25,65 Q25,45 50,45",
  '9': "M70,50 Q70,10 45,10 Q20,10 20,40 Q20,65 45,65 Q70,65 70,40 M70,40 L70,85 Q70,95 50,95",
  '0': "M50,10 Q20,10 20,45 Q20,85 50,85 Q80,85 80,45 Q80,10 50,10",
  'a': "M75,50 Q75,25 45,25 Q20,25 20,55 Q20,85 45,85 Q75,85 75,55 M75,25 L75,85",
  'b': "M25,10 L25,85 M25,55 Q25,45 50,45 Q75,45 75,65 Q75,85 50,85 Q25,85 25,75",
  'c': "M75,40 Q70,25 50,25 Q20,25 20,55 Q20,85 50,85 Q70,85 75,70",
  'd': "M75,55 Q75,45 50,45 Q25,45 25,65 Q25,85 50,85 Q75,85 75,75 M75,10 L75,85",
  'e': "M25,55 L75,55 Q75,25 50,25 Q20,25 20,55 Q20,85 50,85 Q70,85 75,70",
  'f': "M60,10 Q40,10 40,30 L40,85 M25,45 L60,45",
  'g': "M75,50 Q75,25 45,25 Q20,25 20,55 Q20,85 45,85 Q75,85 75,55 M75,25 L75,85 Q75,115 50,115 Q30,115 25,100",
  'h': "M25,10 L25,85 M25,50 Q25,45 50,45 Q75,45 75,60 L75,85",
  'i': "M50,40 L50,85 M50,20 L50,25",
  'j': "M50,40 L50,85 Q50,115 30,115 M50,20 L50,25",
  'k': "M25,10 L25,85 M70,45 L25,65 M45,55 L70,85",
  'l': "M50,10 L50,85",
  'm': "M20,45 L20,85 M20,55 Q20,45 40,45 Q50,45 50,55 L50,85 M50,55 Q50,45 70,45 Q80,45 80,55 L80,85",
  'n': "M25,45 L25,85 M25,55 Q25,45 50,45 Q75,45 75,60 L75,85",
  'o': "M50,25 Q20,25 20,55 Q20,85 50,85 Q80,85 80,55 Q80,25 50,25",
  'p': "M25,45 L25,115 M25,55 Q25,45 50,45 Q75,45 75,65 Q75,85 50,85 Q25,85 25,75",
  'q': "M75,50 Q75,25 45,25 Q20,25 20,55 Q20,85 45,85 Q75,85 75,55 M75,25 L75,115",
  'r': "M25,45 L25,85 M25,55 Q25,45 50,45 Q65,45 70,55",
  's': "M75,40 Q70,25 50,25 Q30,25 30,40 Q30,55 50,55 Q70,55 70,70 Q70,85 50,85 Q30,85 25,70",
  't': "M50,15 L50,75 Q50,85 65,85 M30,45 L70,45",
  'u': "M25,45 L25,70 Q25,85 50,85 Q75,85 75,70 L75,45 M75,45 L75,85",
  'v': "M25,45 L50,85 L75,45",
  'w': "M15,45 L30,85 L50,55 L70,85 L85,45",
  'x': "M25,45 L75,85 M75,45 L25,85",
  'y': "M25,45 L25,70 Q25,85 50,85 Q75,85 75,70 L75,45 M75,45 L75,85 Q75,115 50,115 Q30,115 25,100",
  'z': "M25,45 L75,45 L25,85 L75,85",
  ' ': "M0,0"
};

const AnimatedCharacter: React.FC<{ 
  char: string; 
  isActive: boolean; 
  isDone: boolean; 
  onComplete: () => void; 
  speed: number;
  index: number;
}> = ({ char, isActive, isDone, onComplete, speed, index }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const pathData = PATHS[char] || PATHS[char.toUpperCase()] || PATHS[' '];
  
  const strokes = useMemo(() => {
    return pathData.split(/(?=M)/).filter(s => s.trim().length > 0);
  }, [pathData]);

  const pathsRef = useRef<SVGPathElement[]>([]);

  useGSAP(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: onComplete,
        defaults: { ease: "none" } 
      });

      // Reset all to hidden before starting
      gsap.set(pathsRef.current, { strokeDashoffset: 1, strokeDasharray: 1 });

      strokes.forEach((_, i) => {
        const path = pathsRef.current[i];
        if (path) {
          const length = path.getTotalLength();
          const variation = 0.95 + Math.random() * 0.1;
          const velocity = 35 + (speed * 1.5); 
          const duration = Math.max(0.1, (length / velocity) * variation);
          const delay = i === 0 ? 0 : 0.12 + Math.random() * 0.08;

          tl.to(path, {
            strokeDashoffset: 0,
            duration: duration,
            delay: delay,
            onStart: () => {
              // Wrapped in braces to return void, fixing TS error 2322
              gsap.set(path, { opacity: 1 });
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isActive, strokes, speed, onComplete]);

  useGSAP(() => {
    if (!isActive && !isDone) {
      gsap.set(pathsRef.current, { strokeDashoffset: 1, strokeDasharray: 1 });
    }
  }, [isActive, isDone, strokes]);

  return (
    // Fixed Tailwind class from border-b-[12px] to border-b-12
    <div className="w-48 h-64 md:w-80 md:h-[450px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 flex items-center justify-center border-b-12 border-slate-200 transition-all duration-300">
      <svg ref={containerRef} viewBox="0 0 100 120" className="w-full h-full overflow-visible">
        <path d={pathData} fill="none" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        
        {strokes.map((strokeD, i) => (
          <path 
            key={`${char}-${i}-${index}`}
            ref={el => { if (el) pathsRef.current[i] = el; }}
            d={strokeD}
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="7" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            pathLength="1"
            strokeDasharray="1"
            style={{ 
              strokeDashoffset: isDone ? 0 : 1,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

const LetterTracer: React.FC<GameProps> = () => {
  const [text, setText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(30); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);

  const startWriting = () => {
    if (!inputText) return;
    // Reset state first to force a re-mount of animations
    setText('');
    setActiveCharIndex(-1);
    
    setTimeout(() => {
        setText(inputText);
        setActiveCharIndex(0);
        setIsAnimating(true);
        if (window.innerWidth < 1024) setSidebarOpen(false);
    }, 50);
  };

  const handleRestart = () => {
    setIsAnimating(false);
    setActiveCharIndex(-1);
    // Tiny delay to allow React to clear the active state
    setTimeout(() => {
      setActiveCharIndex(0);
      setIsAnimating(true);
    }, 100);
  };

  const handleClear = () => {
    setText('');
    setInputText('');
    setActiveCharIndex(-1);
    setIsAnimating(false);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <main className="flex-1 relative flex flex-col items-center justify-center p-12 transition-all duration-500 overflow-y-auto overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="flex flex-wrap justify-center items-center gap-12 w-full max-w-[90vw]">
          {text.split('').map((char, index) => (
            <AnimatedCharacter 
              key={`${index}-${char}-${text.length}`} // Key change forces re-render on new words
              char={char}
              isActive={isAnimating && index === activeCharIndex}
              isDone={index < activeCharIndex}
              onComplete={() => setActiveCharIndex(prev => prev + 1)}
              speed={speed}
              index={index}
            />
          ))}
          {!text && (
            <div className="text-slate-200 text-[10rem] font-black select-none animate-pulse">
              ?
            </div>
          )}
        </div>

        {!sidebarOpen && text && (
            <div className="fixed bottom-8 left-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 z-40">
                 <button onClick={handleRestart} className="bg-white p-4 rounded-2xl shadow-lg text-indigo-600 hover:scale-110 transition-transform active:scale-95">
                    <RotateCcw size={32} />
                 </button>
                 <button onClick={handleClear} className="bg-white p-4 rounded-2xl shadow-lg text-red-500 hover:scale-110 transition-transform active:scale-95">
                    <Eraser size={32} />
                 </button>
            </div>
        )}
      </main>

      <aside className={`fixed top-0 right-0 h-full bg-white border-l border-slate-200 shadow-2xl transition-all duration-500 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-full max-w-[calc(100vw-60px)] md:w-[400px] md:max-w-none`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -left-12 -translate-y-1/2 bg-white border border-slate-200 w-12 h-24 rounded-l-3xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-[-10px_0_15px_rgba(0,0,0,0.05)] cursor-pointer z-50"
        >
          {sidebarOpen ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
        </button>

        <div className="w-full h-full flex flex-col p-8 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Keyboard className="text-indigo-600" /> TEACHER PANEL
            </h2>
            <p className="text-slate-400 text-sm font-medium">Build words for the tracing board</p>
          </div>

          <div className="space-y-8 flex-1">
            <section>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Alphabet</label>
                <div className="grid grid-cols-5 gap-2">
                    {"abcdefghijklmnopqrstuvwxyz".split('').map(l => (
                    <button key={l} onClick={() => setInputText(p => p + l)} className="aspect-square flex items-center justify-center bg-white text-slate-900 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-lg transition-all active:scale-90 border border-slate-200 shadow-sm">{l}</button>
                    ))}
                </div>
            </section>

            <section>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Numbers</label>
                <div className="grid grid-cols-5 gap-2">
                    {"1234567890".split('').map(n => (
                    <button key={n} onClick={() => setInputText(p => p + n)} className="aspect-square flex items-center justify-center bg-slate-50 text-slate-900 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-xl transition-all active:scale-90 border border-slate-200 shadow-sm">{n}</button>
                    ))}
                </div>
            </section>
          </div>

          <div className="mt-auto pt-8 border-t space-y-4">
            <div className="relative">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-100 px-6 py-4 rounded-2xl text-2xl font-black text-slate-800 focus:ring-4 ring-indigo-100 outline-none transition-all"
                    placeholder="TYPE HERE..."
                />
                <button onClick={() => setInputText('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                    <Eraser size={20} />
                </button>
            </div>

            <button 
                onClick={startWriting}
                disabled={!inputText}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
            >
                <Play fill="white" size={24} /> START WRITING
            </button>

            <div className="px-2 pt-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>Writing Speed</span>
                    <span>{speed}%</span>
                </div>
                <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none accent-indigo-500" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LetterTracer;