"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

const CarUploadContent: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    if (!token) return;
    const tick = () => checkStatus();
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [token]);

  const checkStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/mobile-upload-car/status?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.success) {
        setStatus(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to check status');
      }
    } catch (e) {
      setError('Failed to check status');
    }
  };

  const handleUpload = async (documentType: string, file?: File | null) => {
    if (!token || !file) return;
    setUploading(prev => ({ ...prev, [documentType]: true }));
    try {
      const form = new FormData();
      form.append('token', token);
      form.append('documentType', documentType);
      form.append('file', file);
      const res = await fetch('/api/mobile-upload-car', { method: 'POST', body: form });
      const data = await res.json();
      if (!data.success) setError(data.error || 'Upload failed');
      await checkStatus();
    } catch (e) {
      setError('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h1>
            <p className="text-gray-600">This QR code is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Car Documents Upload</h1>
          <p className="text-sm text-gray-600 mt-1">Upload required car documents</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {status && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-sm font-medium text-gray-900">{status.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${status.documents?.carteGrise ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Carte Grise {status.documents?.carteGrise ? '✓' : ''}</div>
              <div className={`p-2 rounded ${status.documents?.insurance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Insurance {status.documents?.insurance ? '✓' : ''}</div>
              <div className={`p-2 rounded ${status.documents?.inspection ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Technical Inspection {status.documents?.inspection ? '✓' : ''}</div>
              <div className={`p-2 rounded ${status.documents?.rentalAgreement ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Rental Agreement {status.documents?.rentalAgreement ? '✓' : ''}</div>
            </div>
          </div>
        )}

        {status?.status !== 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select files from your device and click "Upload Now" for each document. 
              Required documents are marked with <span className="text-red-500">*</span>.
            </p>

            <div className="space-y-4">
              {[
                { key: 'carte_grise', label: 'Carte Grise', accept: 'image/*', required: true },
                { key: 'insurance', label: 'Insurance', accept: 'image/*', required: true },
                { key: 'inspection', label: 'Technical Inspection', accept: 'image/*', required: true },
                { key: 'rental_agreement', label: 'Rental Agreement (optional)', accept: 'image/*,application/pdf', required: false },
                { key: 'other', label: 'Other Documents (optional)', accept: 'image/*,application/pdf', required: false },
              ].map(({ key, label, accept, required }) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {status?.documents?.[key === 'inspection' ? 'inspection' : key] && (
                      <span className="text-green-600 text-sm">✓ Uploaded</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="file" 
                      accept={accept} 
                      className="hidden" 
                      id={`file-${key}`}
                      disabled={uploading[key]}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFiles(prev => ({ ...prev, [key]: file }));
                        }
                      }}
                    />
                    
                    <label 
                      htmlFor={`file-${key}`}
                      className={`flex-1 px-3 py-2 text-sm border rounded-md cursor-pointer transition-colors ${
                        uploading[key] 
                          ? 'border-blue-300 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {uploading[key] ? `Uploading...` : `Choose File`}
                    </label>
                    
                    <button
                      onClick={() => {
                        const file = selectedFiles[key];
                        if (file) {
                          handleUpload(key, file);
                        } else {
                          alert('Please select a file first');
                        }
                      }}
                      disabled={uploading[key] || !selectedFiles[key]}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        uploading[key] || !selectedFiles[key]
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Upload Now
                    </button>
                  </div>
                  
                  {selectedFiles[key] && (
                    <p className="mt-2 text-xs text-gray-600">
                      Selected: {selectedFiles[key].name} ({(selectedFiles[key].size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status?.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">✓</div>
              <div className="text-green-700 text-sm">
                <strong>Upload Complete!</strong> All required documents have been uploaded successfully.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 text-red-700 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};

const CarUploadPage: React.FC = () => (
  <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div></div>}>
    <CarUploadContent />
  </Suspense>
);

export default CarUploadPage;


