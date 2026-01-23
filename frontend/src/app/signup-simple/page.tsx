'use client';

import { useState } from 'react';

export default function SignupSimplePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">✅ SIGNUP WORKING!</h1>
        <p className="text-gray-600 mb-6">
          If you can see this page, routing works. The redirect issue is fixed.
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            onClick={() => alert('Form works! Now go to real signup at /signup')}
          >
            Test Button
          </button>
        </form>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ This page has NO environment checks<br/>
            ✅ NO redirects<br/>
            ✅ NO complex logic<br/>
            <br/>
            <strong>If this page works but /signup doesn't, the issue is in the signup page code.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
