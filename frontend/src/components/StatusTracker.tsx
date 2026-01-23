'use client';

import { useEffect, useState } from 'react';
import { workflowAPI } from '@/lib/api';
import { FiCheck, FiX, FiClock, FiArrowRight } from 'react-icons/fi';

interface StatusTrackerProps {
  fileId: string;
}

export default function StatusTracker({ fileId }: StatusTrackerProps) {
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflow();
  }, [fileId]);

  const fetchWorkflow = async () => {
    try {
      const response = await workflowAPI.getWorkflow(fileId);
      setWorkflow(response.data.workflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center p-8 text-gray-500">
        No workflow data available
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
      case 'passed':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <FiX className="w-5 h-5 text-red-600" />;
      default:
        return <FiArrowRight className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>

      {/* Timeline */}
      <div className="space-y-4">
        {workflow.steps.map((step: any, index: number) => (
          <div key={index} className="relative">
            {/* Connector Line */}
            {index < workflow.steps.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {getActionIcon(step.action)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {step.level?.levelName || 'Unknown Level'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(step.action)}`}>
                    {step.action}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">{step.handler?.name}</span>
                    {step.handler?.designation && (
                      <span className="text-gray-500"> ({step.handler.designation})</span>
                    )}
                  </p>
                  <p className="text-gray-500">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                  {step.signature && (
                    <p>
                      <span className="text-gray-500">Signature:</span> {step.signature}
                    </p>
                  )}
                  {step.comments && (
                    <p className="text-gray-700 italic">"{step.comments}"</p>
                  )}
                  <p className="text-gray-500">Version: {step.fileVersion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Workflow Status:</span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              workflow.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : workflow.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {workflow.status}
          </span>
        </div>
        {workflow.completedAt && (
          <div className="mt-2 text-sm text-gray-500">
            Completed: {new Date(workflow.completedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
