import React, { useEffect, useState, useRef } from 'react';
import { GameProps } from '../../types';
import { generateProblem, MathProblem } from './gameLogic';
import { Rocket, Sparkles, Clock, RotateCcw } from 'lucide-react';
import { playSound } from '../../utils/soundEngine';

interface Projectile {
  id: number;
  lane: number; // 0-3
  y: number; // 0 to 100%
  color: string;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  color: string;
}

const LANES = [0, 1, 2, 3];
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
const TEXT_COLORS = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500'];
const GAME_DURATION = 60; // Seconds

const MathShooter: React.FC<GameProps> = ({ lastInput, onGameOver }) => {
  const [problem, setProblem] = useState<MathProblem>(generateProblem());
  const problemRef = useRef(problem); 

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  const requestRef = useRef<number>(0);

  // Sync problem ref
  useEffect(() => {
    problemRef.current = problem;
  }, [problem]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
      onGameOver(score);
    }
  }, [timeLeft, isGameOver, onGameOver, score]);

  // Handle Input (Shooting)
  useEffect(() => {
    if (!lastInput || isGameOver) return;
    
    // Map keyboard A,B,C,D (1,2,3,4) to lanes
    const buttonMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const laneIndex = buttonMap[lastInput.button];

    if (laneIndex !== undefined) {
      playSound.shoot(); 
      const newProj: Projectile = {
        id: Date.now() + Math.random(), 
        lane: laneIndex,
        y: 90, 
        color: TEXT_COLORS[laneIndex]
      };
      setProjectiles(prev => [...prev, newProj]);
    }
  }, [lastInput, isGameOver]);

  // Game Loop
  useEffect(() => {
    const updateGame = () => {
      if (!isGameOver) {
          setProjectiles(prev => {
            const next = prev.map(p => ({ ...p, y: p.y - 2 })); 
            
            // Collision Area
            const hits = next.filter(p => p.y < 20 && p.y > 10);
            
            hits.forEach(p => {
               const currentProblem = problemRef.current;
               const selectedAnswer = currentProblem.options[p.lane];
               const isCorrect = selectedAnswer === currentProblem.answer;

               if (isCorrect) {
                 playSound.collect();
                 setExplosions(prevExp => [...prevExp, {
                   id: Date.now() + Math.random(), 
                   x: (p.lane * 25) + 12.5,
                   y: 15,
                   color: COLORS[p.lane]
                 }]);
                 
                 setScore(s => s + 100);
                 setProblem(generateProblem());
               }
            });

            return next.filter(p => p.y > 10 || (p.y <= 10 && problemRef.current.options[p.lane] !== problemRef.current.answer));
          });
      }

      setExplosions(prev => prev.filter(e => Date.now() - e.id < 1000));
      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isGameOver]);

  const restart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    setProjectiles([]);
    setExplosions([]);
    setProblem(generateProblem());
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col">
      {/* HUD */}
      <div className="absolute top-4 left-4 z-[60] flex gap-4">
        <div className="bg-slate-900/90 text-white font-mono text-2xl px-4 py-2 rounded-xl border border-slate-700 shadow-xl">
          SCORE: <span className="text-yellow-400 font-bold">{score}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-xl font-mono text-2xl ${timeLeft < 10 ? 'bg-red-900/90 text-red-200 border-red-500 animate-pulse' : 'bg-slate-900/90 text-white border-slate-700'}`}>
          <Clock size={24} />
          <span>{timeLeft}s</span>
        </div>
      </div>
      
      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 z-[70] bg-slate-950/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <h2 className="text-6xl font-black text-white mb-4">TIME'S UP!</h2>
          <div className="text-4xl text-yellow-400 font-mono mb-8">Final Score: {score}</div>
          <button 
            onClick={restart}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw /> Play Again
          </button>
        </div>
      )}

      {/* Question Display */}
      <div className="flex justify-center mt-10 z-10">
        <div className="bg-white/10 backdrop-blur-md px-12 py-6 rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
           <h1 className="text-6xl font-black text-white tracking-widest">{problem.question}</h1>
        </div>
      </div>

      {/* Targets (Answers) */}
      <div className="grid grid-cols-4 h-full absolute inset-0 pt-32 pb-20 px-8 gap-4">
        {problem.options.map((opt, i) => (
          <div key={i} className="relative flex flex-col items-center justify-start">
             <div className={`w-32 h-32 ${COLORS[i]} rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-white/20 animate-bounce`}>
                <span className="text-5xl font-bold text-white drop-shadow-lg">{opt}</span>
             </div>
             <div className="mt-2 text-white font-bold opacity-50">Key {i+1}</div>
             <div className={`w-1 h-full ${COLORS[i]} opacity-10 mt-4 rounded-full`}></div>
          </div>
        ))}
      </div>

      {/* Projectiles */}
      {projectiles.map(p => (
        <div 
           key={p.id}
           className={`absolute w-4 h-12 rounded-full ${p.color.replace('text', 'bg')} blur-sm`}
           style={{ left: `${(p.lane * 25) + 12.5}%`, top: `${p.y}%`, transform: 'translateX(-50%)' }}
        />
      ))}

      {/* Explosions */}
      {explosions.map(e => (
        <div 
          key={e.id}
          className="absolute z-50 pointer-events-none"
          style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%, -50%)' }}
        >
           <div className="relative">
              <Sparkles className="text-white w-32 h-32 animate-spin" />
              <div className={`absolute inset-0 ${e.color} opacity-50 blur-xl animate-pulse scale-150`}></div>
           </div>
           <div className="absolute top-0 left-0 w-full text-center text-4xl font-black text-white animate-bounce">
              +100
           </div>
        </div>
      ))}
    </div>
  );
};

export default MathShooter;