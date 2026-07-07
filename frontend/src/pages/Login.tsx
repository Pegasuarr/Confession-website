import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if there was an email verification message or other notice
  const message = searchParams.get('message');
  const errorParam = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.status === 'success') {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400">Log in to manage your CrushLinks</p>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-sm font-medium text-center">
          {message}
        </div>
      )}

      {(error || errorParam) && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-medium text-center">
          {error || (errorParam === 'GoogleAuthFailed' ? 'Google authentication failed.' : 'An error occurred.')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1 relative">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1 relative">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-purple hover:text-brand-pink font-semibold transition"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 disabled:opacity-75"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-purple hover:text-brand-pink font-semibold transition">
          Sign Up
        </Link>
      </p>
    </div>
  );
};
