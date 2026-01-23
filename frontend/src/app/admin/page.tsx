'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiFolder, FiUsers, FiLayers, FiSettings } from 'react-icons/fi';

export default function AdminPage() {
  const router = useRouter();

  const adminActions = [
    {
      title: 'Manage Departments',
      description: 'Create and manage company departments',
      icon: FiFolder,
      color: 'bg-blue-500',
      href: '/admin/departments',
    },
    {
      title: 'Manage Users',
      description: 'Create and manage employee accounts',
      icon: FiUsers,
      color: 'bg-green-500',
      href: '/admin/users',
    },
    {
      title: 'Manage Levels',
      description: 'Configure hierarchical levels for departments',
      icon: FiLayers,
      color: 'bg-purple-500',
      href: '/admin/levels',
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: FiSettings,
      color: 'bg-gray-500',
      href: '/admin/settings',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">
              Manage system configuration and users
            </p>
          </div>

          {/* Admin Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
              >
                <div className={`${action.color} p-3 rounded-lg inline-block mb-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Overview
            </h2>
            <div className="text-sm text-gray-600">
              <p>Welcome to the DataHive Admin Panel. Use the cards above to manage different aspects of the system.</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
