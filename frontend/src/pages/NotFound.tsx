import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 text-gray-900 dark:text-white">
      <div className="w-full max-w-md glass-panel p-8 rounded-card text-center shadow-2xl space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-500/20 blur-lg rounded-full" />
          <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto relative" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold">404</h3>
          <h4 className="text-xl font-bold">Page Not Found</h4>
          <p className="text-gray-500 dark:text-gray-400">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-brand-pink to-brand-purple hover:shadow-premium text-white font-bold py-3.5 px-6 rounded-xl inline-block transition"
          >
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};
