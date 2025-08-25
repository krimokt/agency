'use client';

import React, { useState } from 'react';
import FastOCRProcessor from '@/components/ocr/FastOCRProcessor';

interface ExtractedData {
  [key: string]: any;
}

export default function FastOCRPage() {
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);

  const handleFieldsExtracted = (fields: Record<string, any>) => {
    console.log('📋 Fields extracted:', fields);
    setExtractedData(fields);
  };

  const handleProcessingComplete = (result: any) => {
    console.log('🎉 Processing complete:', result);
    setProcessingHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fast OCR Processing
          </h1>
          <p className="text-gray-600">
            Upload any Moroccan document for instant field extraction
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              🆔 CIN Front/Back
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              🚗 Driver License Front/Back
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              🤖 Auto-Detection
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              ⚡ Fast Processing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <FastOCRProcessor
              onFieldsExtracted={handleFieldsExtracted}
              onProcessingComplete={handleProcessingComplete}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Extracted Fields */}
            {Object.keys(extractedData).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Extracted Information
                </h2>
                
                <div className="space-y-4">
                  {/* Personal Information */}
                  {(extractedData.firstName || extractedData.lastName || extractedData.fullName) && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Personal Information</h3>
                      <div className="bg-gray-50 p-3 rounded space-y-2">
                        {extractedData.firstName && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">First Name:</span>
                            <span className="font-medium">{extractedData.firstName}</span>
                          </div>
                        )}
                        {extractedData.lastName && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">Last Name:</span>
                            <span className="font-medium">{extractedData.lastName}</span>
                          </div>
                        )}
                        {extractedData.fullName && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">Full Name:</span>
                            <span className="font-medium">{extractedData.fullName}</span>
                          </div>
                        )}
                        {extractedData.dateOfBirth && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">Birth Date:</span>
                            <span className="font-medium">{extractedData.dateOfBirth}</span>
                          </div>
                        )}
                        {extractedData.placeOfBirth && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">Birth Place:</span>
                            <span className="font-medium">{extractedData.placeOfBirth}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Information */}
                  {(extractedData.cinNumber || extractedData.licenseNumber || extractedData.idNumber) && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Document Information</h3>
                      <div className="bg-gray-50 p-3 rounded space-y-2">
                        {extractedData.cinNumber && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">CIN Number:</span>
                            <span className="font-medium">{extractedData.cinNumber}</span>
                          </div>
                        )}
                        {extractedData.licenseNumber && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">License:</span>
                            <span className="font-medium">{extractedData.licenseNumber}</span>
                          </div>
                        )}
                        {extractedData.expiryDate && (
                          <div className="flex">
                            <span className="w-24 text-gray-600">Expiry:</span>
                            <span className="font-medium">{extractedData.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Address Information */}
                  {extractedData.address && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Address</h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="font-medium">{extractedData.address}</span>
                      </div>
                    </div>
                  )}

                  {/* All Fields (Debug) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      View All Extracted Fields ({Object.keys(extractedData).length})
                    </summary>
                    <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                      <pre>{JSON.stringify(extractedData, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Processing History */}
            {processingHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Processing History
                </h2>
                
                <div className="space-y-3">
                  {processingHistory.map((result, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                            {result.success ? '✅' : '❌'}
                          </span>
                          {result.success && result.data && (
                            <span className="font-medium">
                              {result.data.documentType.replace('_', ' ')} ({result.data.side})
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          {result.processingTime}ms
                        </span>
                      </div>
                      
                      {result.success && result.data && (
                        <div className="mt-1 text-gray-600">
                          Confidence: {(result.data.confidence * 100).toFixed(1)}% • 
                          Fields: {Object.keys(result.data.fields).length}
                        </div>
                      )}
                      
                      {!result.success && (
                        <div className="mt-1 text-red-600">
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📤</div>
              <h3 className="font-medium mb-1">1. Upload</h3>
              <p className="text-sm text-gray-600">
                Drag & drop or click to upload your Moroccan document
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-medium mb-1">2. Auto-Detect</h3>
              <p className="text-sm text-gray-600">
                AI automatically identifies document type and side
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-medium mb-1">3. Process</h3>
              <p className="text-sm text-gray-600">
                Fast OCR extraction with optimized processors
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-medium mb-1">4. Extract</h3>
              <p className="text-sm text-gray-600">
                Get structured data ready for your forms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}