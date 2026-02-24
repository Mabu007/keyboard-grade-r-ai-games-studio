import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../../types';
import { TARGETS, StormWord, Bullet, getLaneColor, TargetDef } from './gameLogic';
import { playSound, playMusic } from '../../utils/soundEngine';
import { Trophy } from 'lucide-react';

const LANE_COUNT = 4;
const SPAWN_RATE_START = 60; 
const BULLET_SPEED = 20; 
const WORD_SPEED_BASE = 1.5;

const WordStorm: React.FC<GameProps> = ({ lastInput, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const lastProcessedInputTime = useRef<number>(0);

  const state = useRef({
    words: [] as StormWord[],
    bullets: [] as Bullet[],
    particles: [] as any[],
    currentTarget: TARGETS[0] as TargetDef,
    score: 0,
    combo: 0,
    health: 100,
    cameraShake: 0,
    frameCount: 0,
    gameOver: false,
    guns: [0, 0, 0, 0], 
    uiDirty: false 
  });

  const [uiState, setUiState] = useState({ 
    score: 0, 
    targetWord: TARGETS[0].word, 
    TargetIcon: TARGETS[0].icon,
    health: 100, 
    gameOver: false 
  });

  const pickNewTarget = () => {
    let newTarget = state.current.currentTarget;
    let attempts = 0;
    while (newTarget === state.current.currentTarget && attempts < 10) {
        newTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
        attempts++;
    }
    state.current.currentTarget = newTarget;
    state.current.uiDirty = true;
  };

  const spawnWord = () => {
    const lane = Math.floor(Math.random() * LANE_COUNT) as 0|1|2|3;
    const shouldSpawnTarget = Math.random() < 0.4; 
    
    let text = '';
    if (shouldSpawnTarget) {
        text = state.current.currentTarget.word;
    } else {
        const distractors = TARGETS.filter(t => t.word !== state.current.currentTarget.word);
        text = distractors[Math.floor(Math.random() * distractors.length)].word;
    }

    state.current.words.push({
      id: Date.now() + Math.random(),
      text,
      lane,
      y: -50,
      color: getLaneColor(lane),
      active: true
    });
  };

  const fireBullet = (lane: 0 | 1 | 2 | 3) => {
      state.current.bullets.push({
          id: Date.now() + Math.random(),
          lane,
          y: 380, 
          active: true
      });
      state.current.guns[lane] = 8; 
      playSound.shoot();
  };

  const createExplosion = (x: number, y: number, color: string, count: number = 15) => {
    for (let i = 0; i < count; i++) {
      state.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 1.0,
        color: color,
        size: Math.random() * 6 + 3
      });
    }
  };

  useEffect(() => {
    playMusic(true);
    pickNewTarget();
    
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      playMusic(false);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!lastInput || state.current.gameOver) return;
    
    if (lastInput.timestamp === lastProcessedInputTime.current) return;
    lastProcessedInputTime.current = lastInput.timestamp;

    const btnMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const lane = btnMap[lastInput.button];

    if (lane !== undefined) {
        fireBullet(lane as 0|1|2|3);
    }
  }, [lastInput]);

  const gameLoop = () => {
    const s = state.current;
    if (s.gameOver) return;

    s.frameCount++;

    const currentSpawnRate = Math.max(20, SPAWN_RATE_START - Math.floor(s.score / 500) * 5);
    if (s.frameCount % currentSpawnRate === 0) spawnWord();
    
    if (s.cameraShake > 0) s.cameraShake *= 0.9;
    
    for(let i=0; i<4; i++) {
        if(s.guns[i] > 0) s.guns[i]--;
    }

    s.bullets.forEach(b => {
        if (!b.active) return;
        b.y -= BULLET_SPEED;
        if (b.y < -50) b.active = false;

        for (const w of s.words) {
            if (w.active && w.lane === b.lane) {
                if (Math.abs(w.y - b.y) < 60) {
                    b.active = false;
                    w.active = false;
                    
                    if (w.text === s.currentTarget.word) {
                        s.score += 250 + (s.combo * 50);
                        s.combo++;
                        s.health = Math.min(100, s.health + 5);
                        s.cameraShake = 15;
                        createExplosion(200 + (w.lane * 133), w.y, '#60a5fa', 30); 
                        playSound.success();
                        pickNewTarget(); 
                    } else {
                        s.score = Math.max(0, s.score - 50);
                        s.combo = 0;
                        s.health -= 5;
                        s.cameraShake = 5;
                        createExplosion(200 + (w.lane * 133), w.y, '#ef4444', 10); 
                        playSound.wrong();
                    }
                    s.uiDirty = true;
                    break; 
                }
            }
        }
    });

    s.words.forEach(w => {
        if (w.active) {
            w.y += WORD_SPEED_BASE + (s.score / 5000); 
            
            if (w.y > 450) {
                w.active = false;
                if (w.text === s.currentTarget.word) {
                    s.health -= 10;
                    s.combo = 0;
                    s.cameraShake = 5;
                    playSound.wrong();
                    pickNewTarget(); 
                    s.uiDirty = true;
                }
            }
        }
    });

    s.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
    });
    s.particles = s.particles.filter(p => p.life > 0);
    s.bullets = s.bullets.filter(b => b.active);
    s.words = s.words.filter(w => w.active);

    if (s.health <= 0) {
        s.gameOver = true;
        setUiState(prev => ({ ...prev, gameOver: true }));
        onGameOver(s.score);
    }

    if (s.uiDirty) {
        setUiState(prev => ({ 
            ...prev, 
            score: s.score, 
            health: s.health,
            targetWord: s.currentTarget.word,
            TargetIcon: s.currentTarget.icon
        }));
        s.uiDirty = false;
    }

    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = state.current;

    ctx.clearRect(0, 0, 800, 450);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, '#0f172a'); 
    gradient.addColorStop(1, '#312e81'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 450);

    ctx.save();
    if (s.cameraShake > 0.5) {
        ctx.translate((Math.random() - 0.5) * s.cameraShake, (Math.random() - 0.5) * s.cameraShake);
    }

    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.lineTo(200, 150); 
    ctx.lineTo(600, 150); 
    ctx.lineTo(800, 450);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    ctx.lineWidth = 2;
    for (let i = 0; i < LANE_COUNT; i++) {
        const xBottom = 100 + (i * (600 / LANE_COUNT)); 
        const xTop = 250 + (i * (300 / LANE_COUNT));
        const wBottom = 600 / LANE_COUNT;
        const wTop = 300 / LANE_COUNT;

        if (s.guns[i] > 0) {
             ctx.fillStyle = `rgba(255, 255, 255, ${s.guns[i] / 20})`;
             ctx.beginPath();
             ctx.moveTo(xBottom, 450);
             ctx.lineTo(xTop, 150);
             ctx.lineTo(xTop + wTop, 150);
             ctx.lineTo(xBottom + wBottom, 450);
             ctx.fill();
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(xBottom, 450);
        ctx.lineTo(xTop, 150);
        ctx.stroke();
    }

    for(let i=0; i<4; i++) {
        const cx = 175 + (i * 150); 
        const cy = 400 + (s.guns[i] * 2); 
        const color = getLaneColor(i);
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 20); 
        ctx.lineTo(cx - 15, cy + 20); 
        ctx.lineTo(cx + 15, cy + 20); 
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(cx - 10, cy + 15, 20, 10);
        
        if (s.guns[i] > 6) {
            ctx.fillStyle = '#fff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(cx, cy - 30, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    s.bullets.forEach(b => {
        const progress = (450 - b.y) / 300; 
        const startX = 175 + (b.lane * 150);
        const endX = 287 + (b.lane * 75); 
        
        const x = startX + (endX - startX) * progress;

        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = getLaneColor(b.lane);
        
        ctx.beginPath();
        ctx.ellipse(x, b.y, 4, 12, 0, 0, Math.PI*2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    });

    s.words.forEach(w => {
        let laneRatio = 0; 
        if (w.y < 450) {
             laneRatio = Math.max(0, (450 - w.y) / 300); 
        }
        
        const startX = 175 + (w.lane * 150);
        const endX = 287 + (w.lane * 75);
        const x = startX + (endX - startX) * laneRatio;
        
        const scale = 1.0 - (laneRatio * 0.6);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(x, w.y + 30 * scale, 30 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        const isTarget = w.text === s.currentTarget.word;

        if (isTarget) {
            ctx.shadowColor = w.color;
            ctx.shadowBlur = 40;
        }

        ctx.fillStyle = w.color;
        
        const size = 40 * scale;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + size * Math.cos(i * Math.PI / 3), w.y + size * Math.sin(i * Math.PI / 3));
        }
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(x, w.y - 10*scale, size/2, 0, Math.PI*2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = `900 ${24 * scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(w.text, x, w.y);
    });

    s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    ctx.restore();
  };

  const restart = () => {
    state.current = {
        words: [],
        bullets: [],
        particles: [],
        currentTarget: TARGETS[0],
        score: 0,
        combo: 0,
        health: 100,
        cameraShake: 0,
        frameCount: 0,
        gameOver: false,
        guns: [0,0,0,0],
        uiDirty: true
    };
    setUiState({ score: 0, targetWord: TARGETS[0].word, TargetIcon: TARGETS[0].icon, health: 100, gameOver: false });
    pickNewTarget();
  };

  const Icon = uiState.TargetIcon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 relative overflow-hidden">
      
      {/* HUD */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10">
         
         <div className="flex flex-col items-center">
            <div className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-2 animate-bounce">SHOOT THIS!</div>
            <div className="bg-indigo-900/40 backdrop-blur-md border-2 border-indigo-400/50 px-10 py-4 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.4)] flex items-center gap-4">
                <Icon size={48} className="text-white drop-shadow-lg" />
                <span className="text-6xl font-black text-white drop-shadow-lg tracking-widest">{uiState.targetWord}</span>
            </div>
         </div>

         <div className="flex flex-col items-end gap-2">
            <div className="bg-slate-900/80 px-6 py-2 rounded-xl border border-slate-700 shadow-xl">
               <span className="text-yellow-400 font-mono text-4xl font-black">{uiState.score}</span>
            </div>
            <div className="w-64 h-6 bg-slate-800 rounded-full border border-slate-600 overflow-hidden shadow-inner">
                <div 
                    className={`h-full transition-all duration-300 ${uiState.health > 30 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
                    style={{ width: `${uiState.health}%` }}
                />
            </div>
         </div>
      </div>

      <div className="absolute bottom-0 w-full h-16 grid grid-cols-4 px-[100px] pointer-events-none">
         <div className="border-t-4 border-red-500 flex justify-center pt-2 opacity-50"><span className="text-red-500 font-black text-2xl">A</span></div>
         <div className="border-t-4 border-blue-500 flex justify-center pt-2 opacity-50"><span className="text-blue-500 font-black text-2xl">B</span></div>
         <div className="border-t-4 border-green-500 flex justify-center pt-2 opacity-50"><span className="text-green-500 font-black text-2xl">C</span></div>
         <div className="border-t-4 border-yellow-500 flex justify-center pt-2 opacity-50"><span className="text-yellow-500 font-black text-2xl">D</span></div>
      </div>

      <canvas 
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full object-cover"
      />
      
      {uiState.gameOver && (
          <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
             <h2 className="text-6xl font-black text-white mb-2 tracking-tighter">MISSION COMPLETE</h2>
             <p className="text-3xl text-indigo-300 mb-12 font-mono">Score: {uiState.score}</p>
             <button onClick={restart} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-full font-black text-2xl transition-all hover:scale-105 shadow-2xl ring-4 ring-indigo-900">
                PLAY AGAIN
             </button>
          </div>
      )}
    </div>
  );
};

export default WordStorm;