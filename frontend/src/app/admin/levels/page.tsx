'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ShimmerBox } from '@/components/Shimmer';
import { adminAPI, departmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiList } from 'react-icons/fi';

export default function LevelsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [levels, setLevels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'bulk'>('add');
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [levelForm, setLevelForm] = useState({
    levelName: '',
    description: '',
    handlers: [] as string[],
  });

  const [levelForms, setLevelForms] = useState<any[]>([
    { levelName: '', description: '', handlers: [] as string[] },
  ]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchLevels();
      fetchDepartmentUsers();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    }
  };

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLevelsByDepartment(selectedDepartment);
      setLevels(response.data.levels);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ department: selectedDepartment });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addLevelForm = () => {
    setLevelForms([...levelForms, { levelName: '', description: '', handlers: [] as string[] }]);
  };

  const removeLevelForm = (index: number) => {
    const newForms = levelForms.filter((_, i) => i !== index);
    setLevelForms(newForms);
  };

  const updateLevelForm = (index: number, field: string, value: any) => {
    const newForms = [...levelForms];
    newForms[index][field] = value;
    setLevelForms(newForms);
  };

  const toggleHandlerInBulkForm = (index: number, handlerId: string) => {
    const newForms = [...levelForms];
    const handlers = newForms[index].handlers || [];
    if (handlers.includes(handlerId)) {
      newForms[index].handlers = handlers.filter((h: string) => h !== handlerId);
    } else {
      newForms[index].handlers = [...handlers, handlerId];
    }
    setLevelForms(newForms);
  };

  const handleCreateLevels = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await adminAPI.createLevels({
        departmentId: selectedDepartment,
        levels: levelForms,
      });
      toast.success('Levels created successfully!');
      setShowModal(false);
      setLevelForms([{ levelName: '', description: '', handlers: [] as string[] }]);
      fetchLevels();
    } catch (error: any) {
      console.error('Error creating levels:', error);
      toast.error(error.response?.data?.message || 'Failed to create levels');
    } finally {
      setCreating(false);
    }
  };

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await adminAPI.addLevel({
        departmentId: selectedDepartment,
        levelName: levelForm.levelName,
        description: levelForm.description,
        handlers: levelForm.handlers,
      });
      toast.success('Level added successfully!');
      setShowModal(false);
      setLevelForm({ levelName: '', description: '', handlers: [] as string[] });
      fetchLevels();
    } catch (error: any) {
      console.error('Error adding level:', error);
      toast.error(error.response?.data?.message || 'Failed to add level');
    } finally {
      setCreating(false);
    }
  };

  const handleEditLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) return;
    
    setCreating(true);

    try {
      await adminAPI.updateLevel(selectedLevel._id, {
        levelName: levelForm.levelName,
        description: levelForm.description,
        handlers: levelForm.handlers,
      });
      toast.success('Level updated successfully!');
      setShowModal(false);
      setSelectedLevel(null);
      setLevelForm({ levelName: '', description: '', handlers: [] as string[] });
      fetchLevels();
    } catch (error: any) {
      console.error('Error updating level:', error);
      toast.error(error.response?.data?.message || 'Failed to update level');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Are you sure you want to delete this level? This will affect the approval flow.')) {
      return;
    }

    setDeleting(true);
    try {
      await adminAPI.deleteLevel(levelId);
      toast.success('Level deleted successfully!');
      fetchLevels();
    } catch (error: any) {
      console.error('Error deleting level:', error);
      toast.error(error.response?.data?.message || 'Failed to delete level');
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedLevel(null);
    setLevelForm({ levelName: '', description: '', handlers: [] as string[] });
    setShowModal(true);
  };

  const openEditModal = (level: any) => {
    setModalMode('edit');
    setSelectedLevel(level);
    setLevelForm({
      levelName: level.levelName,
      description: level.description || '',
      handlers: level.handlers?.map((h: any) => h._id) || [],
    });
    setShowModal(true);
  };

  const openBulkModal = () => {
    setModalMode('bulk');
    setSelectedLevel(null);
    setLevelForms([{ levelName: '', description: '', handlers: [] as string[] }]);
    setShowModal(true);
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Approval Flow</h1>
              <p className="text-gray-600 mt-1">
                Configure approval flow for departments
              </p>
            </div>
            {selectedDepartment && (
              <div className="flex gap-2">
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Level
                </button>
                <button
                  onClick={openBulkModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <FiList className="w-5 h-5" />
                  Configure All Levels
                </button>
              </div>
            )}
          </div>

          {/* Department Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Choose a department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Levels Display */}
          {selectedDepartment && (
            <>
              {loading ? (
                <div className="space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <ShimmerBox className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <ShimmerBox className="h-5 w-32" />
                        <ShimmerBox className="h-4 w-48" />
                      </div>
                      <ShimmerBox className="h-9 w-24" />
                    </div>
                  ))}
                </div>
              ) : levels.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">
                    No levels configured for this department. Click "Configure All Levels" to set up
                    the approval flow.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Approval Flow
                  </h2>
                  <div className="space-y-3">
                    {levels.map((level, index) => (
                      <div key={level._id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary-600">
                            L{level.levelNumber}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{level.levelName}</h3>
                              {level.description && (
                                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                              )}
                              {level.handlers && level.handlers.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">Handlers:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {level.handlers.map((handler: any) => (
                                      <span
                                        key={handler._id}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                      >
                                        {handler.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => openEditModal(level)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Level"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLevel(level._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Level"
                                disabled={deleting}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {index < levels.length - 1 && (
                          <div className="text-gray-400">→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Configure Levels Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg max-w-3xl w-full my-8">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalMode === 'add' ? 'Add New Level' : 
                     modalMode === 'edit' ? 'Edit Level' : 
                     'Configure All Levels'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Add or Edit Single Level Form */}
                {(modalMode === 'add' || modalMode === 'edit') && (
                  <form onSubmit={modalMode === 'add' ? handleAddLevel : handleEditLevel} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        {modalMode === 'add' 
                          ? 'This will add a new level to the end of the current approval flow.'
                          : 'Update the level details. This will not affect the flow sequence.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={levelForm.levelName}
                        onChange={(e) => setLevelForm({ ...levelForm, levelName: e.target.value })}
                        placeholder="e.g., L5, Senior Manager"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={levelForm.description}
                        onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                        placeholder="Enter level description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handlers (Select Multiple)
                      </label>
                      <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                        {users.length === 0 ? (
                          <p className="text-sm text-gray-500">No users available in this department</p>
                        ) : (
                          users.map((user) => (
                            <label key={user._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={levelForm.handlers.includes(user._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLevelForm({ ...levelForm, handlers: [...levelForm.handlers, user._id] });
                                  } else {
                                    setLevelForm({ ...levelForm, handlers: levelForm.handlers.filter(h => h !== user._id) });
                                  }
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">{user.name} - {user.designation}</span>
                            </label>
                          ))
                        )}
                      </div>
                      {levelForm.handlers.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">{levelForm.handlers.length} handler(s) selected</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
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
                        {creating ? 'Saving...' : modalMode === 'add' ? 'Add Level' : 'Update Level'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Bulk Configure Levels Form */}
                {modalMode === 'bulk' && (
                  <form onSubmit={handleCreateLevels} className="p-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Creating new levels will replace the existing approval flow
                      for this department.
                    </p>
                  </div>

                  {levelForms.map((form, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Level {index + 1}</h3>
                        {levelForms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLevelForm(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Level Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.levelName}
                          onChange={(e) => updateLevelForm(index, 'levelName', e.target.value)}
                          placeholder="e.g., L1, Manager, Senior Officer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={form.description}
                          onChange={(e) => updateLevelForm(index, 'description', e.target.value)}
                          placeholder="Enter level description..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Handlers (Select Multiple)
                        </label>
                        <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                          {users.length === 0 ? (
                            <p className="text-xs text-gray-500">No users available</p>
                          ) : (
                            users.map((user) => (
                              <label key={user._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm">
                                <input
                                  type="checkbox"
                                  checked={form.handlers?.includes(user._id) || false}
                                  onChange={() => toggleHandlerInBulkForm(index, user._id)}
                                  className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs">{user.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        {form.handlers?.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">{form.handlers.length} selected</p>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addLevelForm}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    Add Another Level
                  </button>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
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
                        {creating ? 'Creating...' : 'Save Levels'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
