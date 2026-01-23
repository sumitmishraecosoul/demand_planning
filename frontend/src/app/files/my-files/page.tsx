'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FilePreview from '@/components/FilePreview';
import { FileCardShimmer } from '@/components/Shimmer';
import { fileAPI, workflowAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiEye, FiDownload, FiUpload, FiCheck, FiX, FiActivity } from 'react-icons/fi';
import StatusTracker from '@/components/StatusTracker';

export default function MyFilesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [actionType, setActionType] = useState<'pass' | 'reject' | 'update'>('pass');
  const [departmentUsers, setDepartmentUsers] = useState<any[]>([]);
  const [selectedNextHandler, setSelectedNextHandler] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const fetchMyFiles = async () => {
    try {
      const response = await fileAPI.getFiles({ myFiles: true });
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching my files:', error);
      toast.error('Failed to fetch your files');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentUsers = async (departmentId: string) => {
    try {
      const response = await workflowAPI.getDepartmentUsers(departmentId, true);
      setDepartmentUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching department users:', error);
    }
  };

  const handlePassFile = async (file: any) => {
    setSelectedFile(file);
    setActionType('pass');
    await fetchDepartmentUsers(file.department._id);
    setShowSignature(true);
  };

  const handleRejectFile = async (file: any) => {
    setSelectedFile(file);
    setActionType('reject');
    setShowSignature(true);
  };

  const getDeclarationText = () => {
    if (!selectedFile || !user) return '';
    
    const userName = user.name;
    const isCreator = selectedFile.createdBy?._id === user._id;
    const hasMultipleVersions = selectedFile.currentVersion > 1;
    const isOriginalVersion = selectedFile.currentVersion === 1;
    
    // Check if current user uploaded any version
    const userUploadedVersion = selectedFile.versions?.some(
      (v: any) => v.uploadedBy?._id === user._id
    );
    
    // If user created the file (L1 - initial upload)
    if (isCreator && isOriginalVersion) {
      return `I, ${userName}, hereby declare that I have created and take full responsibility and accountability for the following demand plan.`;
    }
    
    // If user updated the file (downloaded, modified, and re-uploaded)
    if (userUploadedVersion && hasMultipleVersions) {
      return `I, ${userName}, hereby declare that I have made some changes and reviewed the file and take full responsibility and accountability for the following demand plan.`;
    }
    
    // If user is reviewing (L2, L3, L4 - just passing without upload)
    return `I, ${userName}, hereby declare that I have reviewed and take full responsibility and accountability for the following demand plan.`;
  };

  const handleSubmitAction = async (signature: string, comments: string) => {
    if (actionType === 'pass' && !selectedNextHandler) {
      toast.error('Please select the next handler');
      return;
    }

    setUpdating(true);
    try {
      if (actionType === 'reject') {
        await workflowAPI.rejectFile(selectedFile._id, { signature, comments });
        toast.success('File rejected successfully');
      } else {
        await workflowAPI.passToNextLevel(selectedFile._id, {
          nextHandler: selectedNextHandler,
          signature,
          comments,
          action: 'passed',
        });
        toast.success('File passed to next level successfully');
      }
      
      setShowSignature(false);
      setSelectedFile(null);
      setSelectedNextHandler('');
      fetchMyFiles();
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast.error(error.response?.data?.message || 'Failed to process file');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fileAPI.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleUpdateFile = (file: any) => {
    router.push(`/files/update/${file._id}`);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demands Under Review</h1>
            <p className="text-gray-600 mt-1">
              Demand plans assigned to you for review
            </p>
          </div>

          {/* Files List */}
          {loading ? (
            <div className="space-y-4">
              <FileCardShimmer />
              <FileCardShimmer />
              <FileCardShimmer />
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No files assigned to you</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {file.title}
                      </h3>
                      {file.description && (
                        <p className="text-gray-600 mt-1">{file.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Level: {file.currentLevel?.levelName}</span>
                        <span>•</span>
                        <span>Version: {file.currentVersion}</span>
                        <span>•</span>
                        <span>
                          Created: {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        file.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : file.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : file.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {file.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowPreview(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <FiEye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          file._id,
                          file.versions[file.currentVersion - 1]?.fileName
                        )
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleUpdateFile(file)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <FiUpload className="w-4 h-4" />
                      Update File
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowWorkflow(true);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <FiActivity className="w-4 h-4" />
                      Workflow
                    </button>
                    {file.status !== 'completed' && file.status !== 'rejected' && (
                      <>
                        <button
                          onClick={() => handlePassFile(file)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <FiCheck className="w-4 h-4" />
                          Pass to Next
                        </button>
                        <button
                          onClick={() => handleRejectFile(file)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <FiX className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Preview Modal */}
          {showPreview && selectedFile && (
            <FilePreview
              file={selectedFile}
              onClose={() => {
                setShowPreview(false);
                setSelectedFile(null);
              }}
              onDownload={() =>
                handleDownload(
                  selectedFile._id,
                  selectedFile.versions[selectedFile.currentVersion - 1]?.fileName
                )
              }
            />
          )}

          {/* Signature Modal with Next Handler Selection */}
          {showSignature && selectedFile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {actionType === 'reject' ? 'Reject File' : 'Pass to Next Level'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowSignature(false);
                      setSelectedFile(null);
                      setSelectedNextHandler('');
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={updating}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const signature = formData.get('signature') as string;
                  const comments = formData.get('comments') as string;
                  handleSubmitAction(signature, comments);
                }} className="p-6 space-y-4">
                  {/* Next Handler Selection (only for pass action) */}
                  {actionType === 'pass' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Next Handler <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedNextHandler}
                        onChange={(e) => setSelectedNextHandler(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a person...</option>
                        {departmentUsers.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} - {u.designation} (Level {u.level})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Declaration Statement */}
                  {actionType === 'pass' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 leading-relaxed">
                        {getDeclarationText()}
                      </p>
                    </div>
                  )}

                  {/* Signature Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Signature/Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="signature"
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                      disabled={updating}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      By signing, you verify the accuracy of the data
                    </p>
                  </div>

                  {/* Comments Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      name="comments"
                      placeholder="Add any comments or notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      disabled={updating}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSignature(false);
                        setSelectedFile(null);
                        setSelectedNextHandler('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                        actionType === 'reject'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={updating}
                    >
                      {updating 
                        ? 'Processing...' 
                        : actionType === 'reject' 
                          ? 'Reject File' 
                          : 'Pass to Next Level'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Workflow Modal */}
          {showWorkflow && selectedFile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">Workflow Status: {selectedFile.title}</h2>
                  <button
                    onClick={() => {
                      setShowWorkflow(false);
                      setSelectedFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <StatusTracker fileId={selectedFile._id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
