"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

export interface DocumentInfo {
  name: string;
  key: string;
  urlKey: string;
  issueDateKey?: string;
  expiryDateKey?: string;
  icon?: React.ReactNode;
  description?: string;
  required?: boolean;
}

export interface DocumentData {
  [key: string]: {
    url?: string | null;
    issueDate?: string | null;
    expiryDate?: string | null;
  };
}

interface DocumentManagerProps {
  documents: DocumentInfo[];
  data: DocumentData;
  onUpdate: (documentKey: string, field: string, value: string | null) => Promise<void>;
  onUpload: (documentKey: string, file: File) => Promise<void>;
  onGenerateQR?: (documentKey: string) => Promise<void>;
  onView?: (url: string) => void;
  className?: string;
  showUploadButtons?: boolean;
  showQRButtons?: boolean;
  showDateInputs?: boolean;
  compact?: boolean;
}

export default function DocumentManager({
  documents,
  data,
  onUpdate,
  onUpload,
  onGenerateQR,
  onView,
  className = "",
  showUploadButtons = true,
  showQRButtons = true,
  showDateInputs = true,
  compact = false
}: DocumentManagerProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [updatingFields, setUpdatingFields] = useState<Set<string>>(new Set());

  const handleFileUpload = async (documentKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFiles(prev => new Set(prev).add(documentKey));
    try {
      await onUpload(documentKey, file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentKey);
        return newSet;
      });
    }
  };

  const handleDateChange = async (documentKey: string, field: string, value: string) => {
    const fieldKey = `${documentKey}_${field}`;
    setUpdatingFields(prev => new Set(prev).add(fieldKey));
    try {
      await onUpdate(documentKey, field, value || null);
    } catch (error) {
      console.error('Date update error:', error);
    } finally {
      setUpdatingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldKey);
        return newSet;
      });
    }
  };

  const getDocumentStatus = (doc: DocumentInfo) => {
    const docData = data[doc.key];
    if (!docData?.url) return { status: 'missing', color: 'error', text: 'Missing' };

    if (doc.expiryDateKey && docData.expiryDate) {
      const expiryDate = new Date(docData.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        return { status: 'expired', color: 'error', text: 'Expired' };
      } else if (daysUntilExpiry <= 30) {
        return { status: 'expiring', color: 'warning', text: `Expires in ${daysUntilExpiry} days` };
      }
    }

    return { status: 'valid', color: 'success', text: 'Valid' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'expiring':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      case 'valid':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      case 'expiring':
        return 'text-orange-600 dark:text-orange-400';
      case 'valid':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {documents.map((doc) => {
          const docData = data[doc.key];
          const status = getDocumentStatus(doc);
          
          return (
            <div key={doc.key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {doc.icon && <div className="w-8 h-8 flex items-center justify-center">{doc.icon}</div>}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                  {doc.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{doc.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(status.status)}
                <span className={cn("text-sm font-medium", getStatusColor(status.status))}>
                  {status.text}
                </span>
                
                {docData?.url && onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(docData.url!)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    View
                  </Button>
                )}
                
                {showQRButtons && onGenerateQR && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateQR(doc.key)}
                    className={cn(
                      "text-xs",
                      status.status === 'expired' ? "text-red-600 border-red-300 hover:bg-red-50" :
                      status.status === 'expiring' ? "text-orange-600 border-orange-300 hover:bg-orange-50" :
                      "text-green-600 border-green-300 hover:bg-green-50"
                    )}
                  >
                    {status.status === 'expired' ? 'Re-upload' : 
                     status.status === 'expiring' ? 'Update' : 'Replace'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {documents.map((doc) => {
        const docData = data[doc.key];
        const status = getDocumentStatus(doc);
        const isUploading = uploadingFiles.has(doc.key);
        
        return (
          <div key={doc.key} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {doc.icon && <div className="w-8 h-8 flex items-center justify-center">{doc.icon}</div>}
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                  {doc.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(status.status)}
                <span className={cn("text-sm font-medium", getStatusColor(status.status))}>
                  {status.text}
                </span>
                
                {docData?.url && onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(docData.url!)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    View
                  </Button>
                )}
                
                {showQRButtons && onGenerateQR && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateQR(doc.key)}
                    className={cn(
                      "text-xs",
                      status.status === 'expired' ? "text-red-600 border-red-300 hover:bg-red-50" :
                      status.status === 'expiring' ? "text-orange-600 border-orange-300 hover:bg-orange-50" :
                      "text-green-600 border-green-300 hover:bg-green-50"
                    )}
                  >
                    {status.status === 'expired' ? 'Re-upload' : 
                     status.status === 'expiring' ? 'Update' : 'Replace'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              {/* File Upload */}
              {showUploadButtons && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {docData?.url ? 'Replace File' : 'Upload File'}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(doc.key, e)}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {isUploading && (
                    <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                  )}
                  {docData?.url && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current document will be replaced with the new file
                    </p>
                  )}
                </div>
              )}
              
              {/* Issue Date */}
              {showDateInputs && doc.issueDateKey && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={docData?.issueDate || ''}
                    onChange={(e) => handleDateChange(doc.key, 'issueDate', e.target.value)}
                    disabled={updatingFields.has(`${doc.key}_issueDate`)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                  {updatingFields.has(`${doc.key}_issueDate`) && (
                    <p className="text-xs text-blue-600 mt-1">Updating...</p>
                  )}
                </div>
              )}
              
              {/* Expiry Date */}
              {showDateInputs && doc.expiryDateKey && (
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={docData?.expiryDate || ''}
                    onChange={(e) => handleDateChange(doc.key, 'expiryDate', e.target.value)}
                    disabled={updatingFields.has(`${doc.key}_expiryDate`)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  />
                  {updatingFields.has(`${doc.key}_expiryDate`) && (
                    <p className="text-xs text-blue-600 mt-1">Updating...</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Expiry Warning */}
            {doc.expiryDateKey && docData?.url && docData.expiryDate && (() => {
              const expiryDate = new Date(docData.expiryDate);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry < 0) {
                return (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Document Expired</h4>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          This document expired {Math.abs(daysUntilExpiry)} days ago. Please upload a new version immediately.
                        </p>
                      </div>
                      {showQRButtons && onGenerateQR && (
                        <Button
                          size="sm"
                          onClick={() => onGenerateQR(doc.key)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                        >
                          Re-upload Now
                        </Button>
                      )}
                    </div>
                  </div>
                );
              } else if (daysUntilExpiry <= 30) {
                return (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5">⚠️</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">Expires Soon</h4>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          This document expires in {daysUntilExpiry} days. Consider updating it soon.
                        </p>
                      </div>
                      {showQRButtons && onGenerateQR && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onGenerateQR(doc.key)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs px-3 py-1"
                        >
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      })}
    </div>
  );
}
