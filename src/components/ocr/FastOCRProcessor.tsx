'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ProcessingResult {
  success: boolean;
  data?: {
    documentType: string;
    side: string;
    fields: Record<string, any>;
    confidence: number;
    processingTime: number;
  };
  error?: string;
  processingTime: number;
  requestId: string;
}

interface FastOCRProcessorProps {
  onFieldsExtracted?: (fields: Record<string, any>) => void;
  onProcessingComplete?: (result: ProcessingResult) => void;
}

export default function FastOCRProcessor({ 
  onFieldsExtracted, 
  onProcessingComplete 
}: FastOCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setProcessingStage('Uploading document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'auto'); // Auto-detect
      formData.append('side', 'auto'); // Auto-detect

      setProcessingStage('Detecting document type...');

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      const result: ProcessingResult = await response.json();

      if (result.success && result.data) {
        setProcessingStage('Extracting fields...');
        
        console.log('🎉 OCR Processing completed:', {
          documentType: result.data.documentType,
          side: result.data.side,
          confidence: `${(result.data.confidence * 100).toFixed(1)}%`,
          processingTime: `${result.data.processingTime}ms`,
          fieldsCount: Object.keys(result.data.fields).length
        });

        // Call callbacks
        if (onFieldsExtracted) {
          onFieldsExtracted(result.data.fields);
        }
        if (onProcessingComplete) {
          onProcessingComplete(result);
        }

        setProcessingStage('Complete!');
      } else {
        console.error('❌ OCR Processing failed:', result.error);
        setProcessingStage('Processing failed');
      }

      setResult(result);

    } catch (error) {
      console.error('❌ OCR Request failed:', error);
      const errorResult: ProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: 0,
        requestId: 'error'
      };
      setResult(errorResult);
      setProcessingStage('Request failed');
    } finally {
      setIsProcessing(false);
    }
  }, [onFieldsExtracted, onProcessingComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processDocument(acceptedFiles[0]);
    }
  }, [processDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-gray-700">Processing Document...</p>
              <p className="text-sm text-gray-500">{processingStage}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📄</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your document here' : 'Upload Moroccan ID or Driver License'}
              </p>
              <p className="text-sm text-gray-500">
                Supports: CIN Front/Back, Driver License Front/Back
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Auto-detects document type • Fast processing • High accuracy
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Processing Result */}
      {result && (
        <div className="mt-6 p-4 rounded-lg border">
          {result.success ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">✅</span>
                <h3 className="text-lg font-semibold text-green-700">Processing Successful</h3>
              </div>
              
              {result.data && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Document Type:</span>
                    <span className="ml-2 capitalize">{result.data.documentType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium">Side:</span>
                    <span className="ml-2 capitalize">{result.data.side}</span>
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span>
                    <span className="ml-2">{(result.data.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Processing Time:</span>
                    <span className="ml-2">{result.data.processingTime}ms</span>
                  </div>
                </div>
              )}

              {result.data?.fields && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Extracted Fields:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    {Object.entries(result.data.fields)
                      .filter(([key]) => !['fullText', 'rawEntities', 'documentType', 'side'].includes(key))
                      .slice(0, 8) // Show first 8 fields
                      .map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium w-32 text-gray-600">{key}:</span>
                          <span className="text-gray-800">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-xl">❌</span>
                <h3 className="text-lg font-semibold text-red-700">Processing Failed</h3>
              </div>
              <p className="text-red-600">{result.error}</p>
              <p className="text-sm text-gray-500">
                Please try again with a clearer image or different document.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800">CIN (National ID)</h4>
          <p className="text-blue-600">Front: Name, Photo, Birth Date</p>
          <p className="text-blue-600">Back: Address, Issue Date</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800">Driver License</h4>
          <p className="text-green-600">Front: License Number, Categories</p>
          <p className="text-green-600">Back: Restrictions, Codes</p>
        </div>
      </div>
    </div>
  );
}