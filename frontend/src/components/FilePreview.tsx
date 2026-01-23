'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { fileAPI } from '@/lib/api';

interface FilePreviewProps {
  file: any;
  onClose: () => void;
  onDownload: () => void;
}

export default function FilePreview({ file, onClose, onDownload }: FilePreviewProps) {
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const currentVersion = file.versions?.find(
    (v: any) => v.versionNumber === file.currentVersion
  );

  useEffect(() => {
    const loadFilePreview = async () => {
      const fileName = currentVersion?.fileName?.toLowerCase() || '';
      const fileType = currentVersion?.fileType || '';
      
      // Check if it's a CSV or Excel file
      const isCSV = fileType === 'text/csv' || fileName.endsWith('.csv');
      const isExcel = fileType.includes('spreadsheet') || 
                      fileType.includes('excel') ||
                      fileName.endsWith('.xlsx') || 
                      fileName.endsWith('.xls');
      
      if (isCSV || isExcel) {
        setLoading(true);
        setError(null);
        
        try {
          const response = await fileAPI.downloadFile(file._id);
          
          if (isCSV) {
            // Parse CSV file
            const blob = new Blob([response.data]);
            const text = await blob.text();
            
            Papa.parse(text, {
              complete: (results) => {
                if (results.data && results.data.length > 0) {
                  // Filter out empty rows
                  const filteredData = results.data.filter((row: any) => 
                    row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
                  );
                  
                  if (filteredData.length > 0) {
                    setPreviewData(filteredData as string[][]);
                  } else {
                    setError('No data found in file');
                  }
                } else {
                  setError('No data found in file');
                }
                setLoading(false);
              },
              error: (error) => {
                setError(`Error parsing CSV: ${error.message}`);
                setLoading(false);
              }
            });
          } else if (isExcel) {
            // Parse Excel file
            const arrayBuffer = await response.data.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to array of arrays
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData && jsonData.length > 0) {
              // Filter out empty rows
              const filteredData = jsonData.filter((row: any) => 
                row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
              );
              
              if (filteredData.length > 0) {
                setPreviewData(filteredData as string[][]);
              } else {
                setError('No data found in Excel file');
              }
            } else {
              setError('No data found in Excel file');
            }
            setLoading(false);
          }
        } catch (error) {
          console.error('Error loading file:', error);
          setError('Failed to load file for preview');
          setLoading(false);
        }
      }
    };

    loadFilePreview();
  }, [file, currentVersion]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullScreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white ${isFullScreen ? 'w-full h-full' : 'rounded-lg max-w-6xl w-full max-h-[90vh]'} overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0 bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{file.title}</h2>
            <p className="text-sm text-gray-500 truncate">{currentVersion?.fileName}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onDownload}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Download to Edit"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto ${isFullScreen ? 'flex-1' : 'max-h-[calc(90vh-120px)]'}`}>
          {/* File Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{currentVersion?.fileType}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium">
                  {(currentVersion?.fileSize / 1024).toFixed(2)} KB
                </span>
              </div>
              <div>
                <span className="text-gray-500">Version:</span>
                <span className="ml-2 font-medium">{file.currentVersion}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
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
              {file.channel && (
                <div>
                  <span className="text-gray-500">Channel:</span>
                  <span className="ml-2 font-medium">{file.channel}</span>
                </div>
              )}
              {file.demandType && (
                <div>
                  <span className="text-gray-500">Demand Type:</span>
                  <span className="ml-2 font-medium">{file.demandType}</span>
                </div>
              )}
              {file.month && (
                <div>
                  <span className="text-gray-500">Month:</span>
                  <span className="ml-2 font-medium">{file.month}</span>
                </div>
              )}
              {file.year && (
                <div>
                  <span className="text-gray-500">Year:</span>
                  <span className="ml-2 font-medium">{file.year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {file.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{file.description}</p>
            </div>
          )}

          {/* Version History */}
          {file.versions && file.versions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Version History</h3>
              <div className="space-y-2">
                {file.versions.map((version: any) => (
                  <div
                    key={version.versionNumber}
                    className="bg-gray-50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Version {version.versionNumber}</span>
                      <span className="text-gray-500">
                        {new Date(version.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <p>Uploaded by: {version.uploadedBy?.name}</p>
                      <p>Signature: {version.signature}</p>
                      {version.comments && <p>Comments: {version.comments}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Preview - For CSV and Excel files */}
          {(currentVersion?.fileType === 'text/csv' || 
            currentVersion?.fileType?.includes('spreadsheet') || 
            currentVersion?.fileType?.includes('excel') ||
            currentVersion?.fileName?.toLowerCase().endsWith('.csv') ||
            currentVersion?.fileName?.toLowerCase().endsWith('.xlsx') ||
            currentVersion?.fileName?.toLowerCase().endsWith('.xls')) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  File Preview
                  {!showAllRows && previewData && previewData.length > 101 && (
                    <span className="text-xs text-amber-600 font-normal bg-amber-50 px-2 py-1 rounded">
                      Showing first 100 rows
                    </span>
                  )}
                  {showAllRows && (
                    <span className="text-xs text-green-600 font-normal bg-green-50 px-2 py-1 rounded">
                      Showing all {previewData ? previewData.length - 1 : 0} rows
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {previewData && previewData.length > 101 && (
                    <button
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                      {showAllRows ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Show First 100
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          Show All Rows
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={onDownload}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download to Edit
                  </button>
                </div>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Loading preview...</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Click the "Download to Edit" button to view the file in Excel.
                  </p>
                </div>
              )}

              {previewData && previewData.length > 0 && !loading && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className={`overflow-x-auto overflow-y-auto ${isFullScreen ? 'max-h-[calc(100vh-250px)]' : 'max-h-[500px]'}`}>
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b-2 border-r border-gray-300 bg-gray-100 sticky left-0 z-20">
                            #
                          </th>
                          {previewData[0].map((header, index) => (
                            <th
                              key={index}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300 whitespace-nowrap bg-gray-50"
                            >
                              {header || `Column ${index + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(1, showAllRows ? undefined : 101).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-center text-xs text-gray-500 border-r border-gray-200 bg-gray-50 sticky left-0 z-10 font-medium">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-4 py-2 text-gray-900 border-r border-gray-200 whitespace-nowrap"
                              >
                                {cell !== null && cell !== undefined ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 text-xs border-t">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium">
                          📊 Total: {previewData.length - 1} rows × {previewData[0].length} columns
                        </span>
                        {!showAllRows && previewData.length > 101 && (
                          <span className="text-amber-600">
                            Showing first 100 rows
                          </span>
                        )}
                        {showAllRows && (
                          <span className="text-green-600 font-medium">
                            ✓ All rows displayed
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500">
                        💡 Use {isFullScreen ? 'Exit Full Screen' : 'Full Screen'} for better view
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* For PDF files, show preview note */}
          {currentVersion?.fileType === 'application/pdf' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>PDF Preview:</strong> Download the file to view the PDF document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
