"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DocumentDashboard from '@/components/common/DocumentDashboard';
import { Button } from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';

interface CarInfo {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  status: string;
  // Document URLs
  carte_grise_url?: string | null;
  insurance_url?: string | null;
  technical_inspection_url?: string | null;
  rental_agreement_url?: string | null;
  other_documents_url?: string | null;
  // Document dates
  carte_grise_issue_date?: string | null;
  carte_grise_expiry_date?: string | null;
  insurance_issue_date?: string | null;
  insurance_expiry_date?: string | null;
  technical_inspection_issue_date?: string | null;
  technical_inspection_expiry_date?: string | null;
  rental_agreement_start_date?: string | null;
  rental_agreement_end_date?: string | null;
}

export default function DocumentManagementPage() {
  const router = useRouter();
  const [cars, setCars] = useState<CarInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    url: string;
    documentType: string;
    carInfo: CarInfo;
    qrCodeDataUrl?: string;
  } | null>(null);

  // Fetch cars from Supabase
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('add_new_car')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleUpdateDocument = async (carId: string, documentKey: string, field: string, value: string | null) => {
    try {
      const updateField = field === 'issueDate' 
        ? (documentKey === 'rental_agreement' ? 'rental_agreement_start_date' : `${documentKey}_issue_date`)
        : (documentKey === 'rental_agreement' ? 'rental_agreement_end_date' : `${documentKey}_expiry_date`);

      const response = await fetch('/api/cars/update-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          documents: {
            [updateField]: value
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the cars list
        await fetchCars();
      } else {
        throw new Error(result.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const handleUploadDocument = async (carId: string, documentKey: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('carId', carId);
      formData.append('documentType', documentKey);

      const response = await fetch('/api/cars/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the cars list
        await fetchCars();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleGenerateQR = async (carId: string, documentType: string) => {
    try {
      const response = await fetch('/api/qr/generate-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          documentType,
          action: 'reupload'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const uploadUrl = result.uploadUrl;
        const carInfo = cars.find(car => car.id === carId);
        
        if (carInfo) {
          setQrCodeData({
            url: uploadUrl,
            documentType,
            carInfo,
            qrCodeDataUrl: result.qrCodeDataUrl
          });
          setIsQRModalOpen(true);
        }
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      throw error;
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  // Convert cars data to the format expected by DocumentDashboard
  const carDocumentSummaries = cars.map(car => ({
    carId: car.id,
    brand: car.brand,
    model: car.model,
    plateNumber: car.plate_number,
    status: car.status,
    documents: {
      carte_grise: {
        url: car.carte_grise_url,
        issueDate: car.carte_grise_issue_date,
        expiryDate: car.carte_grise_expiry_date
      },
      insurance: {
        url: car.insurance_url,
        issueDate: car.insurance_issue_date,
        expiryDate: car.insurance_expiry_date
      },
      technical_inspection: {
        url: car.technical_inspection_url,
        issueDate: car.technical_inspection_issue_date,
        expiryDate: car.technical_inspection_expiry_date
      },
      rental_agreement: {
        url: car.rental_agreement_url,
        issueDate: car.rental_agreement_start_date,
        expiryDate: car.rental_agreement_end_date
      },
      other_documents: {
        url: car.other_documents_url
      }
    }
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading document management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error Loading Documents</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button
                onClick={fetchCars}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive document management for your vehicle fleet
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/cars')}
            >
              Back to Cars
            </Button>
            <Button
              onClick={fetchCars}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Document Dashboard */}
      <DocumentDashboard
        cars={carDocumentSummaries}
        onUpdateDocument={handleUpdateDocument}
        onUploadDocument={handleUploadDocument}
        onGenerateQR={handleGenerateQR}
        onViewDocument={handleViewDocument}
      />

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} className="max-w-md">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            QR Code for Document Upload
          </h2>
          
          {qrCodeData && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {qrCodeData.carInfo.brand} {qrCodeData.carInfo.model}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {qrCodeData.carInfo.plate_number}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Document: {qrCodeData.documentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 inline-block">
                <div className="w-60 h-60 flex items-center justify-center bg-white">
                  {qrCodeData.qrCodeDataUrl ? (
                    <img
                      src={qrCodeData.qrCodeDataUrl}
                      alt="QR Code"
                      width="240"
                      height="240"
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-500">
                      Loading QR Code...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your phone to upload or replace the document
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeData.url).then(() => {
                        alert('Upload URL copied to clipboard!');
                      });
                    }}
                    className="flex-1 text-xs"
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(qrCodeData.url, '_blank')}
                    className="flex-1 text-xs"
                  >
                    Open Link
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  📱 <strong>Instructions:</strong> Open your phone's camera app and point it at the QR code. 
                  Tap the notification that appears to open the upload page.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsQRModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
