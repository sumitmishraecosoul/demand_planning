'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signature: string, comments: string) => void;
  action: string;
  loading?: boolean;
}

export default function SignatureModal({
  isOpen,
  onClose,
  onSubmit,
  action,
  loading = false,
}: SignatureModalProps) {
  const [signature, setSignature] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signature.trim()) {
      onSubmit(signature, comments);
      setSignature('');
      setComments('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {action === 'reject' ? 'Reject File' : 'Sign and Verify'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              By signing, you verify the accuracy of the data
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or notes..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading || !signature.trim()}
            >
              {loading ? 'Processing...' : action === 'reject' ? 'Reject' : 'Sign & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
