import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, Sparkles, Send, ShieldCheck, Sun, Moon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen gradient-bg text-gray-900 dark:text-dark-text relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-pink/10 dark:bg-brand-pink/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-purple/10 dark:bg-brand-purple/5 blur-[180px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-brand-pink fill-brand-pink animate-pulse" />
          <span className="font-extrabold text-2xl bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
            CrushLink
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-gray-200/60 dark:border-dark-border/60 hover:bg-white/40 dark:hover:bg-dark-card/40 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-brand-purple" />}
          </button>
          
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 font-semibold px-4 py-2 hover:text-brand-pink transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-white/80 dark:bg-dark-card/80 border border-gray-200/60 dark:border-dark-border/60 hover:border-brand-pink dark:hover:border-brand-pink hover:shadow-premium text-gray-900 dark:text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 py-12 lg:py-24 z-10">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-brand-pink font-semibold border border-brand-pink/20"
          >
            <Sparkles className="h-4 w-4 fill-brand-pink" /> Make anonymous confessions simple
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight"
          >
            Find out if they <br />
            <span className="bg-gradient-to-r from-brand-pink via-[#FF75A0] to-brand-purple bg-clip-text text-transparent">
              Like You Back
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Create an anonymous link, share it with your crush, and let them confess. No accounts needed for them. Zero stress, full excitement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto bg-gradient-to-r from-brand-pink to-brand-purple text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-premium transition flex items-center justify-center gap-2"
            >
              Get Started Free <Send className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-200 dark:border-dark-border hover:bg-white/40 dark:hover:bg-dark-card/40 transition font-semibold text-center"
            >
              See how it works
            </a>
          </motion.div>
        </div>

        {/* Hero Interactive Card Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 w-full max-w-md relative"
        >
          {/* Card Mockup */}
          <div className="w-full glass-panel p-8 rounded-card shadow-2xl border border-white/80 dark:border-white/5 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>
            
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex p-4 rounded-full bg-pink-100 dark:bg-pink-950/30 text-brand-pink mb-2 animate-bounce">
                <Heart className="h-8 w-8 fill-brand-pink" />
              </div>
              <h3 className="text-2xl font-bold">Someone wants to know...</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">"Do you like me?"</p>
            </div>

            <div className="flex gap-4 mt-4">
              <button className="flex-1 bg-gradient-to-r from-brand-pink to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition">
                ❤️ Yes
              </button>
              <button className="flex-1 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-border/80 text-gray-700 dark:text-gray-300 font-bold py-3.5 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition">
                💔 No
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-20 z-10 border-t border-gray-100 dark:border-dark-border/40">
        <h2 className="text-3xl font-bold text-center mb-16">Everything you need to find the truth</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-card border border-white/60 dark:border-white/5 space-y-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-950/20 text-brand-pink w-fit rounded-2xl">
              <Send className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Unlimited Shareable Links</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create unique customized links for different crushes, specify anonymous messages, and toggles.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-card border border-white/60 dark:border-white/5 space-y-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/20 text-blue-500 w-fit rounded-2xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Protected Anti-Spam</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Restrict multiple entries using secure local IP hashes. No spamming, just accurate responses.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm text-gray-500 dark:text-gray-400 z-10 border-t border-gray-100 dark:border-dark-border/30">
        &copy; {new Date().getFullYear()} CrushLink. Created with 💖 for modern lovers.
      </footer>
    </div>
  );
};
