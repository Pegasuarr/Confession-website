import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Link2,
  MessageCircle,
  Eye,
  ShieldAlert,
  UserX,
  UserCheck,
  Search,
  Activity
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Admin General Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data.stats;
    },
  });

  // 2. Fetch Users List
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.users;
    },
  });

  // 3. User Ban Mutation
  const banMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.patch(`/admin/users/${userId}/ban`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Action failed.');
    },
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="glass-panel p-8 text-center rounded-card border border-red-200 dark:border-red-900/30 max-w-md mx-auto mt-12 space-y-4">
        <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" />
        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</h3>
        <p className="text-gray-500">You do not have administrative permissions to view this resource.</p>
      </div>
    );
  }

  if (statsLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 skeleton-shimmer rounded-card" />
          ))}
        </div>
        <div className="h-96 skeleton-shimmer rounded-card" />
      </div>
    );
  }

  const stats = statsData || {
    totalUsers: 0,
    totalLinks: 0,
    totalResponses: 0,
    totalVisits: 0,
    yesCount: 0,
    noCount: 0,
    yesPercentage: 0,
    noPercentage: 0,
  };

  const usersList = usersData || [];

  const filteredUsers = usersList.filter(
    (u: any) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardStats = [
    { title: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Total Links Created', value: stats.totalLinks, icon: Link2, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Total Responses', value: stats.totalResponses, icon: MessageCircle, color: 'text-brand-pink bg-brand-pink/10' },
    { title: 'Total Opens/Visits', value: stats.totalVisits, icon: Eye, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Monitor systems operations, users, and flag abuse.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass-panel p-6 rounded-card shadow-premium border border-gray-100 dark:border-dark-border">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yes/No ratio visual split */}
      <div className="glass-panel p-6 rounded-card border border-gray-100 dark:border-dark-border space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-1.5"><Activity className="h-5 w-5 text-brand-purple" /> Global Voting Ratio</h3>
        {stats.totalResponses > 0 ? (
          <div className="flex items-center w-full gap-2">
            <div
              className="bg-brand-pink h-6 rounded-l flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${stats.yesPercentage}%` }}
            >
              ❤️ {stats.yesPercentage}% Yes ({stats.yesCount})
            </div>
            <div
              className="bg-gray-400 dark:bg-gray-600 h-6 rounded-r flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${stats.noPercentage}%` }}
            >
              💔 {stats.noPercentage}% No ({stats.noCount})
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">No responses logged yet globally.</p>
        )}
      </div>

      {/* Users Management Panel */}
      <div className="glass-panel rounded-card border border-gray-100 dark:border-dark-border overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold">User Management</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 text-sm outline-none focus:border-brand-pink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-dark-card/50 text-xs font-semibold text-gray-400 uppercase border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Created Links</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-sm">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/20 dark:hover:bg-dark-card/10">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300">
                        {u.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        u.verified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {u.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{u._count.links} links</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${u.role === 'ADMIN' ? 'text-brand-purple' : 'text-gray-400'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        u.banned ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {u.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user?.id ? (
                        <button
                          onClick={() => banMutation.mutate(u.id)}
                          disabled={banMutation.isPending}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            u.banned
                              ? 'border-emerald-200 dark:border-emerald-950/20 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/10'
                              : 'border-rose-200 dark:border-rose-950/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10'
                          }`}
                        >
                          {u.banned ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5" /> Enable Account
                            </>
                          ) : (
                            <>
                              <UserX className="h-3.5 w-3.5" /> Disable Account
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic font-medium">Self</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No users found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
