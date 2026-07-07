import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { Heart, MailOpen, Mail, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LinkDetails {
  id: string;
  title: string | null;
  message: string | null;
  slug: string;
  expiresAt: string | null;
  multipleResponses: boolean;
  user: {
    name: string;
  };
}

export const Recipient: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; left: string; size: string; delay: string; duration: string }>>([]);

  // Generate background hearts on load
  useEffect(() => {
    const list = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      size: `${Math.random() * 20 + 12}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 5 + 6}s`,
    }));
    setHearts(list);
  }, []);

  // Fetch Link Details
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const response = await api.get(`/links/${slug}`);
        setLinkDetails(response.data.link);
      } catch (err: any) {
        setError(err.response?.data?.message || 'This link is invalid or no longer exists.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchLink();
  }, [slug]);

  const handleRespond = async (answer: 'YES' | 'NO') => {
    if (!slug) return;
    try {
      await api.post(`/links/${slug}/respond`, { answer });
      
      if (answer === 'YES') {
        // Confetti explosion
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF4D8D', '#9D4EDD', '#FF85A2', '#B5179E'],
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit response. You may have already responded.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen recipient-gradient dark:bg-radial flex items-center justify-center text-gray-900 dark:text-white">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-brand-pink fill-brand-pink animate-pulse mx-auto" />
          <h3 className="text-xl font-semibold">Opening confession...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen recipient-gradient flex items-center justify-center p-6 text-gray-900 dark:text-white">
        <div className="w-full max-w-md glass-panel p-8 rounded-card text-center shadow-2xl space-y-4">
          <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto" />
          <h3 className="text-2xl font-bold">Link Unavailable</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <div className="pt-4">
            <Link
              to="/"
              className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3 px-6 rounded-xl inline-block"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen recipient-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Floating background hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          ❤️
        </span>
      ))}

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {!envelopeOpen ? (
            /* Interactive Envelope View */
            <motion.div
              key="envelope"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setEnvelopeOpen(true)}
              className="glass-panel p-8 rounded-card shadow-2xl text-center cursor-pointer border border-white/60 hover:scale-[1.02] active:scale-[0.98] transition-all space-y-6"
            >
              <div className="relative inline-block mt-4">
                <div className="absolute inset-0 bg-brand-pink/20 blur-xl rounded-full scale-110" />
                <div className="relative p-6 bg-pink-100 dark:bg-pink-950/20 text-brand-pink rounded-full border border-brand-pink/30 animate-pulse">
                  <Mail className="h-12 w-12" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">You received an invitation</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  Someone wants to ask you something. Click to open.
                </p>
              </div>
              <button className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-1.5 mx-auto hover:shadow-premium transition">
                Open Letter <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          ) : submitted ? (
            /* Confetti / Success Submission View */
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel p-8 rounded-card shadow-2xl text-center border border-white/60 space-y-6"
            >
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
              <div>
                <h3 className="text-2xl font-bold">Response Recorded!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Thank you! Your response has been securely and anonymously sent back.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-dark-border/40 space-y-2">
                <p className="text-xs text-gray-400">Want to test your own crush?</p>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3 px-6 rounded-xl inline-block"
                >
                  Create My CrushLink
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Questions / Form View */
            <motion.div
              key="question"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-panel p-8 rounded-card border border-white/60 shadow-2xl text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-pink-100 dark:bg-pink-950/20 text-brand-pink rounded-full">
                  <MailOpen className="h-10 w-10 animate-bounce" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Someone wants to know...
                </span>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-pink to-brand-purple bg-clip-text text-transparent">
                  Do you like me?
                </h2>
              </div>

              {linkDetails?.message && (
                <div className="bg-white/40 dark:bg-dark-card/40 p-4 rounded-xl border border-gray-100 dark:border-dark-border/40 text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed text-left relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-pink to-brand-purple" />
                  "{linkDetails.message}"
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRespond('YES')}
                  className="flex-1 bg-gradient-to-r from-brand-pink to-pink-500 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-premium-purple transition flex items-center justify-center gap-1.5"
                >
                  ❤️ Yes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRespond('NO')}
                  className="flex-1 bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 font-bold py-4 rounded-xl transition hover:bg-gray-200 dark:hover:bg-dark-border/60"
                >
                  💔 No
                </motion.button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-border/40 text-[10px] text-gray-400">
                Your response is 100% anonymous. IP details are hashed for anti-spam controls only.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
