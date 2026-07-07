import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, XCircle, Loader } from 'lucide-react';

export const Verification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        if (response.data.status === 'success') {
          setStatus('success');
          setMessage(response.data.message);
          // Wait 3 seconds and redirect to login
          setTimeout(() => {
            navigate('/login?message=Email successfully verified! You can now log in.');
          }, 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed or link expired.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="text-center py-6 space-y-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-12 w-12 text-brand-pink animate-spin" />
          <h3 className="text-2xl font-bold">Verifying Email</h3>
          <p className="text-gray-500">Please wait while we confirm your email address...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Success!</h3>
          <p className="text-gray-500 max-w-sm">{message}</p>
          <p className="text-xs text-gray-400">Redirecting to login shortly...</p>
          <Link
            to="/login"
            className="mt-4 text-brand-pink font-semibold hover:underline"
          >
            Click here if not redirected
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-16 w-16 text-rose-500" />
          <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Verification Failed</h3>
          <p className="text-gray-500 max-w-sm">{message}</p>
          <Link
            to="/login"
            className="mt-6 w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
};
