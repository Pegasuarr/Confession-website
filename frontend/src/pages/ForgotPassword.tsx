import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your email to receive a password reset link
        </p>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium">
            If the account exists, we have sent a password reset email. Please check your spam folder if it doesn't arrive.
          </div>
          <Link
            to="/login"
            className="block w-full text-center border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card/30 font-semibold py-3.5 px-4 rounded-xl transition"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center disabled:opacity-75"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>

          <p className="text-sm text-center text-gray-500">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-purple hover:text-brand-pink font-semibold transition">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
};
