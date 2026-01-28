'use client';

import React from 'react';
import { FiCheck, FiCircle, FiUser } from 'react-icons/fi';

interface WorkflowTimelineProps {
  file: any;
}

export default function WorkflowTimeline({ file }: WorkflowTimelineProps) {
  if (!file.departmentLevels || file.departmentLevels.length === 0) {
    return null;
  }

  const levels = file.departmentLevels;
  const currentLevelNumber = file.currentLevel?.levelNumber || 1;
  const workflowSteps = file.workflowHistory?.steps || [];

  // Get the handler who processed each level from workflow history
  const getLevelHandler = (levelId: string) => {
    const step = workflowSteps.find((s: any) => s.level._id === levelId);
    return step?.handler || null;
  };

  // Get all assigned handlers for a level
  const getLevelAssignedHandlers = (levelId: string) => {
    const step = workflowSteps.find((s: any) => s.level._id === levelId);
    return step?.assignedHandlers || [];
  };

  // Determine status of each level
  const getLevelStatus = (level: any) => {
    if (level.levelNumber < currentLevelNumber) {
      return 'completed';
    } else if (level.levelNumber === currentLevelNumber) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Approval Flow Status
      </h3>

      {/* Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {levels.map((level: any, index: number) => {
            const status = getLevelStatus(level);
            const handler = getLevelHandler(level._id);
            const assignedHandlers = getLevelAssignedHandlers(level._id);
            const allHandlers = assignedHandlers.length > 0 ? assignedHandlers : level.handlers;

            return (
              <React.Fragment key={level._id}>
                {/* Level Node */}
                <div className="flex flex-col items-center relative z-10 flex-1">
                  {/* Circle/Check */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-600 shadow-lg shadow-green-200'
                        : status === 'current'
                        ? 'bg-blue-500 border-blue-600 shadow-lg shadow-blue-200 animate-pulse'
                        : 'bg-gray-200 border-gray-300'
                    }`}
                  >
                    {status === 'completed' ? (
                      <FiCheck className="w-6 h-6 text-white font-bold" />
                    ) : status === 'current' ? (
                      <FiCircle className="w-6 h-6 text-white fill-current" />
                    ) : (
                      <FiCircle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Level Name */}
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-semibold ${
                        status === 'completed'
                          ? 'text-green-700'
                          : status === 'current'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {level.levelName}
                    </div>

                    {/* Handler Name(s) */}
                    {status === 'completed' && handler && (
                      <div className="mt-1 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                        <FiUser className="w-3 h-3 inline mr-1" />
                        {handler.name}
                      </div>
                    )}

                    {status === 'current' && (
                      <div className="mt-1 text-xs">
                        {allHandlers && allHandlers.length > 0 ? (
                          allHandlers.length === 1 ? (
                            <div className="text-blue-700 bg-blue-100 px-2 py-1 rounded font-medium shadow-sm border border-blue-200">
                              <FiUser className="w-3 h-3 inline mr-1" />
                              {allHandlers[0].name}
                            </div>
                          ) : (
                            <div className="text-blue-700 bg-blue-100 px-2 py-1 rounded font-medium shadow-sm border border-blue-200">
                              {allHandlers.length} handlers
                            </div>
                          )
                        ) : (
                          <div className="text-amber-700 bg-amber-100 px-2 py-1 rounded text-xs">
                            Pending assignment
                          </div>
                        )}
                      </div>
                    )}

                    {status === 'pending' && allHandlers && allHandlers.length > 0 && (
                      <div className="mt-1 text-xs text-gray-400">
                        {allHandlers.length === 1 ? (
                          <div>{allHandlers[0].name}</div>
                        ) : (
                          <div>{allHandlers.length} handlers</div>
                        )}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-1">
                      {status === 'completed' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ Completed
                        </span>
                      )}
                      {status === 'current' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          ● Current
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          ○ Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < levels.length - 1 && (
                  <div
                    className={`flex-1 h-1 -mx-2 transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      marginTop: '-2.5rem',
                      minWidth: '40px'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
