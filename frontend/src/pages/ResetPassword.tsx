import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { Lock } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (!token) {
      setError('Missing reset token in URL.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      if (response.data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login?message=Password updated successfully! Please sign in with your new password.');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Set New Password</h2>
        <p className="text-gray-500 dark:text-gray-400">Enter and confirm your new secure password</p>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium">
            Password reset successfully! Redirecting you to login...
          </div>
          <Link
            to="/login"
            className="block text-brand-pink font-semibold hover:underline"
          >
            Click here to sign in now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1 relative">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
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

          {/* Confirm Password */}
          <div className="space-y-1 relative">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition outline-none"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 font-medium pl-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center disabled:opacity-75"
          >
            {loading ? 'Updating password...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
};
