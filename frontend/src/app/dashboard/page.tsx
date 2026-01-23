'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardShimmer } from '@/components/Shimmer';
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FiFolder,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
} from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Files',
      value: stats?.totalFiles || 0,
      icon: FiFolder,
      color: 'bg-blue-500',
      onClick: () => router.push('/files'),
    },
    {
      title: 'My Files',
      value: stats?.myFiles || 0,
      icon: FiFileText,
      color: 'bg-purple-500',
      onClick: () => router.push('/files/my-files'),
    },
    {
      title: 'Pending',
      value: stats?.pendingFiles || 0,
      icon: FiClock,
      color: 'bg-yellow-500',
      onClick: () => router.push('/files?status=pending'),
    },
    {
      title: 'In Progress',
      value: stats?.inProgressFiles || 0,
      icon: FiClock,
      color: 'bg-blue-500',
      onClick: () => router.push('/files?status=in-progress'),
    },
    {
      title: 'Completed',
      value: stats?.completedFiles || 0,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      onClick: () => router.push('/files?status=completed'),
    },
    {
      title: 'Rejected',
      value: stats?.rejectedFiles || 0,
      icon: FiXCircle,
      color: 'bg-red-500',
      onClick: () => router.push('/files?status=rejected'),
    },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        {loading ? (
          <DashboardShimmer />
        ) : (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                {user?.role === 'admin'
                  ? 'Manage your organization\'s document workflow'
                  : user?.role === 'director'
                  ? `Managing ${user.accessibleDepartments?.length || 0} department(s)`
                  : `${user?.department?.name || 'Your'} Department - Level ${user?.level || 'N/A'}`}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => (
                <button
                  key={index}
                  onClick={stat.onClick}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                </button>
              ))}
            </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'user' && (
                <button
                  onClick={() => router.push('/files/upload')}
                  className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Upload New File
                </button>
              )}
              <button
                onClick={() => router.push('/files/my-files')}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View My Files
              </button>
              <button
                onClick={() => router.push('/files')}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Browse All Files
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
