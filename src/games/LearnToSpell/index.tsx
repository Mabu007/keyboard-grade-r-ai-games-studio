import React, { useEffect, useState } from 'react';
import { GameProps } from '../../types';
import { challenges, getNextChallenge } from './gameLogic';
import { Check, X, Clock, RotateCcw } from 'lucide-react';
import { playSound } from '../../utils/soundEngine';

const GAME_DURATION = 60; 

const LearnToSpell: React.FC<GameProps> = ({ lastInput, onGameOver }) => {
  const [index, setIndex] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(challenges[0]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);

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

  useEffect(() => {
    if (!lastInput || feedback !== null || isGameOver) return;

    // Map buttons A, B, C, D to options 0, 1, 2, 3
    const buttonMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const selectedIndex = buttonMap[lastInput.button];

    if (selectedIndex !== undefined && selectedIndex < currentChallenge.options.length) {
      const selectedOption = currentChallenge.options[selectedIndex];
      
      if (selectedOption === currentChallenge.correctOption) {
        setFeedback('correct');
        setScore(s => s + 10);
        playSound.success(); 

        setTimeout(() => {
          const next = getNextChallenge(index);
          setIndex(i => i + 1);
          setCurrentChallenge(next);
          setFeedback(null);
        }, 1500); 
      } else {
        setFeedback('wrong');
        playSound.wrong(); 
        setTimeout(() => setFeedback(null), 800);
      }
    }
  }, [lastInput, isGameOver]);

  const restart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    setIndex(0);
    setCurrentChallenge(challenges.sort(() => Math.random() - 0.5)[0]);
  };

  const renderWord = () => {
    return currentChallenge.word.split('').map((char, i) => (
      <div 
        key={i} 
        className={`w-20 h-24 mx-2 flex items-center justify-center text-6xl font-black rounded-lg shadow-inner transition-all duration-300
          ${i === currentChallenge.missingIndex 
            ? 'bg-slate-800 border-b-8 border-yellow-500 text-yellow-400 animate-pulse' 
            : 'bg-slate-700 text-white'}`}
      >
        {i === currentChallenge.missingIndex ? (feedback === 'correct' ? char : '?') : char}
      </div>
    ));
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const borderColors = ['border-red-700', 'border-blue-700', 'border-green-700', 'border-yellow-700'];

  const IconComponent = currentChallenge.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 p-8 relative overflow-hidden">
      
      {/* HUD: Score and Timer */}
      <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-start z-20">
         <div className={`flex items-center gap-2 px-6 py-3 rounded-full border shadow-xl font-mono text-3xl transition-colors duration-500 ${timeLeft < 10 ? 'bg-red-900/90 text-red-200 border-red-500 animate-pulse' : 'bg-slate-800 text-white border-slate-700'}`}>
            <Clock size={32} />
            <span>{timeLeft}s</span>
         </div>

         <div className="text-3xl text-white font-black bg-slate-800 px-6 py-3 rounded-full border border-slate-700 shadow-xl">
           Score: <span className="text-yellow-400">{score}</span>
         </div>
      </div>
      
      {/* Game Content - Icon Display */}
      <div className="mb-10 p-8 bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-700 rotate-1 transition-transform duration-500 hover:rotate-0 z-10 mt-16 flex items-center justify-center w-80 h-80">
        <IconComponent 
            size={200} 
            className={`${currentChallenge.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300`} 
            strokeWidth={1.5}
        />
      </div>

      <div className="flex mb-16 z-10">
        {renderWord()}
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 z-[70] bg-slate-950/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <h2 className="text-7xl font-black text-white mb-4 drop-shadow-lg">TIME'S UP!</h2>
          <div className="text-5xl text-yellow-400 font-mono mb-12">Final Score: {score}</div>
          <button 
            onClick={restart}
            className="flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-2xl transition-all hover:scale-105 active:scale-95 shadow-xl ring-4 ring-indigo-900"
          >
            <RotateCcw size={32} /> Play Again
          </button>
        </div>
      )}

      {/* Feedback Overlay */}
      {feedback && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 z-50 backdrop-blur-sm animate-in fade-in duration-200">
           {feedback === 'correct' ? (
             <div className="flex flex-col items-center animate-bounce">
                <Check className="w-64 h-64 text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" strokeWidth={3} />
                <span className="text-6xl font-black text-green-400 mt-4 tracking-widest uppercase">Excellent!</span>
             </div>
           ) : (
             <div className="flex flex-col items-center animate-pulse">
                <X className="w-64 h-64 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" strokeWidth={3} />
                <span className="text-6xl font-black text-red-500 mt-4 tracking-widest uppercase">Try Again</span>
             </div>
           )}
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-5xl z-10">
        {currentChallenge.options.map((opt, i) => (
          <div key={i} className={`relative ${colors[i]} h-32 rounded-3xl flex items-center justify-center text-7xl font-black text-white shadow-2xl border-b-[12px] ${borderColors[i]}`}>
            {opt}
            <div className="absolute top-2 left-4 text-xs font-mono opacity-50">KEY {i+1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnToSpell;