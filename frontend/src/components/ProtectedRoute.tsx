'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'director' | 'user')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only check auth after component is mounted and auth is not loading
    if (!mounted || isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, allowedRoles, router, mounted, isLoading]);

  // Show loading state while mounting or auth is loading
  if (!mounted || isLoading) {
    return null; // Return null to prevent flash of loading state
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return null; // Return null, router will redirect
  }

  // Check role access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
