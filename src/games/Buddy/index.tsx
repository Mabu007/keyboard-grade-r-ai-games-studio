import React, { useState, useEffect } from 'react';
import { GameProps } from '../../types';
import { Eye, Ear, Wind, Utensils, Hand, Lightbulb, Volume2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type SenseType = 'SIGHT' | 'HEARING' | 'SMELL' | 'TASTE' | 'TOUCH' | null;

interface BuddyState {
  expression: 'neutral' | 'happy' | 'excited' | 'sour' | 'spicy' | 'stinky' | 'listening' | 'looking';
  dialogue: string;
}

// --- Assets / Data ---
const SOUNDS = [
  { id: 'lion', text: 'RRRR-OAR!', answer: '🦁 LION' },
  { id: 'bell', text: 'DING-DONG!', answer: '🔔 BELL' },
  { id: 'rain', text: 'PITTER-PATTER...', answer: '🌧️ RAIN' }
];

const TEXTURES = [
  { id: 'spiky', label: 'SPIKY!', color: 'bg-purple-500', reaction: 'Ouch! That is prickly!' },
  { id: 'soft', label: 'SOFT~', color: 'bg-pink-300', reaction: 'Ooooh! So fluffy and nice!' },
  { id: 'sticky', label: 'STICKY...', color: 'bg-green-400', reaction: 'Ewww! It is stuck to me!' }
];

const Buddy: React.FC<GameProps> = () => {
  const [activeSense, setActiveSense] = useState<SenseType>(null);
  const [buddyState, setBuddyState] = useState<BuddyState>({
    expression: 'neutral',
    dialogue: "Hi! I'm Buddy! Click a button to explore my senses!"
  });
  
  // Sight State
  const [lightsOn, setLightsOn] = useState(false);

  // Hearing State
  const [revealedSound, setRevealedSound] = useState<string | null>(null);

  // Reset when switching senses
  useEffect(() => {
    setLightsOn(false);
    setRevealedSound(null);
  }, [activeSense]);

  // --- Handlers ---

  const handleSenseClick = (sense: SenseType) => {
    setActiveSense(sense);
    switch (sense) {
      case 'SIGHT':
        setBuddyState({ expression: 'looking', dialogue: "My eyes catch the light so I can see your beautiful faces! Let's try to find the hidden friend!" });
        break;
      case 'HEARING':
        setBuddyState({ expression: 'listening', dialogue: "Shhh... Listen carefully! What do you hear?" });
        break;
      case 'SMELL':
        setBuddyState({ expression: 'neutral', dialogue: "Sniff sniff! Some things smell nice, and some smell... YUCKY!" });
        break;
      case 'TASTE':
        setBuddyState({ expression: 'happy', dialogue: "Yum! I love tasting things. Is it sweet? Is it sour?" });
        break;
      case 'TOUCH':
        setBuddyState({ expression: 'excited', dialogue: "My hands help me feel things! Is it soft? Is it scratchy?" });
        break;
      default:
        setBuddyState({ expression: 'neutral', dialogue: "Hi! I'm Buddy! Click a button to explore my senses!" });
    }
  };

  // --- Render Helpers ---

  const renderFace = () => {
    // Simple CSS-based face animation
    const eyes = {
      neutral: <div className="flex gap-8"><div className="w-8 h-8 bg-black rounded-full animate-bounce" /><div className="w-8 h-8 bg-black rounded-full animate-bounce delay-75" /></div>,
      happy: <div className="flex gap-8"><div className="w-8 h-4 border-t-4 border-black rounded-t-full" /><div className="w-8 h-4 border-t-4 border-black rounded-t-full" /></div>, // ^ ^
      excited: <div className="flex gap-8"><div className="w-10 h-10 bg-black rounded-full animate-ping" /><div className="w-10 h-10 bg-black rounded-full animate-ping delay-75" /></div>,
      sour: <div className="flex gap-4"><div className="w-8 h-1 bg-black rotate-45" /><div className="w-8 h-1 bg-black -rotate-45" /></div>, // > <
      spicy: <div className="flex gap-8"><div className="w-10 h-10 bg-red-600 rounded-full animate-pulse" /><div className="w-10 h-10 bg-red-600 rounded-full animate-pulse" /></div>,
      stinky: <div className="flex gap-8"><div className="w-8 h-2 bg-green-700 rotate-12" /><div className="w-8 h-2 bg-green-700 -rotate-12" /></div>,
      listening: <div className="flex gap-8"><div className="w-12 h-12 border-4 border-black rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-black rounded-full" /></div><div className="w-12 h-12 border-4 border-black rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-black rounded-full" /></div></div>, // Wide eyes
      looking: <div className="flex gap-8"><div className="w-16 h-16 bg-white border-8 border-black rounded-full flex items-center justify-center relative"><div className="absolute w-4 h-4 bg-black rounded-full animate-[ping_3s_infinite]" /></div><div className="w-16 h-16 bg-white border-8 border-black rounded-full flex items-center justify-center relative"><div className="absolute w-4 h-4 bg-black rounded-full animate-[ping_3s_infinite]" /></div></div>,
    };

    const mouth = {
      neutral: <div className="w-16 h-8 border-b-4 border-black rounded-b-full mt-4" />,
      happy: <div className="w-20 h-10 bg-black rounded-b-full mt-4 overflow-hidden"><div className="w-full h-4 bg-red-500 mt-6" /></div>, // Open smile with tongue
      excited: <div className="w-16 h-16 bg-black rounded-full mt-4 animate-pulse" />, // :O
      sour: <div className="w-4 h-4 bg-black rounded-full mt-8" />, // Small pucker
      spicy: <div className="w-24 h-12 bg-black rounded-full mt-4 flex justify-center items-center"><div className="text-2xl">🔥</div></div>,
      stinky: <div className="w-16 h-2 bg-black rotate-[-10deg] mt-8" />, // Wavy line
      listening: <div className="w-8 h-2 bg-black rounded-full mt-8" />,
      looking: <div className="w-12 h-6 border-b-4 border-black rounded-b-full mt-4" />,
    };

    return (
      <motion.div 
        layout
        className={`w-64 h-64 rounded-full border-8 border-black flex flex-col items-center justify-center shadow-2xl bg-yellow-300 relative z-10
          ${buddyState.expression === 'spicy' ? 'bg-red-400' : ''}
          ${buddyState.expression === 'stinky' ? 'bg-green-300' : ''}
          ${buddyState.expression === 'sour' ? 'scale-90' : ''}
        `}
        animate={{ 
            scale: buddyState.expression === 'excited' ? 1.1 : 1,
            rotate: buddyState.expression === 'happy' ? [0, -5, 5, 0] : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {eyes[buddyState.expression]}
        {mouth[buddyState.expression]}
        
        {/* Hands/Accessories */}
        {buddyState.expression === 'stinky' && (
             <div className="absolute -right-12 top-1/2 text-6xl">🤢</div>
        )}
      </motion.div>
    );
  };

  const renderActiveSense = () => {
    if (!activeSense) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border-4 border-indigo-100 mt-8 flex flex-col items-center"
      >
        {/* SIGHT */}
        {activeSense === 'SIGHT' && (
            <div className={`w-full h-64 rounded-2xl flex items-center justify-center transition-colors duration-1000 relative overflow-hidden ${lightsOn ? 'bg-sky-200' : 'bg-slate-900'}`}>
                {!lightsOn ? (
                    <div className="flex flex-col items-center">
                        <div className="flex gap-4 mb-4">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_20px_yellow]" />
                            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_20px_yellow] delay-100" />
                        </div>
                        <button 
                            onClick={() => { setLightsOn(true); setBuddyState({ expression: 'excited', dialogue: "WOW! Look at that colorful butterfly! [Buddy bounces]" }); }}
                            className="bg-slate-700 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-600 border-2 border-slate-500 flex items-center gap-2"
                        >
                            <Lightbulb size={20} /> TURN ON LIGHTS
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1, rotate: 360 }} 
                            transition={{ type: "spring" }}
                            className="text-9xl"
                        >
                            🦋
                        </motion.div>
                        <button 
                            onClick={() => { setLightsOn(false); setBuddyState({ expression: 'looking', dialogue: "It's dark again... where did it go?" }); }}
                            className="absolute bottom-4 right-4 bg-white/50 hover:bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-bold"
                        >
                            TURN OFF
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* HEARING */}
        {activeSense === 'HEARING' && (
            <div className="grid grid-cols-3 gap-8 w-full">
                {SOUNDS.map((sound) => (
                    <button 
                        key={sound.id}
                        onClick={() => { 
                            setRevealedSound(sound.id); 
                            setBuddyState({ expression: 'listening', dialogue: `Did you hear that? It went ${sound.text}!` });
                        }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 border-4 ${revealedSound === sound.id ? 'bg-sky-100 border-sky-400' : 'bg-slate-100 border-slate-200'}`}
                    >
                        {revealedSound === sound.id ? (
                            <>
                                <span className="text-6xl animate-bounce">{sound.answer.split(' ')[0]}</span>
                                <span className="font-black text-slate-700">{sound.answer.split(' ')[1]}</span>
                            </>
                        ) : (
                            <>
                                <Volume2 size={48} className="text-slate-400" />
                                <span className="font-bold text-slate-400">???</span>
                            </>
                        )}
                    </button>
                ))}
            </div>
        )}

        {/* SMELL */}
        {activeSense === 'SMELL' && (
            <div className="flex justify-center gap-12 w-full">
                <button 
                    onClick={() => setBuddyState({ expression: 'happy', dialogue: "Mmmm! Smells like a garden! [Buddy takes a deep breath]" })}
                    className="w-48 h-48 bg-pink-100 border-4 border-pink-300 rounded-3xl flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform"
                >
                    <span className="text-7xl">🌸</span>
                    <span className="font-bold text-pink-600">FLOWER</span>
                </button>
                <button 
                    onClick={() => setBuddyState({ expression: 'stinky', dialogue: "EW! YUCKY! Smells like old cheese! [Buddy plugs nose]" })}
                    className="w-48 h-48 bg-green-100 border-4 border-green-300 rounded-3xl flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wavy-dots.png')]" />
                    <span className="text-7xl">🧦</span>
                    <span className="font-bold text-green-700">DIRTY SOCK</span>
                    <Wind className="absolute top-4 right-4 text-green-500 animate-pulse" />
                </button>
            </div>
        )}

        {/* TASTE */}
        {activeSense === 'TASTE' && (
            <div className="flex justify-center gap-8 w-full">
                <button 
                    onClick={() => setBuddyState({ expression: 'sour', dialogue: "WOAH! So SOUR! My face is shrinking! [Buddy puckers]" })}
                    className="flex-1 h-40 bg-yellow-100 border-4 border-yellow-400 rounded-2xl flex flex-col items-center justify-center hover:bg-yellow-200 transition-colors"
                >
                    <span className="text-6xl">🍋</span>
                    <span className="font-bold text-yellow-700 mt-2">LEMON</span>
                </button>
                <button 
                    onClick={() => setBuddyState({ expression: 'happy', dialogue: "YUMMY! Sweet and crunchy! [Buddy licks lips]" })}
                    className="flex-1 h-40 bg-amber-100 border-4 border-amber-400 rounded-2xl flex flex-col items-center justify-center hover:bg-amber-200 transition-colors"
                >
                    <span className="text-6xl">🍪</span>
                    <span className="font-bold text-amber-800 mt-2">COOKIE</span>
                </button>
                <button 
                    onClick={() => setBuddyState({ expression: 'spicy', dialogue: "HOT HOT HOT! Need water! [Buddy turns red]" })}
                    className="flex-1 h-40 bg-red-100 border-4 border-red-400 rounded-2xl flex flex-col items-center justify-center hover:bg-red-200 transition-colors"
                >
                    <span className="text-6xl">🌶️</span>
                    <span className="font-bold text-red-700 mt-2">CHILI</span>
                </button>
            </div>
        )}

        {/* TOUCH */}
        {activeSense === 'TOUCH' && (
            <div className="grid grid-cols-3 gap-6 w-full">
                {TEXTURES.map((tex) => (
                    <button 
                        key={tex.id}
                        onClick={() => setBuddyState({ expression: 'excited', dialogue: tex.reaction })}
                        className={`${tex.color} h-48 rounded-3xl flex flex-col items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg border-4 border-white/50`}
                    >
                        <Hand size={48} className="text-white/80" />
                        <span className="text-2xl font-black text-white uppercase tracking-wider">{tex.label}</span>
                    </button>
                ))}
            </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans p-8 flex flex-col items-center overflow-hidden">
      
      {/* Header / Dialogue Bubble */}
      <div className="w-full max-w-4xl bg-white rounded-[3rem] p-8 shadow-xl border-4 border-slate-100 mb-8 relative">
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-b-4 border-r-4 border-slate-100 rotate-45" />
        <p className="text-3xl text-center font-bold text-slate-700 leading-relaxed">
            "{buddyState.dialogue}"
        </p>
      </div>

      {/* Main Character Area */}
      <div className="relative mb-12">
        {renderFace()}
      </div>

      {/* Controls (The 5 Senses) */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <SenseButton 
            active={activeSense === 'SIGHT'} 
            color="bg-yellow-400" 
            icon={<Eye size={32} />} 
            label="SIGHT" 
            onClick={() => handleSenseClick('SIGHT')} 
        />
        <SenseButton 
            active={activeSense === 'HEARING'} 
            color="bg-sky-400" 
            icon={<Ear size={32} />} 
            label="HEARING" 
            onClick={() => handleSenseClick('HEARING')} 
        />
        <SenseButton 
            active={activeSense === 'SMELL'} 
            color="bg-green-400" 
            icon={<Wind size={32} />} 
            label="SMELL" 
            onClick={() => handleSenseClick('SMELL')} 
        />
        <SenseButton 
            active={activeSense === 'TASTE'} 
            color="bg-pink-400" 
            icon={<Utensils size={32} />} 
            label="TASTE" 
            onClick={() => handleSenseClick('TASTE')} 
        />
        <SenseButton 
            active={activeSense === 'TOUCH'} 
            color="bg-orange-400" 
            icon={<Hand size={32} />} 
            label="TOUCH" 
            onClick={() => handleSenseClick('TOUCH')} 
        />
      </div>

      {/* Active Sense Interaction Area */}
      <AnimatePresence mode="wait">
        {renderActiveSense()}
      </AnimatePresence>

    </div>
  );
};

// Sub-component for buttons
const SenseButton = ({ active, color, icon, label, onClick }: { active: boolean, color: string, icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`
            ${color} text-white px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 shadow-[0_8px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[8px] transition-all
            ${active ? 'ring-4 ring-offset-4 ring-slate-900 scale-110' : 'hover:-translate-y-1'}
        `}
    >
        {icon}
        {label}
    </button>
);

export default Buddy;
