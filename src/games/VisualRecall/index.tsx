import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { Quiz, Question, InteractionType, Option, DropZone, Asset } from './types';
import { initDB, getQuizzes, saveQuiz, deleteQuiz, saveAsset, getAsset, seedInitialData } from './db';
import { Plus, Trash2, Play, Edit, Image as ImageIcon, Check, X, ArrowLeft, Save, Mic, Volume2, Upload, Move, Smile, Frown, ArrowRight, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

// --- Helper Components ---

const AssetPreview = ({ id, className }: { id: string, className?: string }) => {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getAsset(id).then(asset => {
            if (asset) setSrc(asset.data);
        });
    }, [id]);

    if (!id) return <div className={`bg-slate-100 flex items-center justify-center ${className}`}><ImageIcon className="text-slate-300" /></div>;
    if (!src) return <div className={`animate-pulse bg-slate-200 ${className}`} />;
    return <img src={src} className={className} alt="" draggable={false} />;
};

const AudioPlayer = ({ id, autoPlay = false }: { id?: string, autoPlay?: boolean }) => {
    const [src, setSrc] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!id) return;
        getAsset(id).then(asset => {
            if (asset) setSrc(asset.data);
        });
    }, [id]);

    useEffect(() => {
        if (src && autoPlay && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    }, [src, autoPlay]);

    if (!id || !src) return null;

    return (
        <div className="flex items-center gap-2">
            <button 
                onClick={() => audioRef.current?.play()}
                className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
            >
                <Volume2 size={20} />
            </button>
            <audio ref={audioRef} src={src} />
        </div>
    );
};

const CelebrationOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={{ 
                        y: -800, 
                        x: (Math.random() - 0.5) * 800,
                        opacity: [0, 1, 0], 
                        scale: [0.5, 2, 0.5],
                        rotate: Math.random() * 720
                    }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: Math.random() * 0.5 }}
                    className="absolute text-6xl"
                >
                    {['🎉', '⭐', '🎈', '✨', '🏆', '🦄', '🌈'][Math.floor(Math.random() * 7)]}
                </motion.div>
            ))}
        </div>
    );
};

const ErrorOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
             {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 200, opacity: [0, 1, 0], rotate: [0, -20, 20, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", delay: Math.random() * 0.5 }}
                    className="absolute text-6xl"
                    style={{ left: `${10 + Math.random() * 80}%` }}
                >
                    {['😢', '❌', '🤔', '🙈'][Math.floor(Math.random() * 4)]}
                </motion.div>
             ))}
        </div>
    );
};

// --- Builder Components ---

const Builder = ({ quiz, onSave, onCancel }: { quiz: Quiz | null, onSave: (q: Quiz) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState(quiz?.title || 'New Assessment');
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      type: 'TAP_SELECT',
      promptText: 'New Question',
      options: [
        { id: crypto.randomUUID(), isCorrect: false },
        { id: crypto.randomUUID(), isCorrect: true }
      ]
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleSave = () => {
    if (!title.trim()) return alert('Please enter a title');
    if (questions.length === 0) return alert('Add at least one question');
    
    onSave({
      id: quiz?.id || crypto.randomUUID(),
      title,
      questions,
      createdAt: Date.now()
    });
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], ...updates };
    setQuestions(newQs);
  };

  const activeQ = questions[activeQuestionIndex];

  // Helper to add a matching pair (Option + DropZone)
  const addMatchingPair = () => {
      if (!activeQ) return;
      const zoneId = crypto.randomUUID();
      const newZone: DropZone = {
          id: zoneId,
          x: 0, y: 0, width: 0, height: 0, // Not used in column layout
          label: 'Target'
      };
      
      const newOption: Option = {
          id: crypto.randomUUID(),
          isCorrect: true,
          matchZoneId: zoneId
      };

      updateQuestion(activeQuestionIndex, { 
          dropZones: [...(activeQ.dropZones || []), newZone],
          options: [...activeQ.options, newOption]
      });
  };

  const removeMatchingPair = (optionId: string, zoneId: string) => {
      if (!activeQ) return;
      updateQuestion(activeQuestionIndex, {
          options: activeQ.options.filter(o => o.id !== optionId),
          dropZones: (activeQ.dropZones || []).filter(z => z.id !== zoneId)
      });
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header - Added pr-48 to avoid overlap with Exit Game button */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-10 pr-48">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <input 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-xl font-bold text-slate-800 bg-transparent border-none focus:ring-0 placeholder:text-slate-300"
            placeholder="Enter Quiz Title..."
          />
        </div>
        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
          <Save size={18} /> SAVE QUIZ
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Question List */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-2 shrink-0">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveQuestionIndex(idx)}
              className={`p-3 rounded-xl text-left text-sm font-medium transition-all flex items-center gap-3 border ${
                activeQuestionIndex === idx 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                  : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                  <div className="truncate">{q.promptText || 'Untitled Question'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">{q.type.replace('_', ' ')}</div>
              </div>
            </button>
          ))}
          
          <button 
            onClick={handleAddQuestion}
            className="mt-2 p-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
          >
            <Plus size={16} /> ADD QUESTION
          </button>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeQ ? (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              
              {/* Question Config */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Question Setup</h3>
                    <button 
                        onClick={() => {
                            const newQs = questions.filter((_, i) => i !== activeQuestionIndex);
                            setQuestions(newQs);
                            if (activeQuestionIndex >= newQs.length) setActiveQuestionIndex(Math.max(0, newQs.length - 1));
                        }}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                        <Trash2 size={14} /> DELETE
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                        <select 
                            value={activeQ.type}
                            onChange={e => updateQuestion(activeQuestionIndex, { type: e.target.value as InteractionType })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-black"
                        >
                            <option value="TAP_SELECT">Tap Select (Multiple Choice)</option>
                            <option value="DRAG_MATCH">Drag Match (Columns)</option> 
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prompt Text</label>
                        <input 
                            value={activeQ.promptText || ''}
                            onChange={e => updateQuestion(activeQuestionIndex, { promptText: e.target.value })}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-black"
                            placeholder="e.g. Find the Lion"
                        />
                    </div>
                    
                    {/* Audio Prompt Upload */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Audio Prompt (Optional)</label>
                        <div className="flex items-center gap-4">
                            {activeQ.promptAudioId && <AudioPlayer id={activeQ.promptAudioId} />}
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                <Upload size={14} /> {activeQ.promptAudioId ? 'CHANGE AUDIO' : 'UPLOAD AUDIO'}
                                <input 
                                    type="file" 
                                    accept="audio/*" 
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const asset = await new Promise<any>((resolve) => {
                                                const reader = new FileReader();
                                                reader.onload = () => resolve({ id: crypto.randomUUID(), data: reader.result, type: file.type });
                                                reader.readAsDataURL(file);
                                            });
                                            await saveAsset(asset);
                                            updateQuestion(activeQuestionIndex, { promptAudioId: asset.id });
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
              </div>

              {/* --- DRAG MATCH (PAIRS) EDITOR --- */}
              {activeQ.type === 'DRAG_MATCH' && (
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                          <h3 className="font-bold text-slate-800">Matching Pairs</h3>
                          <button 
                              onClick={addMatchingPair}
                              className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
                          >
                              <Plus size={14} /> ADD PAIR
                          </button>
                      </div>

                      <div className="space-y-4">
                          {activeQ.options.map((opt) => {
                              const zone = activeQ.dropZones?.find(z => z.id === opt.matchZoneId);
                              if (!zone) return null;

                              return (
                                  <div key={opt.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                      {/* Source (Draggable) */}
                                      <div className="flex-1">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Draggable Item</div>
                                          <div className="aspect-square w-24 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer border border-slate-200 hover:border-indigo-400 transition-colors">
                                              {opt.assetId ? (
                                                  <AssetPreview id={opt.assetId} className="w-full h-full object-contain" />
                                              ) : (
                                                  <ImageIcon className="text-slate-300" />
                                              )}
                                              <input 
                                                  type="file" 
                                                  accept="image/*"
                                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                                  onChange={async (e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) {
                                                          const asset = await new Promise<any>((resolve) => {
                                                              const reader = new FileReader();
                                                              reader.onload = () => resolve({ id: crypto.randomUUID(), data: reader.result, type: file.type });
                                                              reader.readAsDataURL(file);
                                                          });
                                                          await saveAsset(asset);
                                                          const newOpts = activeQ.options.map(o => o.id === opt.id ? { ...o, assetId: asset.id } : o);
                                                          updateQuestion(activeQuestionIndex, { options: newOpts });
                                                      }
                                                  }}
                                              />
                                          </div>
                                      </div>

                                      <div className="text-slate-300">
                                          <ArrowRight size={24} />
                                      </div>

                                      {/* Target (Drop Zone) */}
                                      <div className="flex-1">
                                          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Target Match</div>
                                          <div className="aspect-square w-24 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer border border-slate-200 hover:border-indigo-400 transition-colors">
                                              {zone.assetId ? (
                                                  <AssetPreview id={zone.assetId} className="w-full h-full object-contain" />
                                              ) : (
                                                  <ImageIcon className="text-slate-300" />
                                              )}
                                              <input 
                                                  type="file" 
                                                  accept="image/*"
                                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                                  onChange={async (e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) {
                                                          const asset = await new Promise<any>((resolve) => {
                                                              const reader = new FileReader();
                                                              reader.onload = () => resolve({ id: crypto.randomUUID(), data: reader.result, type: file.type });
                                                              reader.readAsDataURL(file);
                                                          });
                                                          await saveAsset(asset);
                                                          const newZones = (activeQ.dropZones || []).map(z => z.id === zone.id ? { ...z, assetId: asset.id } : z);
                                                          updateQuestion(activeQuestionIndex, { dropZones: newZones });
                                                      }
                                                  }}
                                              />
                                          </div>
                                      </div>

                                      <button 
                                          onClick={() => removeMatchingPair(opt.id, zone.id)}
                                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                          <Trash2 size={20} />
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* --- TAP SELECT EDITOR --- */}
              {activeQ.type === 'TAP_SELECT' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="font-bold text-slate-800">Answer Options</h3>
                        <button 
                            onClick={() => {
                                const newOpt = { id: crypto.randomUUID(), isCorrect: false };
                                updateQuestion(activeQuestionIndex, { options: [...activeQ.options, newOpt] });
                            }}
                            className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
                        >
                            <Plus size={14} /> ADD OPTION
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {activeQ.options.map((opt, optIdx) => (
                            <div key={opt.id} className={`relative group bg-white rounded-xl border-2 p-4 transition-all ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                                
                                {/* Image Placeholder / Upload */}
                                <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 transition-colors cursor-pointer">
                                    {opt.assetId ? (
                                        <AssetPreview id={opt.assetId} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImageIcon className="mx-auto text-slate-300 mb-2" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Click to Upload</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const asset = await new Promise<any>((resolve) => {
                                                    const reader = new FileReader();
                                                    reader.onload = () => resolve({ id: crypto.randomUUID(), data: reader.result, type: file.type });
                                                    reader.readAsDataURL(file);
                                                });
                                                await saveAsset(asset);
                                                const newOpts = [...activeQ.options];
                                                newOpts[optIdx] = { ...newOpts[optIdx], assetId: asset.id };
                                                updateQuestion(activeQuestionIndex, { options: newOpts });
                                            }
                                        }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${opt.isCorrect ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                                            {opt.isCorrect && <Check size={12} className="text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={opt.isCorrect} 
                                            onChange={() => {
                                                const newOpts = [...activeQ.options];
                                                newOpts[optIdx] = { ...newOpts[optIdx], isCorrect: !opt.isCorrect };
                                                updateQuestion(activeQuestionIndex, { options: newOpts });
                                            }}
                                            className="hidden"
                                        />
                                        <span className={`text-xs font-bold ${opt.isCorrect ? 'text-green-600' : 'text-slate-400'}`}>
                                            {opt.isCorrect ? 'CORRECT' : 'WRONG'}
                                        </span>
                                    </label>

                                    <button 
                                        onClick={() => {
                                            const newOpts = activeQ.options.filter(o => o.id !== opt.id);
                                            updateQuestion(activeQuestionIndex, { options: newOpts });
                                        }}
                                        className="w-full text-center text-slate-300 hover:text-red-500 transition-colors pt-2 border-t border-slate-100"
                                    >
                                        <Trash2 size={16} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>Select a question to edit or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Player Components ---

const DraggableOption = ({ option, onDrop, isMatched }: { option: Option, onDrop: (opt: Option, point: { x: number, y: number }) => void, isMatched: boolean }) => {
    if (isMatched) return null;

    return (
        <motion.div
            drag
            dragSnapToOrigin
            dragElastic={0.1}
            dragMomentum={false}
            whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
            whileHover={{ scale: 1.05, cursor: 'grab' }}
            onDragEnd={(e, info) => {
                onDrop(option, info.point);
            }}
            className="w-40 h-40 md:w-48 md:h-48 bg-white rounded-2xl shadow-lg border-4 border-indigo-100 p-2 flex items-center justify-center touch-none cursor-grab active:cursor-grabbing z-10 relative"
        >
            {option.assetId ? (
                <AssetPreview id={option.assetId} className="w-full h-full object-contain pointer-events-none" />
            ) : (
                <span className="text-xs font-bold text-slate-400">ITEM</span>
            )}
        </motion.div>
    );
};

const Player = ({ quiz, onExit }: { quiz: Quiz, onExit: () => void }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const [dragMatches, setDragMatches] = useState<Record<string, string>>({}); // optionId -> zoneId
  const [showNext, setShowNext] = useState(false);

  const currentQ = quiz.questions[currentQIndex];

  // Reset state on question change
  useEffect(() => {
      setIsCorrect(null);
      setDragMatches({});
      setShake(false);
      setShowNext(false);
  }, [currentQIndex]);

  // Play audio prompt if available
  useEffect(() => {
      if (currentQ.promptAudioId) {
          const timer = setTimeout(() => {
              // Audio auto-play logic handled in AudioPlayer component
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [currentQ]);

  const handleTapOption = (option: Option) => {
    if (isCorrect === true) return; 

    if (option.isCorrect) {
      setIsCorrect(true);
      playSound('success');
      setShowNext(true); // Wait for teacher
    } else {
      setShake(true);
      playSound('error');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDragDrop = (option: Option, point: { x: number, y: number }) => {
      // Use bounding rect for more robust detection than elementsFromPoint
      const zones = Array.from(document.querySelectorAll('[data-zone-id]'));
      const hitZone = zones.find(zone => {
          const rect = zone.getBoundingClientRect();
          return (
              point.x >= rect.left &&
              point.x <= rect.right &&
              point.y >= rect.top &&
              point.y <= rect.bottom
          );
      });
      
      if (hitZone) {
          const zoneId = hitZone.getAttribute('data-zone-id');
          if (zoneId === option.matchZoneId) {
              // Correct Match!
              setDragMatches(prev => ({ ...prev, [option.id]: zoneId! }));
              playSound('pop');
              
              // Check if all items are matched
              const neededMatches = currentQ.options.filter(o => o.matchZoneId).length;
              const currentMatches = Object.keys(dragMatches).length + 1; 
              
              if (currentMatches >= neededMatches) {
                  setIsCorrect(true);
                  playSound('success');
                  setShowNext(true); // Wait for teacher
              }
          } else {
              // Wrong zone
              playSound('error');
              setShake(true);
              setTimeout(() => setShake(false), 500);
          }
      }
  };

  const nextQuestion = () => {
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // End of quiz
      onExit();
    }
  };

  // Enhanced Sound Synth
  const playSound = (type: 'success' | 'error' | 'pop') => {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      if (type === 'success') {
          // Major Arpeggio (C5, E5, G5, C6)
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now + i * 0.1);
              gain.gain.setValueAtTime(0.1, now + i * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + i * 0.1);
              osc.stop(now + i * 0.1 + 0.5);
          });
      } else if (type === 'error') {
          // Descending slide
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(50, now + 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
      } else if (type === 'pop') {
          // High blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
      }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-900 text-white select-none overflow-hidden">
      {/* Visual Feedback Overlays */}
      {isCorrect && <CelebrationOverlay />}
      {shake && <ErrorOverlay />}

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 w-full shrink-0">
        <motion.div 
            className="h-full bg-green-500" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQIndex) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto w-full p-4">
        <div className="min-h-full flex flex-col items-center justify-center relative pb-32">
            
            {/* Prompt */}
            <div className="mb-8 text-center z-10 shrink-0">
                <h2 className="text-3xl md:text-4xl font-black drop-shadow-lg flex items-center justify-center gap-3">
                    {currentQ.promptText}
                    {currentQ.promptAudioId && <AudioPlayer id={currentQ.promptAudioId} autoPlay={true} />}
                </h2>
            </div>

            {/* --- TAP SELECT LAYOUT --- */}
            {currentQ.type === 'TAP_SELECT' && (
                <div className={`grid gap-6 w-full max-w-5xl mx-auto ${currentQ.options.length <= 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-3 md:grid-cols-4'}`}>
                    {currentQ.options.map((opt) => (
                        <motion.button
                            key={opt.id}
                            onClick={() => handleTapOption(opt)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={shake && !opt.isCorrect ? { x: [-10, 10, -10, 10, 0] } : {}}
                            className={`
                                aspect-square bg-white rounded-3xl p-4 shadow-2xl flex items-center justify-center relative overflow-hidden group
                                ${isCorrect && opt.isCorrect ? 'ring-8 ring-green-500 scale-110 z-10' : ''}
                                ${isCorrect && !opt.isCorrect ? 'opacity-50 grayscale' : ''}
                            `}
                        >
                            {opt.assetId ? (
                                <AssetPreview id={opt.assetId} className="w-full h-full object-contain pointer-events-none" />
                            ) : (
                                <span className="text-slate-300 font-bold text-xl">NO IMAGE</span>
                            )}

                            {/* Feedback Overlay */}
                            {isCorrect && opt.isCorrect && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
                                >
                                    <Check size={80} className="text-green-600 drop-shadow-lg" strokeWidth={4} />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* --- DRAG MATCH (COLUMNS) LAYOUT --- */}
            {currentQ.type === 'DRAG_MATCH' && (
                <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center">
                    
                    {/* Left Column: Draggables */}
                    <div className="flex flex-col gap-8 items-center justify-center w-full md:w-1/3">
                        {currentQ.options.filter(o => o.matchZoneId).map(opt => (
                            <div key={opt.id} className="relative w-40 h-40 md:w-48 md:h-48">
                                {/* Placeholder slot to keep layout stable */}
                                <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-2xl" />
                                
                                {/* Draggable Item */}
                                <DraggableOption 
                                    option={opt} 
                                    onDrop={handleDragDrop} 
                                    isMatched={!!dragMatches[opt.id]}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Center: Arrow Visuals (Optional) */}
                    <div className="hidden md:flex flex-col gap-8 items-center justify-center w-1/6 opacity-20">
                        {currentQ.options.filter(o => o.matchZoneId).map((_, i) => (
                            <div key={i} className="h-48 flex items-center">
                                <ArrowRight className="" size={48} />
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Drop Zones */}
                    <div className="flex flex-col gap-8 items-center justify-center w-full md:w-1/3">
                        {currentQ.dropZones?.map(zone => {
                            const matchedOptionId = Object.keys(dragMatches).find(key => dragMatches[key] === zone.id);
                            const matchedOption = matchedOptionId ? currentQ.options.find(o => o.id === matchedOptionId) : null;

                            return (
                                <div 
                                    key={zone.id}
                                    data-zone-id={zone.id}
                                    className={`w-40 h-40 md:w-48 md:h-48 rounded-2xl border-4 transition-all flex items-center justify-center relative overflow-hidden
                                        ${matchedOption ? 'border-green-500 bg-green-500/20 scale-110 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-slate-600 bg-slate-800'}
                                    `}
                                >
                                    {/* Target Image */}
                                    {zone.assetId && (
                                        <div className={`w-full h-full p-2 transition-opacity ${matchedOption ? 'opacity-0' : 'opacity-100'}`}>
                                            <AssetPreview id={zone.assetId} className="w-full h-full object-contain opacity-80" />
                                        </div>
                                    )}
                                    
                                    {/* Label */}
                                    {zone.label && !matchedOption && (
                                        <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold uppercase text-slate-400 bg-slate-900/50 py-0.5">
                                            {zone.label}
                                        </div>
                                    )}

                                    {/* Matched Item Overlay */}
                                    {matchedOption && matchedOption.assetId && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute inset-0 p-2 bg-white"
                                        >
                                            <AssetPreview id={matchedOption.assetId} className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Check size={48} className="text-green-500 drop-shadow-lg" strokeWidth={4} />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
      </div>

      {/* Exit Button - Moved to Left */}
      <button onClick={onExit} className="absolute top-4 left-4 text-slate-500 hover:text-white z-50 p-2 bg-slate-800/50 rounded-full hover:bg-slate-700 transition-colors">
          <X size={32} />
      </button>

      {/* Next Button (Manual Advance) */}
      <AnimatePresence>
          {showNext && (
              <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={nextQuestion}
                  className="absolute bottom-8 right-8 bg-green-500 hover:bg-green-400 text-white p-6 rounded-full shadow-2xl z-50 flex items-center gap-2 font-black text-xl animate-bounce"
              >
                  NEXT <ChevronRight size={32} />
              </motion.button>
          )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Container ---

const QuizCard = ({ quiz, onPlay, onEdit, onDelete }: { quiz: Quiz, onPlay: () => void, onEdit: () => void, onDelete: () => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow group relative"
  >
    <div className="h-32 bg-indigo-100 flex items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
       <ImageIcon size={48} className="text-indigo-300" />
    </div>
    <div className="p-4">
      <h3 className="font-bold text-lg text-slate-800 mb-1 truncate">{quiz.title}</h3>
      <p className="text-xs text-slate-500 mb-4">{quiz.questions.length} Questions</p>
      
      <div className="flex gap-2">
        <button onClick={onPlay} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors">
          <Play size={16} fill="currentColor" /> PLAY
        </button>
        <button onClick={onEdit} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors" title="Edit">
          <Edit size={16} />
        </button>
        <button onClick={onDelete} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const VisualRecall: React.FC<GameProps> = () => {
  const [mode, setMode] = useState<'MENU' | 'PLAY' | 'BUILD'>('MENU');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const load = async () => {
        await seedInitialData();
        const list = await getQuizzes();
        setQuizzes(list);
    };
    load();
  }, [mode]);

  if (mode === 'PLAY' && activeQuiz) {
    return <Player quiz={activeQuiz} onExit={() => setMode('MENU')} />;
  }

  if (mode === 'BUILD') {
    return (
        <Builder 
            quiz={activeQuiz} 
            onSave={async (q) => {
                await saveQuiz(q);
                setMode('MENU');
                setActiveQuiz(null);
            }}
            onCancel={() => {
                setMode('MENU');
                setActiveQuiz(null);
            }}
        />
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-50 p-8 overflow-y-auto">
      {/* Header - Added pr-48 to avoid overlap with Exit Game button */}
      <header className="mb-8 flex justify-between items-end pr-48">
        <div>
            <h1 className="text-4xl font-black text-slate-800 mb-2">Visual Recall</h1>
            <p className="text-slate-500">Create and play visual assessments.</p>
        </div>
        <button 
            onClick={() => { setActiveQuiz(null); setMode('BUILD'); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-200 transition-all"
        >
            <Plus size={20} /> NEW ASSESSMENT
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {quizzes.map(q => (
            <QuizCard 
                key={q.id} 
                quiz={q} 
                onPlay={() => { setActiveQuiz(q); setMode('PLAY'); }}
                onEdit={() => { setActiveQuiz(q); setMode('BUILD'); }}
                onDelete={async () => {
                    if (confirm('Are you sure?')) {
                        await deleteQuiz(q.id);
                        setQuizzes(await getQuizzes());
                    }
                }}
            />
        ))}
      </div>
    </div>
  );
};

export default VisualRecall;
