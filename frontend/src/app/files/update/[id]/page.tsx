'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fileAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiUpload, FiFile } from 'react-icons/fi';

export default function UpdateFilePage() {
  const router = useRouter();
  const params = useParams();
  const fileId = params.id as string;
  
  const [originalFile, setOriginalFile] = useState<any>(null);
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFile();
  }, [fileId]);

  const fetchFile = async () => {
    try {
      const response = await fileAPI.getFile(fileId);
      setOriginalFile(response.data.file);
    } catch (error) {
      console.error('Error fetching file:', error);
      toast.error('Failed to fetch file details');
      router.push('/files/my-files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload only PDF, CSV, or Excel files');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!signature.trim()) {
      toast.error('Please provide your signature');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('comments', comments);

      await fileAPI.updateFile(fileId, formData);
      toast.success('File updated successfully!');
      router.push('/files/my-files');
    } catch (error: any) {
      console.error('Error updating file:', error);
      toast.error(error.response?.data?.message || 'Failed to update file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update File</h1>
            <p className="text-gray-600 mt-1">
              Upload a new version of: {originalFile?.title}
            </p>
          </div>

          {/* Original File Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Current File Information</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Version: {originalFile?.currentVersion}</p>
              <p>
                Current File:{' '}
                {originalFile?.versions[originalFile?.currentVersion - 1]?.fileName}
              </p>
              <p>
                Uploaded by:{' '}
                {originalFile?.versions[originalFile?.currentVersion - 1]?.uploadedBy?.name}
              </p>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Version <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.csv,.xls,.xlsx"
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, CSV, or Excel files up to 10MB
                  </p>
                </div>
              </div>
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <FiFile className="w-4 h-4" />
                  <span>{file.name}</span>
                  <span className="text-gray-400">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification & Signature
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Signature/Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={uploading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    By signing, you verify that the updated data is correct and accurate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Describe what was changed..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                    disabled={uploading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Please describe what changes were made in this version
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                {uploading ? 'Updating...' : 'Update File'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
