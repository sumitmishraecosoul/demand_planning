'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, departmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiBriefcase, FiLayers } from 'react-icons/fi';

export default function SignupPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department: '',
    level: 1,
    designation: '',
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simple inline environment check - no external dependencies
    if (typeof window === 'undefined') return;

    const nodeEnv = process.env.NODE_ENV;
    const hostname = window.location.hostname;
    const isDev = nodeEnv === 'development' || hostname === 'localhost' || hostname === '127.0.0.1';

    console.log('🔍 Signup Environment Check:');
    console.log('  NODE_ENV:', nodeEnv);
    console.log('  Hostname:', hostname);
    console.log('  Is Development:', isDev);

    if (!isDev) {
      console.log('⚠️ Not in development, redirecting...');
      router.replace('/login');
      return;
    }

    console.log('✅ Development confirmed - loading signup');
    setMounted(true);
    fetchDepartments();
  }, [router]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'level' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if ((formData.role === 'user' || formData.role === 'director') && !formData.department) {
      toast.error('Please select a department');
      return;
    }

    if ((formData.role === 'user' || formData.role === 'director') && !formData.designation) {
      toast.error('Please enter your designation');
      return;
    }

    setLoading(true);

    try {
      const signupData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'user') {
        signupData.department = formData.department;
        signupData.level = formData.level;
        signupData.designation = formData.designation;
      } else if (formData.role === 'director') {
        signupData.department = formData.department;
        signupData.designation = formData.designation;
        signupData.accessibleDepartments = [formData.department];
      }

      await authAPI.register(signupData);
      toast.success('Account created successfully! Please login.');
      router.push('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Demand Planning</h1>
          <p className="text-gray-600">Create New Account</p>
          <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full inline-block">
            Development Mode Only
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="director">Director</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {(formData.role === 'user' || formData.role === 'director') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={loading}
                >
                  <option value="">Select department...</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(formData.role === 'user' || formData.role === 'director') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g., Junior Officer"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {formData.role === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLayers className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="level"
                    min="1"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
