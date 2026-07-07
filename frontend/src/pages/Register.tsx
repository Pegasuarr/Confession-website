import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { User, Mail, Lock, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.status === 'success') {
        navigate(`/login?message=${encodeURIComponent(response.data.message)}`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
        <p className="text-gray-500 dark:text-gray-400">Join CrushLink to find out the truth</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1 relative">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('name')}
              placeholder="John Doe"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium pl-1">{errors.name.message}</p>
          )}
        </div>

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
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
            />
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-dark-border"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Or continue with</span>
        <div className="flex-grow border-t border-gray-200 dark:border-dark-border"></div>
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/30 font-semibold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.73,17,12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5c1.21,0,2.3.43,3.15,1.18l2.1-2.1C15.8,4.78,14,4,12,4,7.58,4,4,7.58,4,12s3.58,8,8,8c4.15,0,7.9-2.97,7.9-8C19.9,11.75,19.78,11.41,21.35,11.1Z"
              fill="#EA4335"
              className="fill-rose-500"
            />
          </g>
        </svg>
        Sign Up with Google
      </button>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-purple hover:text-brand-pink font-semibold transition">
          Sign In
        </Link>
      </p>
    </div>
  );
};
