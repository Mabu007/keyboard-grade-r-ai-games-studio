import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameProps } from '../../types';
import * as LucideIcons from 'lucide-react';

// Common icons used in UI (explicitly extracted for ease of use in UI code)
const { 
  Settings, X, Plus, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw,
  Search, Edit2, Save, Type, Star
} = LucideIcons;

// --- DYNAMIC ICON UTILS ---

// Get all valid icon keys from the library (filtering out non-component exports)
const ALL_ICON_KEYS = Object.keys(LucideIcons).filter(key => {
    // Simple heuristic: starts with uppercase, excludes internal/utility exports
    return /^[A-Z]/.test(key) && typeof (LucideIcons as any)[key] !== 'function'; 
    // Note: In some builds Lucide exports are objects, in others functions. 
    // We mainly just want the UpperCase keys. 
    // A safer check for standard lucide-react builds:
    return key !== 'createLucideIcon' && key !== 'Icon' && /^[A-Z]/.test(key);
});

interface WordData {
  id: string;
  word: string; // The full word (e.g. "BANANA")
  phonetics: string[]; // The breakdown (e.g. ["BA", "NA", "NA"])
  iconName: string; // Key for LucideIcons
}

const DEFAULT_WORDS: WordData[] = [
  { id: '1', word: 'banana', phonetics: ['ba', 'na', 'na'], iconName: 'Banana' },
  { id: '2', word: 'apple', phonetics: ['ap', 'ple'], iconName: 'Apple' },
  { id: '3', word: 'cat', phonetics: ['c', 'a', 't'], iconName: 'Cat' },
  { id: '4', word: 'dog', phonetics: ['d', 'o', 'g'], iconName: 'Dog' },
  { id: '5', word: 'fish', phonetics: ['f', 'i', 'sh'], iconName: 'Fish' },
  { id: '6', word: 'sun', phonetics: ['s', 'u', 'n'], iconName: 'Sun' },
  { id: '7', word: 'car', phonetics: ['c', 'ar'], iconName: 'Car' },
];

const STORAGE_KEY = 'grade_r_phonetic_words';

const loadWordsFromStorage = (): WordData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load words from storage:', e);
  }
  return DEFAULT_WORDS;
};

const PhoneticSounder: React.FC<GameProps> = ({ lastInput }) => {
  // --- STATE ---
  const [words, setWords] = useState<WordData[]>(() => loadWordsFromStorage());
  const [wordIndex, setWordIndex] = useState(0);
  const [phonemeIndex, setPhonemeIndex] = useState(-1); // -1 means "Whole Word" view
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWordInput, setNewWordInput] = useState('');
  const [newPhoneticInput, setNewPhoneticInput] = useState('');
  const [newIconName, setNewIconName] = useState<string>('Type');
  
  // Icon Search State
  const [iconSearch, setIconSearch] = useState('');
  
  const lastProcessedTime = useRef<number>(0);

  const currentWord = words[wordIndex] || words[0]; 
  
  // Dynamic Icon Component Resolution
  // We use 'as any' because iterating the whole library purely with TS types is complex
  const CurrentIconComponent = (LucideIcons as any)[currentWord?.iconName] || Star;

  // Filter icons for the picker (memoized for performance)
  const filteredIcons = useMemo(() => {
     if (!iconSearch) return ALL_ICON_KEYS.slice(0, 60); // Show first 60 by default
     const lower = iconSearch.toLowerCase();
     return ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(lower)).slice(0, 60);
  }, [iconSearch]);

  // --- PERSISTENCE ---
  const saveWordsToStorage = (updatedWords: WordData[]) => {
      setWords(updatedWords);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset to default words? This will remove all custom words.")) {
        saveWordsToStorage(DEFAULT_WORDS);
        setWordIndex(0);
        setPhonemeIndex(-1);
    }
  };

  // --- NAVIGATION ---
  const nextWord = () => {
    setWordIndex(prev => (prev + 1) % words.length);
    setPhonemeIndex(-1); 
  };

  const prevWord = () => {
    setWordIndex(prev => (prev - 1 + words.length) % words.length);
    setPhonemeIndex(-1);
  };

  const nextPhoneme = () => {
    setPhonemeIndex(prev => {
        if (prev < currentWord.phonetics.length - 1) return prev + 1;
        return prev;
    });
  };

  const prevPhoneme = () => {
    setPhonemeIndex(prev => {
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

    if (btn === 'UP_DOWN' || btn === 'UP') {
        prevWord();
    } else if (btn === 'DOWN_DOWN' || btn === 'DOWN') {
        nextWord();
    } else if (btn === 'LEFT_DOWN' || btn === 'C' || btn === 'LEFT') {
        prevPhoneme();
    } else if (btn === 'RIGHT_DOWN' || btn === 'B' || btn === 'RIGHT') {
        nextPhoneme();
    }
  }, [lastInput, isTeacherMode, wordIndex, phonemeIndex, currentWord]); 

  // --- TEACHER ACTIONS ---
  const handleSaveWord = () => {
    if (!newWordInput || !newPhoneticInput) return;
    
    const parts = newPhoneticInput.toLowerCase().split('-').map(s => s.trim()).filter(s => s.length > 0);
    
    // Validate icon exists, fallback to Type if not
    const validIconName = (LucideIcons as any)[newIconName] ? newIconName : 'Type';

    if (editingId) {
        // UPDATE EXISTING
        const updatedList = words.map(w => {
            if (w.id === editingId) {
                return {
                    ...w,
                    word: newWordInput.toLowerCase().trim(),
                    phonetics: parts,
                    iconName: validIconName
                };
            }
            return w;
        });
        saveWordsToStorage(updatedList);
        setEditingId(null);
    } else {
        // CREATE NEW
        const newWord: WordData = {
            id: Date.now().toString(),
            word: newWordInput.toLowerCase().trim(),
            phonetics: parts,
            iconName: validIconName
        };
        const updatedList = [...words, newWord];
        saveWordsToStorage(updatedList);
        setWordIndex(updatedList.length - 1); 
        setPhonemeIndex(-1);
    }
    
    // Reset Form
    setNewWordInput('');
    setNewPhoneticInput('');
    setNewIconName('Type');
    setIconSearch('');
  };

  const handleEditClick = (word: WordData) => {
      setEditingId(word.id);
      setNewWordInput(word.word);
      setNewPhoneticInput(word.phonetics.join('-'));
      setNewIconName(word.iconName);
      // Ensure the panel is open if they somehow triggered this from outside (future proofing)
      setIsTeacherMode(true);
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewWordInput('');
      setNewPhoneticInput('');
      setNewIconName('Type');
  };

  const deleteWord = (id: string) => {
    if (words.length <= 1) {
        alert("Cannot delete the last word.");
        return;
    }
    const idxToRemove = words.findIndex(w => w.id === id);
    const newWords = words.filter(w => w.id !== id);
    
    saveWordsToStorage(newWords);

    if (editingId === id) handleCancelEdit();

    if (wordIndex >= idxToRemove) {
        setWordIndex(Math.max(0, wordIndex - 1));
        setPhonemeIndex(-1);
    } else if (wordIndex >= newWords.length) {
        setWordIndex(newWords.length - 1);
    }
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
         <div className="flex flex-col md:flex-row md:items-center gap-4 pointer-events-auto">
             <h2 className="text-2xl font-bold text-slate-600">Phoneme Game</h2>
             <button 
                onClick={() => setIsTeacherMode(prev => !prev)}
                className={`px-4 py-2 backdrop-blur-sm rounded-full transition-colors border font-bold text-xs flex items-center gap-2
                    ${isTeacherMode 
                        ? 'bg-indigo-600/90 text-white border-indigo-500 hover:bg-indigo-500' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}
                `}
            >
                <Plus size={14} /> {isTeacherMode ? 'Close Panel' : 'Add Words'}
            </button>
         </div>

         <div className="flex gap-2 pointer-events-auto">
            <button 
                onClick={() => setIsTeacherMode(!isTeacherMode)}
                className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                title="Teacher Settings"
            >
                {isTeacherMode ? <X /> : <Settings />}
            </button>
         </div>
      </div>

      {/* NAVIGATION HINTS */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-center gap-2 opacity-20">
             <div className="bg-white p-2 rounded"><ChevronLeft size={32} className="text-black" /></div>
             <span className="font-bold text-white">PHONEME</span>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-2 opacity-20">
             <div className="bg-white p-2 rounded"><ChevronRight size={32} className="text-black" /></div>
             <span className="font-bold text-white">PHONEME</span>
          </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
         
         <div className="mb-12 transition-all duration-500 transform hover:scale-105">
            <div className="w-64 h-64 bg-slate-800 rounded-3xl border-8 border-slate-700 flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-slate-700"></div>
                <CurrentIconComponent size={140} className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative z-10" strokeWidth={1.5} />
            </div>
         </div>

         {/* PHONETIC DISPLAY */}
         <div className="flex flex-wrap justify-center items-baseline gap-1 md:gap-2 px-10 h-40">
            {currentWord && currentWord.phonetics.map((part, i) => {
                const isFocused = phonemeIndex === i;
                const isNeutral = phonemeIndex === -1;
                
                return (
                    <div key={i} className="flex items-center">
                        <div 
                        className={`
                            transition-all duration-300 transform flex items-center justify-center
                            ${isFocused 
                                ? 'scale-150 z-20 mx-6 -translate-y-4' 
                                : isNeutral 
                                    ? 'scale-100 opacity-90 mx-1' 
                                    : 'scale-75 opacity-20 mx-0 blur-[2px]'
                            }
                        `}
                        >
                            <span className={`
                                text-7xl md:text-9xl font-black tracking-tighter
                                ${isFocused ? 'text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]' : 'text-white drop-shadow-lg'}
                            `}>
                                {part}
                            </span>
                        </div>
                        
                        {i < currentWord.phonetics.length - 1 && (
                            <span className={`
                                text-4xl font-bold transition-all duration-300 mx-2
                                ${isFocused || phonemeIndex === i + 1 ? 'text-slate-600 opacity-0 w-0' : 'text-slate-600 opacity-30'}
                            `}>
                                -
                            </span>
                        )}
                    </div>
                );
            })}
         </div>

         {/* STATUS */}
         <div className="mt-12 h-8">
            {phonemeIndex === -1 ? (
                <div className="text-slate-500 font-mono tracking-[0.5em] text-sm uppercase">Full Word View</div>
            ) : (
                <div className="text-yellow-500 font-mono tracking-widest text-lg font-bold uppercase animate-pulse">
                    Phoneme {phonemeIndex + 1} / {currentWord?.phonetics.length}
                </div>
            )}
         </div>
      </div>

      {/* TEACHER OVERLAY */}
      {isTeacherMode && (
        <div className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings size={20} /> {editingId ? 'Edit Word' : 'Add New Word'}
                </h3>
                <button 
                    onClick={() => setIsTeacherMode(false)}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                >
                    Close <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                {/* FORM */}
                <div className={`p-4 rounded-xl border mb-8 transition-colors ${editingId ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-slate-900 border-slate-800'}`}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Word</label>
                    <input 
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-3 border border-slate-700 focus:border-indigo-500 outline-none font-bold"
                        placeholder="e.g. elephant"
                        value={newWordInput}
                        onChange={e => setNewWordInput(e.target.value)}
                    />

                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phonetics (Hyphen Separated)</label>
                    <input 
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-4 border border-slate-700 focus:border-indigo-500 outline-none font-bold"
                        placeholder="e.g. el-e-phant"
                        value={newPhoneticInput}
                        onChange={e => setNewPhoneticInput(e.target.value)}
                    />
                    
                    {/* Icon Picker */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Icon</label>
                        <div className="relative mb-2">
                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                             <input 
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-8 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                placeholder="Search icons (e.g. Bird, House)..."
                                value={iconSearch}
                                onChange={(e) => setIconSearch(e.target.value)}
                             />
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-950 rounded border border-slate-800 max-h-40 overflow-y-auto min-h-[100px]">
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
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                             <span>Selected: <span className="text-indigo-400 font-bold">{newIconName}</span></span>
                             <span>{filteredIcons.length} icons found</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {editingId && (
                            <button 
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded font-bold text-xs"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={handleSaveWord}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {editingId ? <Save size={16} /> : <Plus size={16} />} 
                            {editingId ? 'Update Word' : 'Add Word'}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase">Word List ({words.length})</h4>
                    <button onClick={resetToDefaults} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>
                
                <div className="space-y-2 pb-8">
                    {words.map((w, idx) => {
                        const ListIcon = (LucideIcons as any)[w.iconName] || Star;
                        return (
                            <div 
                                key={w.id} 
                                onClick={() => { setWordIndex(idx); setPhonemeIndex(-1); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                                    ${wordIndex === idx ? 'bg-indigo-900/30 border-indigo-500/50 translate-x-1' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                    ${editingId === w.id ? 'ring-2 ring-yellow-500/50' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <div className={`p-2 rounded-lg ${wordIndex === idx ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                                        <ListIcon size={20} />
                                    </div>
                                    <div>
                                        <div className={`font-bold truncate ${wordIndex === idx ? 'text-white' : 'text-slate-400'}`}>{w.word}</div>
                                        <div className="text-xs text-slate-500 tracking-widest">{w.phonetics.join('-')}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {wordIndex === idx && <CheckCircle size={16} className="text-green-500 mr-2" />}
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(w); }}
                                        className="p-2 hover:bg-yellow-900/50 text-slate-600 hover:text-yellow-400 rounded transition-colors"
                                        title="Edit Word"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteWord(w.id); }}
                                        className="p-2 hover:bg-red-900/50 text-slate-600 hover:text-red-400 rounded transition-colors"
                                        title="Delete Word"
                                    >
                                        <Trash2 size={16} />
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

export default PhoneticSounder;