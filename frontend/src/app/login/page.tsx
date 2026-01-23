'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import config from '@/lib/config';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Just track if component is mounted
    setMounted(true);
  }, []);

  // Check environment only on client side to avoid hydration issues
  const isDevelopment = mounted && config.isDevelopment();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      setAuth(user, token);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">Demand Planning</h1>
        <p className="text-gray-600">Document Workflow Management System</p>
      </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Development Only Section - Hidden in Production */}
        {isDevelopment && (
          <>
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Admin: admin@demandplanning.com / admin123</p>
                <p>Contact admin to create your account</p>
              </div>
            </div>

            {/* Signup Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign Up
                </button>
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Dev Only
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
