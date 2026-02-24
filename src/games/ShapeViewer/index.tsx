import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameProps } from '../../types';
import * as LucideIcons from 'lucide-react';

// Extract common icons for UI
const {
  Settings, X, Plus, Trash2, CheckCircle,
  ChevronLeft, ChevronRight, RotateCcw,
  Search, Edit2, Save, Shapes,
  Circle, Square, Triangle, Star, Heart
} = LucideIcons;

// Dynamic icon keys helper
const ALL_ICON_KEYS = Object.keys(LucideIcons).filter(key => {
    return /^[A-Z]/.test(key) && typeof (LucideIcons as any)[key] !== 'function';
});

interface ShapeData {
  id: string;
  name: string;
  iconName: string;
  color: string; // Tailwind text color class
}

// Color Palette for Teacher to choose from
const PRESET_COLORS = [
    { name: 'Red', value: 'text-red-500', bg: 'bg-red-500' },
    { name: 'Orange', value: 'text-orange-500', bg: 'bg-orange-500' },
    { name: 'Amber', value: 'text-amber-400', bg: 'bg-amber-400' },
    { name: 'Green', value: 'text-green-500', bg: 'bg-green-500' },
    { name: 'Emerald', value: 'text-emerald-400', bg: 'bg-emerald-400' },
    { name: 'Teal', value: 'text-teal-400', bg: 'bg-teal-400' },
    { name: 'Cyan', value: 'text-cyan-400', bg: 'bg-cyan-400' },
    { name: 'Blue', value: 'text-blue-500', bg: 'bg-blue-500' },
    { name: 'Indigo', value: 'text-indigo-500', bg: 'bg-indigo-500' },
    { name: 'Violet', value: 'text-violet-500', bg: 'bg-violet-500' },
    { name: 'Purple', value: 'text-purple-500', bg: 'bg-purple-500' },
    { name: 'Fuchsia', value: 'text-fuchsia-500', bg: 'bg-fuchsia-500' },
    { name: 'Pink', value: 'text-pink-500', bg: 'bg-pink-500' },
    { name: 'Rose', value: 'text-rose-500', bg: 'bg-rose-500' },
    { name: 'White', value: 'text-white', bg: 'bg-white' },
];

const DEFAULT_SHAPES: ShapeData[] = [
  { id: '1', name: 'circle', iconName: 'Circle', color: 'text-red-500' },
  { id: '2', name: 'square', iconName: 'Square', color: 'text-blue-500' },
  { id: '3', name: 'triangle', iconName: 'Triangle', color: 'text-yellow-400' },
  { id: '4', name: 'star', iconName: 'Star', color: 'text-purple-500' },
  { id: '5', name: 'heart', iconName: 'Heart', color: 'text-pink-500' },
  { id: '6', name: 'diamond', iconName: 'Gem', color: 'text-cyan-400' },
  { id: '7', name: 'hexagon', iconName: 'Hexagon', color: 'text-green-500' },
  { id: '8', name: 'octagon', iconName: 'Octagon', color: 'text-orange-500' },
  { id: '9', name: 'cloud', iconName: 'Cloud', color: 'text-white' },
  { id: '10', name: 'moon', iconName: 'Moon', color: 'text-yellow-200' },
];

const STORAGE_KEY = 'grade_r_shapes_data';

const loadShapes = (): ShapeData[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.warn(e); }
    return DEFAULT_SHAPES;
};

const ShapeViewer: React.FC<GameProps> = ({ lastInput }) => {
  // --- STATE ---
  const [shapes, setShapes] = useState<ShapeData[]>(() => loadShapes());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [newIconName, setNewIconName] = useState<string>('Circle');
  const [newColor, setNewColor] = useState<string>('text-white');
  const [iconSearch, setIconSearch] = useState('');

  const lastProcessedTime = useRef<number>(0);

  const currentShape = shapes[currentIndex] || shapes[0];
  const CurrentIcon = (LucideIcons as any)[currentShape?.iconName] || Circle;

  // Filter icons for search
  const filteredIcons = useMemo(() => {
     if (!iconSearch) return ALL_ICON_KEYS.slice(0, 60);
     const lower = iconSearch.toLowerCase();
     return ALL_ICON_KEYS.filter(k => k.toLowerCase().includes(lower)).slice(0, 60);
  }, [iconSearch]);

  // --- PERSISTENCE ---
  const saveShapes = (updated: ShapeData[]) => {
      setShapes(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset to default shapes?")) {
        saveShapes(DEFAULT_SHAPES);
        setCurrentIndex(0);
    }
  };

  // --- NAVIGATION ---
  const nextShape = () => setCurrentIndex(prev => (prev + 1) % shapes.length);
  const prevShape = () => setCurrentIndex(prev => (prev - 1 + shapes.length) % shapes.length);

  // --- INPUT ---
  useEffect(() => {
    if (!lastInput) return;
    if (lastInput.timestamp <= lastProcessedTime.current) return;
    lastProcessedTime.current = lastInput.timestamp;

    const btn = lastInput.button;
    if (btn === 'D') { setIsTeacherMode(prev => !prev); return; }
    if (isTeacherMode) return;

    if (btn === 'RIGHT_DOWN' || btn === 'RIGHT' || btn === 'B') nextShape();
    if (btn === 'LEFT_DOWN' || btn === 'LEFT' || btn === 'C') prevShape();
    if (btn === 'UP_DOWN' || btn === 'UP') prevShape(); // Fallback nav
    if (btn === 'DOWN_DOWN' || btn === 'DOWN') nextShape();
  }, [lastInput, isTeacherMode, shapes.length]);

  // --- TEACHER ACTIONS ---
  const handleSave = () => {
      if (!newNameInput) return;
      const validIcon = (LucideIcons as any)[newIconName] ? newIconName : 'Circle';
      
      const newShape: ShapeData = {
          id: editingId || Date.now().toString(),
          name: newNameInput.toLowerCase().trim(),
          iconName: validIcon,
          color: newColor
      };

      if (editingId) {
          saveShapes(shapes.map(s => s.id === editingId ? newShape : s));
          setEditingId(null);
      } else {
          const updated = [...shapes, newShape];
          saveShapes(updated);
          setCurrentIndex(updated.length - 1);
      }

      // Reset
      setNewNameInput('');
      setNewIconName('Circle');
      setNewColor('text-white');
      setIconSearch('');
  };

  const handleEditClick = (shape: ShapeData) => {
      setEditingId(shape.id);
      setNewNameInput(shape.name);
      setNewIconName(shape.iconName);
      setNewColor(shape.color);
      setIsTeacherMode(true);
  };

  const deleteShape = (id: string) => {
      if (shapes.length <= 1) return alert("Keep at least one shape!");
      const updated = shapes.filter(s => s.id !== id);
      saveShapes(updated);
      if (currentIndex >= updated.length) setCurrentIndex(updated.length - 1);
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden select-none">
       {/* HEADER */}
       <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
         <div className="flex flex-col md:flex-row md:items-center gap-4 pointer-events-auto">
             <h2 className="text-2xl font-bold text-slate-500">Shape Identifier</h2>
             <button 
                onClick={() => setIsTeacherMode(prev => !prev)}
                className={`px-4 py-2 backdrop-blur-sm rounded-full transition-colors border font-bold text-xs flex items-center gap-2
                    ${isTeacherMode 
                        ? 'bg-indigo-600/90 text-white border-indigo-500 hover:bg-indigo-500' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}
                `}
            >
                <Plus size={14} /> {isTeacherMode ? 'Close Panel' : 'Add Shape'}
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

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
         <CurrentIcon className="absolute -top-20 -left-20 w-[500px] h-[500px] text-white animate-pulse" />
         <CurrentIcon className="absolute -bottom-20 -right-20 w-[500px] h-[500px] text-white animate-pulse" style={{ animationDelay: '1s'}} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 p-8">
          <div className="flex items-center gap-8 md:gap-24 animate-in zoom-in duration-300 key={currentIndex}">
              {/* Previous Arrow Hint */}
              <div 
                  className="hidden md:flex p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={prevShape}
              >
                  <ChevronLeft size={40} className="text-white/30 hover:text-white" />
              </div>

              {/* CENTER CARD */}
              <div className="flex flex-col items-center gap-12">
                  <div className={`
                    w-72 h-72 md:w-96 md:h-96 
                    bg-slate-800 rounded-[3rem] 
                    border-8 border-slate-700 
                    shadow-[0_20px_60px_rgba(0,0,0,0.5)] 
                    flex items-center justify-center 
                    relative overflow-hidden
                    group transition-transform hover:scale-105 duration-500
                  `}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                      <CurrentIcon 
                          strokeWidth={1.5}
                          className={`w-48 h-48 md:w-64 md:h-64 ${currentShape.color} drop-shadow-2xl transition-all duration-500 group-hover:scale-110`} 
                      />
                  </div>

                  <div className="text-center">
                      <h1 className={`text-6xl md:text-8xl font-black tracking-wider ${currentShape.color} drop-shadow-lg`}>
                          {currentShape.name}
                      </h1>
                  </div>
              </div>

               {/* Next Arrow Hint */}
               <div 
                  className="hidden md:flex p-4 rounded-full bg-slate-800/50 hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={nextShape}
              >
                  <ChevronRight size={40} className="text-white/30 hover:text-white" />
              </div>
          </div>
      </div>

      {/* INDICATORS */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center gap-3 z-10">
          {shapes.map((_, idx) => (
             <div 
                key={idx} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-slate-600'}`}
             />
          ))}
      </div>


      {/* TEACHER OVERLAY */}
      {isTeacherMode && (
        <div className="absolute inset-y-0 right-0 w-full md:w-[500px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right">
            {/* Overlay Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings size={20} /> {editingId ? 'Edit Shape' : 'Add Shape'}
                </h3>
                <button onClick={() => setIsTeacherMode(false)} className="p-2 hover:bg-slate-800 text-slate-400 rounded-full">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                {/* EDITOR FORM */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shape Name</label>
                    <input 
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded mb-3 border border-slate-700 focus:border-indigo-500 outline-none font-bold"
                        placeholder="e.g. hexagon"
                        value={newNameInput}
                        onChange={e => setNewNameInput(e.target.value)}
                    />
                    
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Color</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {PRESET_COLORS.map(c => (
                            <button
                                key={c.name}
                                onClick={() => setNewColor(c.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${newColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                title={c.name}
                            />
                        ))}
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

                    <div className="flex gap-2 mt-4">
                        {editingId && (
                            <button 
                                onClick={() => { setEditingId(null); setNewNameInput(''); setNewIconName('Circle'); setNewColor('text-white'); }}
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
                            {editingId ? 'Update Shape' : 'Add Shape'}
                        </button>
                    </div>
                </div>

                {/* LIST */}
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase">Shape List</h4>
                    <button onClick={resetToDefaults} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400">
                        <RotateCcw size={12} /> Reset
                    </button>
                </div>

                <div className="space-y-2 pb-8">
                    {shapes.map((s, idx) => {
                        const ListIcon = (LucideIcons as any)[s.iconName] || Circle;
                        return (
                            <div 
                                key={s.id}
                                onClick={() => { setCurrentIndex(idx); }}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                                    ${currentIndex === idx ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-slate-950`}>
                                        <ListIcon size={20} className={s.color} />
                                    </div>
                                    <div className={`font-bold ${currentIndex === idx ? 'text-white' : 'text-slate-400'}`}>{s.name}</div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(s); }} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-yellow-400 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteShape(s.id); }} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded">
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

export default ShapeViewer;