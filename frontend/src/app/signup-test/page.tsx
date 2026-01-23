'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupTestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const nodeEnv = process.env.NODE_ENV;
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isDev = nodeEnv === 'development';
      const shouldShowSignup = isDev || isLocalhost;

      setEnvInfo({
        nodeEnv,
        hostname,
        isLocalhost,
        isDev,
        shouldShowSignup,
      });

      console.log('🔍 Signup Test Page:');
      console.log('  NODE_ENV:', nodeEnv);
      console.log('  Hostname:', hostname);
      console.log('  Is Localhost:', isLocalhost);
      console.log('  Should Show Signup:', shouldShowSignup);

      if (!shouldShowSignup) {
        console.log('⚠️ Redirecting to login...');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!envInfo.shouldShowSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600 font-bold">Not in development mode</p>
          <p className="mt-2 text-gray-600">Redirecting to login in 2 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Signup Page Working!</h1>
        <p className="text-gray-600 mb-6">
          If you can see this page without being redirected, the environment detection is working correctly.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">Environment Info:</h2>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">NODE_ENV:</span> {envInfo.nodeEnv}</p>
            <p><span className="font-medium">Hostname:</span> {envInfo.hostname}</p>
            <p><span className="font-medium">Is Localhost:</span> {envInfo.isLocalhost ? '✅ Yes' : '❌ No'}</p>
            <p><span className="font-medium">Is Dev Mode:</span> {envInfo.isDev ? '✅ Yes' : '❌ No'}</p>
            <p><span className="font-medium">Should Show Signup:</span> {envInfo.shouldShowSignup ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Go to Real Signup Page
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a test page. If this page works without redirecting, 
            but the real signup page doesn't, then the issue is with the config module import.
          </p>
        </div>
      </div>
    </div>
  );
}
