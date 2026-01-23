'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TableShimmer } from '@/components/Shimmer';
import { adminAPI, departmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    level: 1,
    designation: '',
    accessibleDepartments: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include password for new users or if it's being changed
      if (modalMode === 'create' || formData.password) {
        userData.password = formData.password;
      }

      if (formData.role === 'user') {
        userData.department = formData.department;
        userData.level = formData.level;
        userData.designation = formData.designation;
      } else if (formData.role === 'director') {
        userData.department = formData.department;
        userData.designation = formData.designation;
        userData.accessibleDepartments = formData.accessibleDepartments.length > 0
          ? formData.accessibleDepartments
          : [formData.department];
      }

      if (modalMode === 'create') {
        await adminAPI.createUser(userData);
        toast.success('User created successfully!');
      } else {
        await adminAPI.updateUser(selectedUser._id, userData);
        toast.success('User updated successfully!');
      }
      
      setShowModal(false);
      resetForm();
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} user:`, error);
      toast.error(error.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} user`);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department?._id || '',
      level: user.level || 1,
      designation: user.designation || '',
      accessibleDepartments: user.accessibleDepartments?.map((d: any) => d._id) || [],
    });
    setShowModal(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    setDeleting(true);
    try {
      await adminAPI.deleteUser(selectedUser._id);
      toast.success('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateNew = () => {
    setModalMode('create');
    resetForm();
    setSelectedUser(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      department: '',
      level: 1,
      designation: '',
      accessibleDepartments: [],
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'director':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-1">Manage employee accounts</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create User
            </button>
          </div>

          {/* Users List */}
          {loading ? (
            <TableShimmer rows={5} columns={7} />
          ) : users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No users found. Create your first user!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.level || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.designation || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg max-w-2xl w-full my-8">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalMode === 'create' ? 'Create User' : 'Edit User'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setSelectedUser(null);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={modalMode === 'edit'}
                      />
                      {modalMode === 'edit' && (
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {modalMode === 'create' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required={modalMode === 'create'}
                      />
                      {modalMode === 'edit' && (
                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="director">Director</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {(formData.role === 'user' || formData.role === 'director') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({ ...formData, department: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select department...</option>
                            {departments.map((dept) => (
                              <option key={dept._id} value={dept._id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) =>
                              setFormData({ ...formData, designation: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </>
                    )}

                    {formData.role === 'user' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.level}
                          onChange={(e) =>
                            setFormData({ ...formData, level: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                        setSelectedUser(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creating}
                    >
                      {creating 
                        ? (modalMode === 'create' ? 'Creating...' : 'Updating...') 
                        : (modalMode === 'create' ? 'Create User' : 'Update User')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={deleting}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete this user?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-red-900">{selectedUser.name}</p>
                    <p className="text-sm text-red-700">{selectedUser.email}</p>
                    <p className="text-sm text-red-700 mt-2">
                      Role: <span className="font-medium">{selectedUser.role}</span>
                    </p>
                  </div>
                  <p className="text-sm text-red-600 mt-4 font-medium">
                    ⚠️ This action cannot be undone. All user data will be permanently deleted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
