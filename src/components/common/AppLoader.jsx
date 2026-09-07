import React, { useState, useEffect } from 'react';
import config from '../../config';

export const AppLoader = ({ message = 'Initializing Command Center...' }) => {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 450);
    const timer2 = setTimeout(() => setProgress(72), 1000);
    const timer3 = setTimeout(() => setProgress(94), 1650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      {/* Ambient background glow effects */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />
      
      {/* Central branding & spinner container */}
      <div className="relative flex flex-col items-center z-10 px-4">
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer glowing pulsing ring */}
          <div className="absolute w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-cyan-400/30 blur-md animate-pulse" />
          
          {/* Outer rotating spinning ring */}
          <div className="w-24 h-24 rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 animate-spin">
            <div className="w-full h-full rounded-2xl bg-slate-950 dark:bg-[#030712]" />
          </div>

          {/* Centered Branded Logo */}
          <div className="absolute w-16 h-16 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 shadow-xl flex items-center justify-center p-2.5 overflow-hidden">
            <img
              src={config.app.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-md animate-pulse"
            />
          </div>
        </div>

        {/* Text & Status */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            <span>{config.app.name}</span>
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Operations
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2.5 text-xs font-mono text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{message}</span>
            <span className="text-cyan-400 font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Modern Progress Line */}
        <div className="w-56 h-1.5 bg-slate-800/80 rounded-full mt-6 overflow-hidden border border-slate-700/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
