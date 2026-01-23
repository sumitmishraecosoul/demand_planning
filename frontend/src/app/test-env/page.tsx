'use client';

import { useEffect, useState } from 'react';
import config from '@/lib/config';

export default function TestEnvPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInfo({
        nodeEnv: process.env.NODE_ENV,
        hostname: window.location.hostname,
        isDev: config.isDevelopment(),
        href: window.location.href,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Environment Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">NODE_ENV:</p>
            <p className="text-lg">{info.nodeEnv || 'Loading...'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">Hostname:</p>
            <p className="text-lg">{info.hostname || 'Loading...'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">Is Development:</p>
            <p className={`text-lg font-bold ${info.isDev ? 'text-green-600' : 'text-red-600'}`}>
              {info.isDev ? '✅ TRUE' : '❌ FALSE'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">Current URL:</p>
            <p className="text-sm break-all">{info.href || 'Loading...'}</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-900 mb-2">Expected for Signup to Work:</p>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>NODE_ENV: "development"</li>
              <li>Hostname: "localhost" or "127.0.0.1"</li>
              <li>Is Development: TRUE</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
