'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiHome,
  FiFolder,
  FiUpload,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
} from 'react-icons/fi';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      router.push('/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, roles: ['admin', 'director', 'user'] },
    { name: 'Under Review', href: '/files/my-files', icon: FiFolder, roles: ['user', 'director'] },
    { name: 'All Files', href: '/files', icon: FiFolder, roles: ['admin', 'director', 'user'] },
    { name: 'Admin Panel', href: '/admin', icon: FiSettings, roles: ['admin'] },
    { name: 'Departments', href: '/admin/departments', icon: FiFolder, roles: ['admin'] },
    { name: 'Users', href: '/admin/users', icon: FiUsers, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-primary-600">Demand Planning</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
