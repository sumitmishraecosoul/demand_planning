'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import FilePreview from '@/components/FilePreview';
import StatusTracker from '@/components/StatusTracker';
import { FileCardShimmer } from '@/components/Shimmer';
import { fileAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiEye, FiDownload, FiActivity, FiPlus } from 'react-icons/fi';

export default function FilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const status = searchParams.get('status');

  useEffect(() => {
    fetchFiles();
  }, [status]);

  const fetchFiles = async () => {
    try {
      const params: any = {};
      if (status) params.status = status;

      const response = await fileAPI.getFiles(params);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Files` : 'All Files'}
              </h1>
              <p className="text-gray-600 mt-1">
                Browse and manage documents
              </p>
            </div>
            {user?.role === 'user' && (
              <button
                onClick={() => router.push('/files/upload')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Upload File
              </button>
            )}
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
              <p className="text-gray-500">No files found</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Handler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {file.title}
                            </div>
                            {file.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {file.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.department?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.currentLevel?.levelName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {file.currentHandler?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.currentHandler?.designation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              file.status
                            )}`}
                          >
                            {file.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowPreview(true);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                              title="Preview"
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(
                                  file._id,
                                  file.versions[file.currentVersion - 1]?.fileName
                                )
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Download"
                            >
                              <FiDownload className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowWorkflow(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Workflow"
                            >
                              <FiActivity className="w-5 h-5" />
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
