"use client";

import React from 'react';

const UploadSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h1>
          <p className="text-gray-600">
            All documents have been uploaded successfully. The upload process is now complete.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            ✓ Your documents have been processed and are now available in the system.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            You can now close this page or scan another QR code if needed.
          </p>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSuccessPage;