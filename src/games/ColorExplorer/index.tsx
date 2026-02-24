import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameProps } from '../../types';
import * as LucideIcons from 'lucide-react';

// Extract common icons for UI
const {
  Settings, X, Plus, Trash2, CheckCircle,
  ChevronLeft, ChevronRight, RotateCcw,
  Search, Edit2, Save, Palette,
  Droplets, Sun, Cloud, Flame, Leaf, Moon
} = LucideIcons;

// Dynamic icon keys helper
const ALL_ICON_KEYS = Object.keys(LucideIcons).filter(key => {
    return /^[A-Z]/.test(key) && typeof (LucideIcons as any)[key] !== 'function';
});

interface ColorData {
  id: string;
  name: string;
  hex: string; // Hex code (e.g. #FF0000)
  iconName: string;
}

const DEFAULT_COLORS: ColorData[] = [
  { id: '1', name: 'red', hex: '#EF4444', iconName: 'Flame' },
  { id: '2', name: 'blue', hex: '#3B82F6', iconName: 'Droplets' },
  { id: '3', name: 'green', hex: '#22C55E', iconName: 'Leaf' },
  { id: '4', name: 'yellow', hex: '#EAB308', iconName: 'Sun' },
  { id: '5', name: 'orange', hex: '#F97316', iconName: 'Citrus' }, // Assuming Citrus might exist or fallback
  { id: '6', name: 'purple', hex: '#A855F7', iconName: 'Grape' },
  { id: '7', name: 'pink', hex: '#EC4899', iconName: 'Heart' },
  { id: '8', name: 'black', hex: '#000000', iconName: 'Moon' },
  { id: '9', name: 'white', hex: '#FFFFFF', iconName: 'Cloud' },
  { id: '10', name: 'gray', hex: '#6B7280', iconName: 'Mountain' },
];

const STORAGE_KEY = 'grade_r_colors_data';

const loadColors = (): ColorData[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    return DEFAULT_COLORS;
};

const ColorExplorer: React.FC<GameProps> = ({ lastInput }) => {
  // --- STATE ---
  const [colors, setColors] = useState<ColorData[]>(() => loadColors());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [newIconName, setNewIconName] = useState<string>('Palette');
  const [newHex, setNewHex] = useState<string>('#3B82F6');
  const [iconSearch, setIconSearch] = useState('');

  const lastProcessedTime = useRef<number>(0);

  const currentColor = colors[currentIndex] || colors[0];
  const CurrentIcon = (LucideIcons as any)[currentColor?.iconName] || Palette;
  // Fallback for form icon preview
  const FormIcon = (LucideIcons as any)[newIconName] || Palette;

  // Filter icons for search
  const filteredIcons = useMemo(() => {
     if (!iconSearch) return ALL_ICON_KEYS.slice(0, 60);
     const lower = iconSearch.toLowerCase();
     return ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(lower)).slice(0, 60);
  }, [iconSearch]);

  // --- PERSISTENCE ---
  const saveColors = (updated: ColorData[]) => {
      setColors(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset to default colors?")) {
        saveColors(DEFAULT_COLORS);
        setCurrentIndex(0);
    }
  };

  // --- NAVIGATION ---
  const nextColor = () => setCurrentIndex(prev => (prev + 1) % colors.length);
  const prevColor = () => setCurrentIndex(prev => (prev - 1 + colors.length) % colors.length);

  // --- INPUT ---
  useEffect(() => {
    if (!lastInput) return;
    if (lastInput.timestamp <= lastProcessedTime.current) return;
    lastProcessedTime.current = lastInput.timestamp;

    const btn = lastInput.button;
    if (btn === 'D') { setIsTeacherMode(prev => !prev); return; }
    if (isTeacherMode) return;

    if (btn === 'RIGHT_DOWN' || btn === 'RIGHT' || btn === 'B') nextColor();
    if (btn === 'LEFT_DOWN' || btn === 'LEFT' || btn === 'C') prevColor();
    if (btn === 'UP_DOWN' || btn === 'UP') prevColor(); 
    if (btn === 'DOWN_DOWN' || btn === 'DOWN') nextColor();
  }, [lastInput, isTeacherMode, colors.length]);

  // --- TEACHER ACTIONS ---
  const handleSave = () => {
      if (!newNameInput) return;
      const validIcon = (LucideIcons as any)[newIconName] ? newIconName : 'Palette';
      
      const newColorData: ColorData = {
          id: editingId || Date.now().toString(),
          name: newNameInput.toLowerCase().trim(),
          iconName: validIcon,
          hex: newHex
      };

      if (editingId) {
          saveColors(colors.map(c => c.id === editingId ? newColorData : c));
          setEditingId(null);
      } else {
          const updated = [...colors, newColorData];
          saveColors(updated);
          setCurrentIndex(updated.length - 1);
      }

      // Reset
      setNewNameInput('');
      setNewIconName('Palette');
      setNewHex('#3B82F6');
      setIconSearch('');
  };

  const handleEditClick = (c: ColorData) => {
      setEditingId(c.id);
      setNewNameInput(c.name);
      setNewIconName(c.iconName);
      setNewHex(c.hex);
      setIsTeacherMode(true);
  };

  const deleteColor = (id: string) => {
      if (colors.length <= 1) return alert("Keep at least one color!");
      const updated = colors.filter(c => c.id !== id);
      saveColors(updated);
      if (currentIndex >= updated.length) setCurrentIndex(updated.length - 1);
  };

  // Helper to determine if text should be black or white based on background hex
  const getContrastColor = (hex: string) => {
      // Simple luminance check
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? 'black' : 'white';
  };
  
  const contrastTextColor = getContrastColor(currentColor.hex);

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden select-none transition-colors duration-700">
       
       {/* Ambient Background Glow */}
       <div 
          className="absolute inset-0 z-0 opacity-20 transition-colors duration-700"
          style={{ backgroundColor: currentColor.hex }}
       ></div>

       {/* HEADER */}
       <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
         <div className="flex flex-col md:flex-row md:items-center gap-4 pointer-events-auto">
             <h2 className="text-2xl font-bold text-slate-400">Color Explorer</h2>
             <button 
                onClick={() => setIsTeacherMode(prev => !prev)}
                className={`px-4 py-2 backdrop-blur-sm rounded-full transition-colors border font-bold text-xs flex items-center gap-2
                    ${isTeacherMode 
                        ? 'bg-indigo-600/90 text-white border-indigo-500 hover:bg-indigo-500' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}
                `}
            >
                <Plus size={14} /> {isTeacherMode ? 'Close Panel' : 'Add Color'}
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 p-8">
          <div className="flex items-center gap-8 md:gap-24 animate-in zoom-in duration-300 key={currentIndex}">
              {/* Previous Arrow Hint */}
              <div 
                  className="hidden md:flex p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={prevColor}
              >
                  <ChevronLeft size={40} className="text-white/30 hover:text-white" />
              </div>

              {/* CENTER CARD */}
              <div className="flex flex-col items-center gap-8 md:gap-12">
                  <div 
                    className={`
                        w-72 h-72 md:w-96 md:h-96 
                        rounded-full
                        border-8 border-white/20
                        shadow-[0_20px_60px_rgba(0,0,0,0.5)] 
                        flex items-center justify-center 
                        relative overflow-hidden
                        group transition-transform hover:scale-105 duration-500
                    `}
                    style={{ 
                        backgroundColor: currentColor.hex,
                        boxShadow: `0 20px 60px ${currentColor.hex}66`
                    }}
                  >
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none"></div>
                      
                      {/* Inner Icon in contrast color */}
                      <CurrentIcon 
                          strokeWidth={2}
                          size={180}
                          className="drop-shadow-lg transition-all duration-500 group-hover:scale-110"
                          style={{ color: contrastTextColor === 'white' ? '#FFFFFF' : '#000000', opacity: 0.8 }}
                      />
                  </div>

                  <div className="text-center">
                      <h1 
                        className="text-6xl md:text-9xl font-black tracking-wider drop-shadow-lg transition-colors duration-500"
                        style={{ color: currentColor.hex }}
                      >
                          {currentColor.name}
                      </h1>
                      <div className="mt-2 text-slate-500 font-mono text-sm opacity-50 uppercase tracking-[0.5em]">
                          {currentColor.hex}
                      </div>
                  </div>
              </div>

               {/* Next Arrow Hint */}
               <div 
                  className="hidden md:flex p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={nextColor}
              >
                  <ChevronRight size={40} className="text-white/30 hover:text-white" />
              </div>
          </div>
      </div>

      {/* INDICATORS */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center gap-3 z-10">
          {colors.map((c, idx) => (
             <div 
                key={idx} 
                className={`w-4 h-4 rounded-full transition-all duration-300 border border-white/20 ${idx === currentIndex ? 'scale-150 ring-2 ring-white' : 'opacity-50'}`}
                style={{ backgroundColor: c.hex }}
             />
          ))}
      </div>

      {/* TEACHER OVERLAY */}
      {isTeacherMode && (
        <div className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
            {/* Overlay Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings size={20} /> {editingId ? 'Edit Color' : 'Add Color'}
                </h3>
                <button onClick={() => setIsTeacherMode(false)} className="p-2 hover:bg-slate-800 text-slate-400 rounded-full">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                {/* EDITOR FORM */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color Name</label>
                    <input 
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-3 border border-slate-700 focus:border-indigo-500 outline-none font-bold"
                        placeholder="e.g. cyan"
                        value={newNameInput}
                        onChange={e => setNewNameInput(e.target.value)}
                    />
                    
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pick Color</label>
                    <div className="flex items-center gap-4 mb-4 bg-slate-800 p-2 rounded border border-slate-700">
                        <input 
                            type="color" 
                            value={newHex}
                            onChange={(e) => setNewHex(e.target.value)}
                            className="w-12 h-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                        />
                        <div className="font-mono text-white text-lg">{newHex.toUpperCase()}</div>
                    </div>

                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Icon</label>
                    <div className="relative mb-2">
                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                             <input 
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

                    {/* Preview Box */}
                    <div className="mt-4 p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: newHex }}>
                        <span style={{ color: getContrastColor(newHex) }} className="font-bold">Preview</span>
                        <FormIcon size={32} style={{ color: getContrastColor(newHex) }} />
                    </div>

                    <div className="flex gap-2 mt-4">
                        {editingId && (
                            <button 
                                onClick={() => { setEditingId(null); setNewNameInput(''); setNewIconName('Palette'); setNewHex('#3B82F6'); }}
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
                            {editingId ? 'Update Color' : 'Add Color'}
                        </button>
                    </div>
                </div>

                {/* LIST */}
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase">Color List</h4>
                    <button onClick={resetToDefaults} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>

                <div className="space-y-2 pb-8">
                    {colors.map((c, idx) => {
                        const ListIcon = (LucideIcons as any)[c.iconName] || Palette;
                        return (
                            <div 
                                key={c.id}
                                onClick={() => { setCurrentIndex(idx); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                                    ${currentIndex === idx ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center" style={{ backgroundColor: c.hex }}>
                                        <ListIcon size={16} style={{ color: getContrastColor(c.hex) }} />
                                    </div>
                                    <div className={`font-bold ${currentIndex === idx ? 'text-white' : 'text-slate-400'}`}>{c.name}</div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(c); }} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-yellow-400 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteColor(c.id); }} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded">
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

export default ColorExplorer;