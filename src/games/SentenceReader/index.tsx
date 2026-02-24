import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameProps } from '../../types';
import * as LucideIcons from 'lucide-react';

// Common icons used in UI
const { 
  Settings, X, Plus, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, RotateCcw,
  Search, Edit2, Save, BookOpen, Star
} = LucideIcons;

// Dynamic Icon Logic
const ALL_ICON_KEYS = Object.keys(LucideIcons).filter(key => {
    return /^[A-Z]/.test(key) && typeof (LucideIcons as any)[key] !== 'function'; 
});

interface SentenceData {
  id: string;
  text: string; // e.g. "I LOVE MY DOG"
  iconName: string;
}

const DEFAULT_SENTENCES: SentenceData[] = [
  { id: '1', text: "I LOVE MY FRIEND", iconName: "HeartHandshake" },
  { id: '2', text: "THE SUN IS HOT", iconName: "Sun" },
  { id: '3', text: "LOOK AT THE CAT", iconName: "Cat" },
  { id: '4', text: "I CAN RUN FAST", iconName: "Zap" },
  { id: '5', text: "MY BIKE IS BLUE", iconName: "Bike" },
  { id: '6', text: "IT IS RAINING", iconName: "CloudRain" },
];

const STORAGE_KEY = 'grade_r_sentences';

const loadSentences = (): SentenceData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.warn(e); }
  return DEFAULT_SENTENCES;
};

const SentenceReader: React.FC<GameProps> = ({ lastInput }) => {
  // --- STATE ---
  const [sentences, setSentences] = useState<SentenceData[]>(() => loadSentences());
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordFocusIndex, setWordFocusIndex] = useState(-1); // -1 = Full sentence view
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTextInput, setNewTextInput] = useState('');
  const [newIconName, setNewIconName] = useState<string>('BookOpen');
  const [iconSearch, setIconSearch] = useState('');
  
  const lastProcessedTime = useRef<number>(0);

  const currentSentence = sentences[sentenceIndex] || sentences[0]; 
  const currentWords = currentSentence.text.split(' ').filter(w => w.length > 0);
  
  const CurrentIconComponent = (LucideIcons as any)[currentSentence?.iconName] || BookOpen;

  // Filter icons
  const filteredIcons = useMemo(() => {
     if (!iconSearch) return ALL_ICON_KEYS.slice(0, 60);
     const lower = iconSearch.toLowerCase();
     return ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(lower)).slice(0, 60);
  }, [iconSearch]);

  // --- PERSISTENCE ---
  const saveSentences = (updated: SentenceData[]) => {
      setSentences(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset to default sentences?")) {
        saveSentences(DEFAULT_SENTENCES);
        setSentenceIndex(0);
        setWordFocusIndex(-1);
    }
  };

  // --- NAVIGATION ---
  const nextSentence = () => {
    setSentenceIndex(prev => (prev + 1) % sentences.length);
    setWordFocusIndex(-1); 
  };

  const prevSentence = () => {
    setSentenceIndex(prev => (prev - 1 + sentences.length) % sentences.length);
    setWordFocusIndex(-1);
  };

  const nextWord = () => {
    setWordFocusIndex(prev => {
        if (prev < currentWords.length - 1) return prev + 1;
        return prev;
    });
  };

  const prevWord = () => {
    setWordFocusIndex(prev => {
        if (prev > -1) return prev - 1;
        return -1;
    });
  };

  // --- INPUT HANDLING ---
  useEffect(() => {
    if (!lastInput) return;
    if (lastInput.timestamp <= lastProcessedTime.current) return;
    lastProcessedTime.current = lastInput.timestamp;

    const btn = lastInput.button;

    if (btn === 'D') { 
        setIsTeacherMode(prev => !prev);
        return;
    }

    if (isTeacherMode) return; 

    // Up/Down changes the Sentence
    if (btn === 'UP_DOWN' || btn === 'UP') prevSentence(); 
    else if (btn === 'DOWN_DOWN' || btn === 'DOWN') nextSentence();
    
    // Left/Right steps through words
    else if (btn === 'LEFT_DOWN' || btn === 'C' || btn === 'LEFT') prevWord();
    else if (btn === 'RIGHT_DOWN' || btn === 'B' || btn === 'RIGHT') nextWord();

  }, [lastInput, isTeacherMode, sentenceIndex, wordFocusIndex, currentSentence]); 

  // --- TEACHER ACTIONS ---
  const handleSave = () => {
    if (!newTextInput) return;
    const validIcon = (LucideIcons as any)[newIconName] ? newIconName : 'BookOpen';

    const newData: SentenceData = {
        id: editingId || Date.now().toString(),
        text: newTextInput.toUpperCase().replace(/\s+/g, ' ').trim(),
        iconName: validIcon
    };

    if (editingId) {
        saveSentences(sentences.map(s => s.id === editingId ? newData : s));
        setEditingId(null);
    } else {
        const updated = [...sentences, newData];
        saveSentences(updated);
        setSentenceIndex(updated.length - 1); 
        setWordFocusIndex(-1);
    }
    
    // Reset Form
    setNewTextInput('');
    setNewIconName('BookOpen');
    setIconSearch('');
  };

  const handleEditClick = (s: SentenceData) => {
      setEditingId(s.id);
      setNewTextInput(s.text);
      setNewIconName(s.iconName);
      setIsTeacherMode(true);
  };

  const deleteSentence = (id: string) => {
    if (sentences.length <= 1) return alert("Keep at least one sentence.");
    const updated = sentences.filter(s => s.id !== id);
    saveSentences(updated);
    if (sentenceIndex >= updated.length) setSentenceIndex(updated.length - 1);
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
         <div className="flex flex-col md:flex-row md:items-center gap-4 pointer-events-auto">
             <h2 className="text-2xl font-bold text-slate-500">Sentence Reader</h2>
             <button 
                onClick={() => setIsTeacherMode(prev => !prev)}
                className={`px-4 py-2 backdrop-blur-sm rounded-full transition-colors border font-bold text-xs flex items-center gap-2
                    ${isTeacherMode 
                        ? 'bg-indigo-600/90 text-white border-indigo-500 hover:bg-indigo-500' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}
                `}
            >
                <Plus size={14} /> {isTeacherMode ? 'Close Panel' : 'Add Sentence'}
            </button>
         </div>

         <div className="flex gap-2 pointer-events-auto">
            <button 
                onClick={() => setIsTeacherMode(!isTeacherMode)}
                className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
                {isTeacherMode ? <X /> : <Settings />}
            </button>
         </div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
          <CurrentIconComponent className="absolute -right-20 -bottom-20 w-[600px] h-[600px] text-white" />
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
         
         <div className="mb-12 animate-in fade-in zoom-in duration-500 key={currentSentence.id}">
            <div className="w-48 h-48 bg-indigo-500/10 rounded-full border-4 border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                <CurrentIconComponent size={100} className="text-indigo-400 drop-shadow-lg" strokeWidth={1.5} />
            </div>
         </div>

         {/* SENTENCE DISPLAY */}
         <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 max-w-6xl">
            {currentWords.map((word, i) => {
                const isFocused = wordFocusIndex === i;
                const isNeutral = wordFocusIndex === -1;
                
                return (
                    <div 
                        key={i}
                        className={`
                            transition-all duration-500 transform rounded-2xl px-4 py-2
                            ${isFocused 
                                ? 'bg-yellow-400 text-slate-900 scale-125 z-20 shadow-[0_0_50px_rgba(250,204,21,0.5)] -translate-y-2' 
                                : isNeutral 
                                    ? 'bg-transparent text-white scale-100' 
                                    : 'bg-transparent text-slate-600 scale-95 blur-[1px]'
                            }
                        `}
                    >
                        <span className="text-5xl md:text-7xl font-black tracking-wide">
                            {word}
                        </span>
                    </div>
                );
            })}
         </div>

         {/* PROGRESS BAR / STATUS */}
         <div className="mt-16 flex flex-col items-center gap-2 h-16">
            {wordFocusIndex === -1 ? (
                <div className="text-slate-500 font-mono tracking-[0.3em] text-sm uppercase">Full Sentence View</div>
            ) : (
                <div className="text-yellow-500 font-mono tracking-widest text-lg font-bold uppercase animate-pulse">
                    Word {wordFocusIndex + 1} of {currentWords.length}
                </div>
            )}
            
            {/* Dots */}
            <div className="flex gap-2 mt-2">
                 {sentences.map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx === sentenceIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} 
                     />
                 ))}
            </div>
         </div>
      </div>

      {/* TEACHER OVERLAY */}
      {isTeacherMode && (
        <div className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings size={20} /> {editingId ? 'Edit Sentence' : 'Add Sentence'}
                </h3>
                <button onClick={() => setIsTeacherMode(false)} className="p-2 hover:bg-slate-800 text-slate-400 rounded-full">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sentence Text</label>
                    <textarea 
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-3 border border-slate-700 focus:border-indigo-500 outline-none uppercase font-bold resize-none h-24"
                        placeholder="e.g. THE CAT IS ON THE MAT"
                        value={newTextInput}
                        onChange={e => setNewTextInput(e.target.value)}
                    />
                    
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Icon</label>
                    <div className="relative mb-2">
                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                             <input 
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-8 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                placeholder="Search icons..."
                                value={iconSearch}
                                onChange={(e) => setIconSearch(e.target.value)}
                             />
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-950 rounded border border-slate-800 max-h-40 overflow-y-auto">
                        {filteredIcons.map((name) => {
                            const IconComp = (LucideIcons as any)[name];
                            if (!IconComp) return null;
                            return (
                                <button
                                    key={name}
                                    onClick={() => setNewIconName(name)}
                                    className={`p-2 rounded flex items-center justify-center transition-all ${newIconName === name ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    title={name}
                                >
                                    <IconComp size={20} />
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2 mt-4">
                        {editingId && (
                            <button 
                                onClick={() => { setEditingId(null); setNewTextInput(''); setNewIconName('BookOpen'); }}
                                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded font-bold text-xs"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={handleSave}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {editingId ? <Save size={16} /> : <Plus size={16} />} 
                            {editingId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase">Library ({sentences.length})</h4>
                    <button onClick={resetToDefaults} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
                
                <div className="space-y-2 pb-8">
                    {sentences.map((s, idx) => {
                        const ListIcon = (LucideIcons as any)[s.iconName] || BookOpen;
                        return (
                            <div 
                                key={s.id} 
                                onClick={() => { setSentenceIndex(idx); setWordFocusIndex(-1); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                                    ${sentenceIndex === idx ? 'bg-indigo-900/30 border-indigo-500/50 translate-x-1' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <div className={`p-2 rounded-lg ${sentenceIndex === idx ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                                        <ListIcon size={18} />
                                    </div>
                                    <div className={`font-bold text-sm truncate pr-2 ${sentenceIndex === idx ? 'text-white' : 'text-slate-400'}`}>{s.text}</div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(s); }}
                                        className="p-2 hover:bg-slate-800 text-slate-500 hover:text-yellow-400 rounded"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteSentence(s.id); }}
                                        className="p-2 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SentenceReader;