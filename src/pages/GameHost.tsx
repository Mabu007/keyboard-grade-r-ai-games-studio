import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInput } from '../context/InputContext';
import { GAMES } from './Directory';
import { Home, LogOut } from 'lucide-react';

const GameHost: React.FC = () => {
  const { gameId } = useParams() as { gameId: string };
  const navigate = useNavigate();
  const { lastInput } = useInput();
  const mountTime = useRef(Date.now());

  const activeGame = GAMES.find(g => g.id === gameId);

  // Handle "BACK" input from InputContext (Escape/Backspace)
  useEffect(() => {
    // Only accept BACK input if it happened after the component mounted (prevent immediate exit loop)
    if (lastInput?.button === 'BACK' && lastInput.timestamp > mountTime.current + 200) {
        navigate('/');
    }
  }, [lastInput, navigate]);

  const handleManualExit = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Blur to prevent "Enter" key re-triggering this button if it retains focus
      e.currentTarget.blur();
      navigate('/');
  };

  if (!activeGame) return <div>Game not found</div>;

  const ActiveComponent = activeGame.component;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Mini Sidebar */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 z-20">
        <button 
           onClick={handleManualExit} 
           className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 hover:text-indigo-400 transition-colors mb-4"
           title="Back to Menu"
        >
          <Home size={24} />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative bg-slate-950 flex flex-col">
         {/* Game Header Overlay */}
         <div className="absolute top-0 left-0 p-8 pointer-events-none z-10 opacity-20">
            <h2 className="text-4xl font-black text-white uppercase tracking-widest">{activeGame.name}</h2>
         </div>

         {/* EXIT BUTTON OVERLAY - High Z-Index to stay on top of games */}
         <div className="absolute top-6 right-6 z-[100]">
            <button 
                onClick={handleManualExit}
                className="bg-red-600/90 hover:bg-red-500 text-white px-5 py-2 rounded-full font-bold shadow-lg border-2 border-red-700/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group cursor-pointer"
            >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                EXIT GAME
            </button>
         </div>

         <div className="flex-1 relative">
            <ActiveComponent 
                playerCount={1} 
                lastInput={lastInput} 
                onGameOver={(score) => console.log('Game Over', score)} 
            />
         </div>
      </div>
    </div>
  );
};

export default GameHost;