import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sun, Moon } from 'lucide-react';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen gradient-bg text-gray-900 dark:text-dark-text flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-pink/10 dark:bg-brand-pink/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-purple/10 dark:bg-brand-purple/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-brand-pink fill-brand-pink animate-pulse" />
          <span className="font-extrabold text-xl bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
            CrushLink
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-gray-200/60 dark:border-dark-border/60 hover:bg-white/40 dark:hover:bg-dark-card/40 transition-all shadow-sm"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-brand-purple" />}
        </button>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md glass-panel p-8 rounded-card shadow-premium border border-white/60 dark:border-white/5 relative">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-gray-500 dark:text-gray-400 z-10">
        &copy; {new Date().getFullYear()} CrushLink. Spread Love, Anonymously.
      </footer>
    </div>
  );
};
