"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface UploadStatus {
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  uploadStatus: string;
  processingStatus: string;
  documents: {
    idFront: boolean;
    idBack: boolean;
    licenseFront: boolean;
    licenseBack: boolean;
  };
  parsedData: any;
  completedAt?: string;
  // Document URLs for display
  idFrontUrl?: string;
  idBackUrl?: string;
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
}

const MobileUploadContent: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      checkStatus();
      // Poll for status updates every 2 seconds
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const checkStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/mobile-upload/status?token=${encodeURIComponent(token)}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data);
        setError(null);
      } else {
        setError(data.error || 'Failed to check status');
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Failed to check status');
    }
  };

  const handleDirectUpload = async (documentType: string, file: File | undefined | null) => {
    if (!token || !file) return;

    setIsLoading(true);
    setUploadingDocument(documentType);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await fetch('/api/mobile-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Check status after upload
        await checkStatus();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed');
    } finally {
      setIsLoading(false);
      setUploadingDocument(null);
      // no-op
    }
  };


  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid QR Code</h1>
            <p className="text-gray-600">This QR code is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Document Upload</h1>
          <p className="text-sm text-gray-600 mt-1">Please upload your ID and driving license</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Status Indicator */}
        {status && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`text-sm font-medium ${
                status.status === 'completed' ? 'text-green-600' :
                status.status === 'failed' ? 'text-red-600' :
                status.status === 'processing' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className={`h-2 rounded-full transition-all duration-300 ${
                status.status === 'completed' ? 'bg-green-500 w-full' :
                status.status === 'failed' ? 'bg-red-500 w-full' :
                status.status === 'processing' ? 'bg-blue-500 w-3/4' :
                status.status === 'uploading' ? 'bg-yellow-500 w-1/2' :
                'bg-gray-300 w-0'
              }`}></div>
            </div>

            {/* Document Progress */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${status.documents.idFront ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                ID Front {status.documents.idFront ? '✓' : '○'}
              </div>
              <div className={`p-2 rounded ${status.documents.idBack ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                ID Back {status.documents.idBack ? '✓' : '○'}
              </div>
              <div className={`p-2 rounded ${status.documents.licenseFront ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                License Front {status.documents.licenseFront ? '✓' : '○'}
              </div>
              <div className={`p-2 rounded ${status.documents.licenseBack ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                License Back {status.documents.licenseBack ? '✓' : '○'}
              </div>
            </div>
          </div>
        )}

        {/* Upload Tiles (single place) */}
        {status?.status !== 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
            
            {/* Guidance: require both ID and License */}
            <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 text-sm">
              Please upload both: Front and Back of ID card, then Front and Back of Driving License.
              Processing starts after all four images are uploaded.
            </div>

            {/* ID Card Documents */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-gray-900">ID Card Documents</h3>
              <label className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors block cursor-pointer ${
                status?.documents.idFront
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : isLoading && uploadingDocument === 'id_front'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}>
                {status?.documents.idFront ? '✓ ID Front (Uploaded)' : isLoading && uploadingDocument === 'id_front' ? '📤 Uploading ID Front...' : '📷 Upload ID Front'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isLoading || status?.documents.idFront}
                  onChange={(e) => handleDirectUpload('id_front', e.target.files?.[0])}
                />
              </label>

              <label className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors block cursor-pointer ${
                status?.documents.idBack
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : isLoading && uploadingDocument === 'id_back'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}>
                {status?.documents.idBack ? '✓ ID Back (Uploaded)' : isLoading && uploadingDocument === 'id_back' ? '📤 Uploading ID Back...' : '📷 Upload ID Back'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isLoading || status?.documents.idBack}
                  onChange={(e) => handleDirectUpload('id_back', e.target.files?.[0])}
                />
              </label>
            </div>

            {/* Driving License Documents */}
            <div className="space-y-3 mt-6">
              <h3 className="text-md font-semibold text-gray-900">Driving License Documents</h3>
              <label className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors block cursor-pointer ${
                status?.documents.licenseFront
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : isLoading && uploadingDocument === 'license_front'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}>
                {status?.documents.licenseFront ? '✓ License Front (Uploaded)' : isLoading && uploadingDocument === 'license_front' ? '📤 Uploading License Front...' : '📷 Upload License Front'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isLoading || status?.documents.licenseFront}
                  onChange={(e) => handleDirectUpload('license_front', e.target.files?.[0])}
                />
              </label>

              <label className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors block cursor-pointer ${
                status?.documents.licenseBack
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : isLoading && uploadingDocument === 'license_back'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}>
                {status?.documents.licenseBack ? '✓ License Back (Uploaded)' : isLoading && uploadingDocument === 'license_back' ? '📤 Uploading License Back...' : '📷 Upload License Back'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isLoading || status?.documents.licenseBack}
                  onChange={(e) => handleDirectUpload('license_back', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        )}

        {/* Document Preview Section */}
        {status && (status.documents.idFront || status.documents.idBack || status.documents.licenseFront || status.documents.licenseBack) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {status.documents.idFront && status.idFrontUrl && (
                <div className="text-center">
                  <img 
                    alt="ID Front" 
                    className="w-16 h-12 object-cover rounded mx-auto" 
                    src={status.idFrontUrl}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">ID Front</p>
                </div>
              )}
              
              {status.documents.idBack && status.idBackUrl && (
                <div className="text-center">
                  <img 
                    alt="ID Back" 
                    className="w-16 h-12 object-cover rounded mx-auto" 
                    src={status.idBackUrl}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">ID Back</p>
                </div>
              )}
              
              {status.documents.licenseFront && status.licenseFrontUrl && (
                <div className="text-center">
                  <img 
                    alt="License Front" 
                    className="w-16 h-12 object-cover rounded mx-auto" 
                    src={status.licenseFrontUrl}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">License Front</p>
                </div>
              )}
              
              {status.documents.licenseBack && status.licenseBackUrl && (
                <div className="text-center">
                  <img 
                    alt="License Back" 
                    className="w-16 h-12 object-cover rounded mx-auto" 
                    src={status.licenseBackUrl}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">License Back</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {status?.status === 'completed' && status.parsedData && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h2>
            
            <div className="space-y-3">
              {status.parsedData.fullName && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{status.parsedData.fullName}</p>
                </div>
              )}
              
              {status.parsedData.firstName && (
                <div>
                  <span className="text-sm font-medium text-gray-700">First Name:</span>
                  <p className="text-gray-900">{status.parsedData.firstName}</p>
                </div>
              )}
              
              {status.parsedData.lastName && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Last Name:</span>
                  <p className="text-gray-900">{status.parsedData.lastName}</p>
                </div>
              )}
              
              {status.parsedData.dateOfBirth && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-900">{status.parsedData.dateOfBirth}</p>
                </div>
              )}
              
              {status.parsedData.address && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900">{status.parsedData.address}</p>
                </div>
              )}
              
              {status.parsedData.licenseNumber && (
                <div>
                  <span className="text-sm font-medium text-gray-700">License Number:</span>
                  <p className="text-gray-900">{status.parsedData.licenseNumber}</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-500 text-2xl mr-3">✓</div>
                <div>
                  <p className="text-green-800 font-medium">Documents processed successfully!</p>
                  <p className="text-green-600 text-sm">Your information has been extracted and saved.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <div className="text-red-500 text-2xl mr-3">❌</div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MobileUploadPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MobileUploadContent />
    </Suspense>
  );
};

export default MobileUploadPage; 