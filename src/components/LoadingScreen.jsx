import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const LoadingScreen = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative">
        {/* Spinning Dots/Sparkles Container */}
        <div className="absolute inset-[-40px] animate-[spin_4s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary dark:bg-white shadow-[0_0_10px_rgba(var(--primary),0.8)] dark:shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)] dark:shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.8)] dark:shadow-[0_0_10px_rgba(147,197,253,0.8)]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-400 dark:bg-orange-200 shadow-[0_0_8px_rgba(251,146,60,0.8)] dark:shadow-[0_0_10px_rgba(253,186,116,0.8)]" />
        </div>

        {/* Counter-spinning Dots */}
        <div className="absolute inset-[-60px] animate-[spin_6s_linear_infinite_reverse] opacity-40">
           <div className="absolute top-1/4 left-0 w-1.5 h-1.5 rounded-full bg-primary/80 dark:bg-white" />
           <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400/80 dark:bg-emerald-200" />
           <div className="absolute top-3/4 left-1/4 w-1 h-1 rounded-full bg-blue-400/80 dark:bg-blue-200" />
        </div>

        {/* Logo Container */}
        <div className="relative w-24 h-24 flex items-center justify-center bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 z-10 animate-in zoom-in duration-700">
          <img 
            src={isDarkMode ? '/favicon-light.png' : '/favicon-dark.png'} 
            alt="Logo" 
            className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          />

        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
