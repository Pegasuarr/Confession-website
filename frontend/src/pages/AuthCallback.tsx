import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { setAuthToken } from '../services/api';
import { Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    const handleCallback = async () => {
      if (!token) {
        navigate('/login?error=GoogleAuthFailed');
        return;
      }

      try {
        // Set temp token to retrieve profile
        setAuthToken(token);
        const response = await api.get('/auth/me');
        if (response.data.status === 'success') {
          login(token, response.data.user);
          navigate('/dashboard');
        } else {
          setAuthToken(null);
          navigate('/login?error=GoogleAuthFailed');
        }
      } catch (error) {
        console.error('Error during Google authentication callback retrieval', error);
        setAuthToken(null);
        navigate('/login?error=GoogleAuthFailed');
      }
    };

    handleCallback();
  }, [token, login, navigate]);

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center space-y-4 text-gray-900 dark:text-white">
      <Loader className="h-12 w-12 text-brand-pink animate-spin" />
      <h3 className="text-xl font-bold">Authenticating with Google...</h3>
      <p className="text-gray-500 text-sm">Please wait while we finalize your sign-in.</p>
    </div>
  );
};
