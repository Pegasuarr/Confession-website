import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Link2,
  Heart,
  Eye,
  MessageCircle,
  Plus,
  Calendar,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface ResponseItem {
  id: string;
  answer: 'YES' | 'NO';
  createdAt: string;
  link: {
    title: string | null;
    slug: string;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch all user links containing nested responses
  const { data, isLoading } = useQuery({
    queryKey: ['my-links'],
    queryFn: async () => {
      const response = await api.get('/links');
      return response.data.links;
    },
  });

  const links = data || [];

  // Compute metrics
  const totalLinks = links.length;
  const totalVisits = links.reduce((sum: number, l: any) => sum + (l.visits || 0), 0);
  
  const allResponses = links.flatMap((l: any) =>
    l.responses.map((r: any) => ({
      ...r,
      linkTitle: l.title || `Slug: ${l.slug}`,
      slug: l.slug,
    }))
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalResponses = allResponses.length;
  const yesResponses = allResponses.filter((r: any) => r.answer === 'YES').length;
  const noResponses = allResponses.filter((r: any) => r.answer === 'NO').length;

  const yesPercentage = totalResponses > 0 ? Math.round((yesResponses / totalResponses) * 100) : 0;
  const noPercentage = totalResponses > 0 ? Math.round((noResponses / totalResponses) * 100) : 0;

  const statCards = [
    { title: 'Total Links', value: totalLinks, icon: Link2, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Total Opens', value: totalVisits, icon: Eye, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Total Responses', value: totalResponses, icon: MessageCircle, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Yes Ratio', value: `${yesPercentage}%`, icon: Heart, color: 'text-brand-pink bg-brand-pink/10 fill-brand-pink/10' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 skeleton-shimmer rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 skeleton-shimmer rounded-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 skeleton-shimmer rounded-card" />
          <div className="h-96 skeleton-shimmer rounded-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Hi, {user?.name} 👋</h2>
          <p className="text-gray-500 dark:text-gray-400">Here is how your CrushLinks are doing today.</p>
        </div>
        <Link
          to="/dashboard/links"
          className="bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <Plus className="h-5 w-5" /> Create CrushLink
        </Link>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 rounded-card shadow-premium relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.title}</span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Answer Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-card shadow-premium flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold mb-1">Answer Breakdown</h3>
            <p className="text-xs text-gray-500">Breakdown of Yes vs No feedback ratios</p>
          </div>

          <div className="py-8 flex justify-center items-center relative">
            {totalResponses > 0 ? (
              <div className="flex flex-col items-center justify-center w-full space-y-4">
                {/* Visual Custom Progress Bars */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="flex items-center gap-1 text-brand-pink"><Heart className="h-4 w-4 fill-brand-pink" /> Yes ({yesResponses})</span>
                    <span>{yesPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border h-4 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${yesPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-brand-pink to-pink-400"
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="flex items-center gap-1 text-gray-500">💔 No ({noResponses})</span>
                    <span>{noPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-border h-4 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${noPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gray-400 dark:bg-gray-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No responses received yet.</p>
              </div>
            )}
          </div>
          <div className="text-xs text-center text-gray-500 border-t border-gray-100 dark:border-dark-border/40 pt-4">
            Share links to start collecting votes!
          </div>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel p-6 rounded-card shadow-premium flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-5 w-5 text-brand-purple" />
              <h3 className="text-xl font-bold">Recent Activity</h3>
            </div>
            <p className="text-xs text-gray-500">Live feed of answers to your CrushLinks</p>
          </div>

          <div className="flex-1 mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {allResponses.length > 0 ? (
              allResponses.slice(0, 10).map((resp: any, i: number) => (
                <div key={resp.id} className="flex items-start justify-between p-3.5 rounded-xl bg-white/40 dark:bg-dark-card/40 border border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      resp.answer === 'YES' ? 'text-brand-pink bg-brand-pink/10' : 'text-gray-500 bg-gray-100 dark:bg-dark-border'
                    }`}>
                      {resp.answer === 'YES' ? <Heart className="h-5 w-5 fill-brand-pink" /> : <span>💔</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Responded <span className={resp.answer === 'YES' ? 'text-brand-pink font-bold' : 'text-gray-500'}>{resp.answer}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Link: <span className="underline">{resp.linkTitle}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 self-center">
                    {new Date(resp.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm font-medium">No activity recorded yet.</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-dark-border/40 pt-4 flex justify-between items-center text-xs mt-4">
            <span className="text-gray-500">Showing up to 10 latest entries</span>
            <Link to="/dashboard/links" className="text-brand-purple hover:text-brand-pink font-semibold flex items-center gap-1 transition">
              Manage Links <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
