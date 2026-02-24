import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../../types';
import { playSound, playMusic } from '../../utils/soundEngine';
import { Heart, Trophy } from 'lucide-react';

// --- GAME CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.5;
const FRICTION = 0.85;
const MOVE_ACCEL = 0.8;
const MAX_SPEED = 7;
const JUMP_FORCE = -14;
const BULLET_SPEED = 12;

type EntityType = 'player' | 'enemy' | 'bullet' | 'particle' | 'boss' | 'platform' | 'coin' | 'enemy_bullet';

interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  color: string;
  hp: number;
  maxHp?: number;
  remove?: boolean;
  grounded?: boolean;
  facingRight?: boolean;
  iframe?: number; 
}

const SuperPlatformer: React.FC<GameProps> = ({ lastInput, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Input State (Mutable Ref for instant access in loop)
  const keys = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    shoot: boolean;
  }>({ left: false, right: false, up: false, down: false, jump: false, shoot: false });

  // Game State (Mutable Ref)
  const gameState = useRef({
    player: { 
      id: 0, type: 'player', x: 100, y: 300, w: 24, h: 32, 
      vx: 0, vy: 0, color: '#3b82f6', hp: 5, maxHp: 5, 
      facingRight: true, grounded: false, iframe: 0 
    } as Entity,
    entities: [] as Entity[],
    platforms: [] as Entity[],
    camera: { x: 0, y: 0 },
    score: 0,
    levelLength: 3000,
    bossSpawned: false,
    gameWon: false,
    gameOver: false
  });

  const [uiState, setUiState] = useState({ score: 0, hp: 5, bossHp: 0, bossMaxHp: 1, gameOver: false, gameWon: false });

  // --- INITIALIZATION ---
  const initLevel = () => {
    const state = gameState.current;
    state.entities = [];
    state.platforms = [];
    state.score = 0;
    state.gameWon = false;
    state.gameOver = false;
    state.bossSpawned = false;
    state.camera.x = 0;

    // Reset Player
    state.player.x = 100;
    state.player.y = 100;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.hp = 5;
    state.player.iframe = 0;

    // Generate Floor
    for (let i = 0; i < state.levelLength; i += 50) {
      if (i > 600 && i < 800) continue; 
      if (i > 1500 && i < 1700) continue; 
      
      state.platforms.push({
        id: Math.random(), type: 'platform',
        x: i, y: CANVAS_HEIGHT - 32, w: 50, h: 32,
        vx: 0, vy: 0, color: '#10b981', hp: 0
      });
    }

    // Generate Platforms
    for (let i = 400; i < state.levelLength - 500; i += 250) {
      const height = CANVAS_HEIGHT - 100 - Math.random() * 150;
      state.platforms.push({
        id: Math.random(), type: 'platform',
        x: i, y: height, w: 100, h: 20,
        vx: 0, vy: 0, color: '#059669', hp: 0
      });

      if (Math.random() > 0.3) {
        state.entities.push({
          id: Math.random(), type: 'enemy',
          x: i + 20, y: height - 40, w: 32, h: 32,
          vx: 2, vy: 0, color: '#ef4444', hp: 2
        });
      }

      if (Math.random() > 0.5) {
         state.entities.push({
            id: Math.random(), type: 'coin',
            x: i + 50, y: height - 50, w: 16, h: 16,
            vx: 0, vy: 0, color: '#fbbf24', hp: 0
         });
      }
    }
  };

  useEffect(() => {
    initLevel();
    playMusic(true);

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      playMusic(false);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Sync Input from Context
  useEffect(() => {
    if (!lastInput) return;
    const btn = lastInput.button;
    
    // Key Logic mapping
    if (btn === 'LEFT_DOWN') keys.current.left = true;
    if (btn === 'LEFT_UP') keys.current.left = false;
    
    if (btn === 'RIGHT_DOWN') keys.current.right = true;
    if (btn === 'RIGHT_UP') keys.current.right = false;

    // JUMP (Space/Up)
    if (btn === 'UP_DOWN') {
      keys.current.jump = true;
      if (gameState.current.player.grounded) {
         gameState.current.player.vy = JUMP_FORCE;
         gameState.current.player.grounded = false;
         playSound.jump();
         spawnParticles(gameState.current.player.x + 12, gameState.current.player.y + 32, 5, '#cbd5e1');
      }
    }
    if (btn === 'UP_UP') keys.current.jump = false;

    // SHOOT (Z key / Square)
    if (btn === 'SQUARE_DOWN') {
        if (!keys.current.shoot) shootPlayerBullet();
        keys.current.shoot = true;
    }
    if (btn === 'SQUARE_UP') keys.current.shoot = false;

  }, [lastInput]);

  // --- GAMEPLAY HELPERS ---

  const shootPlayerBullet = () => {
      const p = gameState.current.player;
      if (gameState.current.gameOver || gameState.current.gameWon) return;

      gameState.current.entities.push({
          id: Math.random(), type: 'bullet',
          x: p.facingRight ? p.x + p.w : p.x,
          y: p.y + p.h / 2 - 4,
          w: 8, h: 8,
          vx: p.facingRight ? BULLET_SPEED : -BULLET_SPEED, vy: 0,
          color: '#fbbf24', hp: 1
      });
      playSound.shoot();
  };

  const spawnParticles = (x: number, y: number, count: number, color: string) => {
      for(let i=0; i<count; i++) {
          gameState.current.entities.push({
              id: Math.random(), type: 'particle',
              x, y, w: 4, h: 4,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: color,
              hp: 20 + Math.random() * 10 
          });
      }
  };

  const checkAABB = (a: Entity, b: Entity) => {
    return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
  };

  // --- MAIN GAME LOOP ---
  const gameLoop = () => {
    const state = gameState.current;
    
    // 1. UPDATE PLAYER PHYSICS
    const p = state.player;
    
    if (keys.current.left) { p.vx -= MOVE_ACCEL; p.facingRight = false; }
    if (keys.current.right) { p.vx += MOVE_ACCEL; p.facingRight = true; }
    
    p.vx *= FRICTION;
    p.vx = Math.max(Math.min(p.vx, MAX_SPEED), -MAX_SPEED);
    
    p.vy += GRAVITY;
    p.y += p.vy;
    
    // Vertical Collision
    p.grounded = false;
    for (const plat of state.platforms) {
       if (checkAABB(p, plat)) {
           if (p.vy > 0 && p.y + p.h - p.vy <= plat.y + 10) { 
               p.y = plat.y - p.h;
               p.vy = 0;
               p.grounded = true;
           }
       }
    }
    
    // Horizontal Collision
    p.x += p.vx;
    for (const plat of state.platforms) {
       if (checkAABB(p, plat) && !p.grounded) {
           if (p.y + p.h > plat.y + 10) { 
              if (p.vx > 0) p.x = plat.x - p.w;
              else if (p.vx < 0) p.x = plat.x + plat.w;
              p.vx = 0;
           }
       }
    }

    if (p.y > CANVAS_HEIGHT) {
        p.hp = 0;
    }
    
    if (p.iframe && p.iframe > 0) p.iframe--;

    // 2. BOSS SPAWN LOGIC
    if (!state.bossSpawned && p.x > state.levelLength - 600) {
        state.bossSpawned = true;
        playMusic(false); 
        playSound.explosion();
        
        state.entities.push({
            id: Date.now(), type: 'boss',
            x: state.levelLength - 150, y: 100,
            w: 80, h: 80,
            vx: 0, vy: 0,
            color: '#9333ea',
            hp: 20, maxHp: 20,
            iframe: 0 
        });
    }

    // 3. ENTITY LOOP
    state.entities.forEach(e => {
        if (e.type === 'particle') {
            e.x += e.vx;
            e.y += e.vy;
            e.vy += GRAVITY * 0.5;
            e.hp--;
            if (e.hp <= 0) e.remove = true;
            return;
        }

        if (e.type === 'bullet') {
            e.x += e.vx;
            e.remove = (e.x > state.camera.x + CANVAS_WIDTH + 100 || e.x < state.camera.x - 100);
            
            state.entities.forEach(target => {
                if (target === e) return;
                if ((target.type === 'enemy' || target.type === 'boss') && checkAABB(e, target)) {
                    target.hp--;
                    e.remove = true;
                    playSound.shoot(); 
                    spawnParticles(e.x, e.y, 5, '#fff');
                    
                    if (target.hp <= 0) {
                        target.remove = true;
                        state.score += (target.type === 'boss' ? 5000 : 100);
                        spawnParticles(target.x, target.y, 20, target.color);
                        playSound.explosion();
                        if (target.type === 'boss') {
                            state.gameWon = true;
                        }
                    }
                }
            });
            return;
        }

        if (e.type === 'enemy') {
            e.vy += GRAVITY;
            e.x += e.vx;
            e.y += e.vy;
            
            for (const plat of state.platforms) {
                if (checkAABB(e, plat)) {
                    if (e.vy > 0 && e.y + e.h - e.vy <= plat.y + 10) {
                         e.y = plat.y - e.h;
                         e.vy = 0;
                    }
                }
            }
            if (e.x > e.x + 200 || Math.random() < 0.01) e.vx = -e.vx; 
            
            if (e.y > CANVAS_HEIGHT) e.remove = true;

            if (checkAABB(p, e) && p.hp > 0 && !p.iframe) {
                p.hp--;
                p.iframe = 60; 
                p.vy = -5;
                p.vx = p.x < e.x ? -10 : 10;
                playSound.wrong();
                spawnParticles(p.x, p.y, 10, '#3b82f6');
            }
        }
        
        if (e.type === 'boss') {
            e.y = 150 + Math.sin(Date.now() / 500) * 50;
            
            e.iframe = (e.iframe || 0) + 1;
            if (e.iframe > 120) { 
                e.iframe = 0;
                const dx = p.x - e.x;
                const dy = p.y - e.y;
                const angle = Math.atan2(dy, dx);
                state.entities.push({
                    id: Math.random(), type: 'enemy_bullet',
                    x: e.x + e.w/2, y: e.y + e.h/2,
                    w: 12, h: 12,
                    vx: Math.cos(angle) * 5,
                    vy: Math.sin(angle) * 5,
                    color: '#a855f7', hp: 1
                });
                playSound.shoot();
            }

            if (checkAABB(p, e) && p.hp > 0 && !p.iframe) {
                p.hp -= 2; 
                p.iframe = 90;
                p.vy = -8;
                p.vx = -15; 
                playSound.wrong();
            }
        }

        if (e.type === 'enemy_bullet') {
             e.x += e.vx;
             e.y += e.vy;
             if (checkAABB(p, e) && p.hp > 0 && !p.iframe) {
                 p.hp--;
                 p.iframe = 60;
                 e.remove = true;
                 playSound.wrong();
                 spawnParticles(p.x, p.y, 5, '#3b82f6');
             }
             if (e.x < state.camera.x - 100 || e.x > state.camera.x + CANVAS_WIDTH) e.remove = true;
        }

        if (e.type === 'coin') {
            if (checkAABB(p, e)) {
                state.score += 50;
                e.remove = true;
                playSound.collect();
                spawnParticles(e.x, e.y, 5, '#fbbf24');
            }
        }
    });

    state.entities = state.entities.filter(e => !e.remove);

    const targetCamX = p.x - CANVAS_WIDTH / 3;
    state.camera.x += (targetCamX - state.camera.x) * 0.1;
    state.camera.x = Math.max(0, Math.min(state.camera.x, state.levelLength - CANVAS_WIDTH));

    if (p.hp <= 0 && !state.gameOver) {
        state.gameOver = true;
        setUiState(prev => ({ ...prev, gameOver: true }));
        playSound.wrong();
        onGameOver(state.score);
    }
    
    const boss = state.entities.find(e => e.type === 'boss');
    setUiState({ 
        score: state.score, 
        hp: p.hp, 
        gameOver: state.gameOver, 
        gameWon: state.gameWon,
        bossHp: boss ? boss.hp : 0,
        bossMaxHp: boss ? (boss.maxHp || 20) : 1
    });

    draw();

    if (!state.gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = gameState.current;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(-state.camera.x * 0.2, 0);
    ctx.fillStyle = '#334155';
    for(let i=0; i<40; i++) {
        ctx.fillRect((i*100) % (CANVAS_WIDTH*2), Math.random() * CANVAS_HEIGHT, 2, 2);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-state.camera.x, 0);

    for (const p of state.platforms) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(p.x, p.y, p.w, 4);
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8);
    }

    for (const e of state.entities) {
        if (e.type === 'particle') {
            ctx.fillStyle = e.color;
            ctx.globalAlpha = (e.hp / 20);
            ctx.fillRect(e.x, e.y, e.w, e.h);
            ctx.globalAlpha = 1;
        } else if (e.type === 'boss') {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y, e.w, e.h);
            ctx.fillStyle = '#fff';
            ctx.fillRect(e.x + 10, e.y + 20, 20, 20);
            ctx.fillRect(e.x + e.w - 30, e.y + 20, 20, 20);
        } else if (e.type === 'coin') {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x + 8, e.y + 8, 6 + Math.sin(Date.now()/200)*2, 0, Math.PI*2);
            ctx.fill();
        } else if (e.type === 'enemy') {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y, e.w, e.h);
        } else if (e.type === 'enemy_bullet') {
             ctx.fillStyle = e.color;
             ctx.beginPath();
             ctx.arc(e.x + 6, e.y + 6, 6, 0, Math.PI * 2);
             ctx.fill();
        } else {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y, e.w, e.h);
        }
    }

    const p = state.player;
    if (p.hp > 0) {
        if (p.iframe && Math.floor(Date.now() / 100) % 2 === 0) {
        } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            
            ctx.fillStyle = 'white';
            const eyeOffset = p.facingRight ? 12 : 4;
            ctx.fillRect(p.x + eyeOffset, p.y + 6, 8, 8);
            
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(p.x, p.y + 4, p.w, 4);
        }
    }

    ctx.restore();
  };

  const restart = () => {
      initLevel();
      setUiState({ score: 0, hp: 5, bossHp: 0, bossMaxHp: 1, gameOver: false, gameWon: false });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 relative overflow-hidden">
      
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
             <Heart key={i} className={`w-8 h-8 ${i < uiState.hp ? 'text-red-500 fill-current animate-pulse' : 'text-slate-700'}`} />
          ))}
        </div>
        <div className="bg-slate-900/80 px-4 py-1 rounded border border-slate-700 text-yellow-400 font-black text-xl font-mono">
           {uiState.score.toString().padStart(6, '0')}
        </div>
      </div>

      {uiState.bossHp > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 z-10 flex flex-col items-center">
              <span className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-1">BOSS</span>
              <div className="w-full h-4 bg-slate-900 border border-purple-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-200"
                    style={{ width: `${(uiState.bossHp / uiState.bossMaxHp) * 100}%` }}
                  ></div>
              </div>
          </div>
      )}

      {uiState.gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-in fade-in">
              <h2 className="text-6xl font-black text-red-600 mb-4 tracking-widest">GAME OVER</h2>
              <p className="text-white text-2xl mb-8">Score: {uiState.score}</p>
              <button onClick={restart} className="bg-white text-black px-8 py-3 font-bold rounded hover:scale-105 transition-transform">TRY AGAIN</button>
          </div>
      )}
      
      {uiState.gameWon && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-in fade-in">
              <Trophy className="text-yellow-400 w-32 h-32 mb-4 animate-bounce" />
              <h2 className="text-6xl font-black text-yellow-400 mb-4 tracking-widest">VICTORY!</h2>
              <p className="text-white text-2xl mb-8">Final Score: {uiState.score}</p>
              <button onClick={restart} className="bg-indigo-600 text-white px-8 py-3 font-bold rounded hover:scale-105 transition-transform">PLAY AGAIN</button>
          </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="w-full max-w-6xl aspect-video bg-slate-900 border-4 border-slate-800 shadow-2xl rounded-lg"
      />
    </div>
  );
};

export default SuperPlatformer;