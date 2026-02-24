import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Brain, Sticker, Rocket, Sword, Zap, Keyboard, Mic, Shapes, Palette, Pencil, Smile, Eye } from 'lucide-react';
import { GameDefinition } from '../types';
import { useInput } from '../context/InputContext';
import { useSession } from '../context/SessionContext';
import LearnToSpell from '../games/LearnToSpell';
import MathShooter from '../games/MathShooter';
import WordStorm from '../games/WordStorm';
import PhoneticSounder from '../games/PhoneticSounder';
import ShapeViewer from '../games/ShapeViewer';
import ColorExplorer from '../games/ColorExplorer';
import VisualRecall from '../games/VisualRecall';
import LetterTracer from '../games/LetterTracer';

export const GAMES: GameDefinition[] = [
  {
    id: 'visual-recall',
    name: 'Visual Recall',
    description: 'Teacher-created visual quizzes! Build and play offline assessments.',
    component: VisualRecall,
    color: 'bg-violet-600',
    icon: 'Eye'
  },
  {
    id: 'letter-tracer',
    name: 'Trace Master',
    description: 'Teacher types a word or number, and the game traces it on screen for kids to follow.',
    component: LetterTracer,
    color: 'bg-cyan-500',
    icon: 'Pencil'
  },
  {
    id: 'phonetic-sounder',
    name: 'Phoneme Game',
    description: 'Listen, Speak, and Match! Teacher tools included for custom words.',
    component: PhoneticSounder,
    color: 'bg-pink-600',
    icon: 'Mic'
  },
  {
    id: 'shape-viewer',
    name: 'Shape Identifier',
    description: 'Learn shapes and colors with large visuals. Teacher can add custom shapes.',
    component: ShapeViewer,
    color: 'bg-teal-500',
    icon: 'Shapes'
  },
  {
    id: 'color-explorer',
    name: 'Color Explorer',
    description: 'Explore the world of colors with customizable visuals. Perfect for visual learning.',
    component: ColorExplorer,
    color: 'bg-amber-500',
    icon: 'Palette'
  },
  {
    id: 'word-storm',
    name: 'Word Storm Arena',
    description: 'Fast-paced sight word arena. Catch the target word before it hits the ground!',
    component: WordStorm,
    color: 'bg-indigo-700',
    icon: 'Zap'
  },
  {
    id: 'math-shooter',
    name: 'Math Shooter',
    description: 'Blast the correct answers! Use keys 1, 2, 3, 4.',
    component: MathShooter,
    color: 'bg-rose-600',
    icon: 'Rocket'
  },
  {
    id: 'learn-to-spell',
    name: 'Learn To Spell',
    description: 'Complete the words! Use keys 1, 2, 3, 4.',
    component: LearnToSpell,
    color: 'bg-orange-500',
    icon: 'Brain'
  },
];

const Directory: React.FC = () => {
  const navigate = useNavigate();
  const { lastInput } = useInput();
  const { sessionId } = useSession();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lastNavTime = useRef(0);
  const mountTime = useRef(Date.now());

  // Handle Input with Debounce
  useEffect(() => {
    if (lastInput) {
        // Prevent stale inputs (e.g. pressing Enter to exit a game) from triggering 
        // immediate selection here by ensuring input happened AFTER mount + buffer
        if (lastInput.timestamp < mountTime.current + 500) return;

        const now = Date.now();
        if (now - lastNavTime.current < 150) return; 

        const btn = lastInput.button;
        
        // Navigation: Arrow Keys or B/C from generic mapping
        if (btn === 'RIGHT_DOWN' || btn === 'B') { 
            lastNavTime.current = now;
            setSelectedIndex(prev => (prev + 1) % GAMES.length);
        } else if (btn === 'LEFT_DOWN' || btn === 'C') { 
            lastNavTime.current = now;
            setSelectedIndex(prev => (prev - 1 + GAMES.length) % GAMES.length);
        } else if (btn === 'A') { // Enter or A
            lastNavTime.current = now;
            const game = GAMES[selectedIndex];
            navigate(`/host/${game.id}`);
        }
    }
  }, [lastInput, navigate, selectedIndex]);

  return (
    <div className="h-screen bg-slate-900 text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col p-6 shadow-2xl z-10 shrink-0">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 leading-tight">
          Grade R<br/>AI Studio
        </h1>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col items-center">
            <Keyboard size={48} className="text-slate-600 mb-2" />
            <div className="text-center text-sm text-slate-400">
                Keyboard Control Enabled
            </div>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-slate-600 text-center">
             ID: {sessionId}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto">
         <header className="mb-12 flex justify-between items-end">
            <div>
               <h2 className="text-4xl font-bold mb-2">Game Library</h2>
               <p className="text-slate-400">Select a game using Arrow Keys</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1">
                 PRESS <span className="bg-green-500 text-white px-1 rounded text-[10px]">ENTER</span> TO PLAY
               </span>
               <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold border border-slate-700 flex items-center gap-1">
                 USE <span className="bg-slate-700 text-white px-1 rounded text-[10px]">&larr;</span> <span className="bg-slate-700 text-white px-1 rounded text-[10px]">&rarr;</span> TO NAVIGATE
               </span>
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
            {GAMES.map((game, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div 
                  key={game.id}
                  onClick={() => { setSelectedIndex(index); navigate(`/host/${game.id}`); }}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer 
                    ${isSelected 
                      ? 'bg-slate-800 ring-4 ring-indigo-500 scale-105 shadow-[0_0_50px_rgba(99,102,241,0.3)] z-10' 
                      : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 grayscale hover:grayscale-0'
                    }`}
                >
                  <div className={`h-40 ${game.color} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                    {game.icon === 'Brain' && <Brain size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Gamepad2' && <Gamepad2 size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Sticker' && <Sticker size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Rocket' && <Rocket size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Sword' && <Sword size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Zap' && <Zap size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Mic' && <Mic size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Shapes' && <Shapes size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Palette' && <Palette size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Pencil' && <Pencil size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Smile' && <Smile size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                    {game.icon === 'Eye' && <Eye size={80} className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />}
                  </div>
                  <div className="p-6">
                    <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{game.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{game.description}</p>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-white text-indigo-600 text-xs font-black px-2 py-1 rounded shadow-lg animate-pulse">
                      SELECTED
                    </div>
                  )}
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default Directory;
