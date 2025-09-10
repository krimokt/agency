"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import DocumentManager from './DocumentManager';

export interface CarDocumentSummary {
  carId: string;
  brand: string;
  model: string;
  plateNumber: string;
  status: string;
  documents: {
    [key: string]: {
      url?: string | null;
      issueDate?: string | null;
      expiryDate?: string | null;
    };
  };
}

interface DocumentDashboardProps {
  cars: CarDocumentSummary[];
  onUpdateDocument: (carId: string, documentKey: string, field: string, value: string | null) => Promise<void>;
  onUploadDocument: (carId: string, documentKey: string, file: File) => Promise<void>;
  onGenerateQR: (carId: string, documentKey: string) => Promise<void>;
  onViewDocument: (url: string) => void;
  className?: string;
}

interface DocumentType {
  key: string;
  name: string;
  required: boolean;
  icon: React.ReactNode;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'carte_grise',
    name: 'Carte Grise',
    required: true,
    icon: (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: 'insurance',
    name: 'Insurance',
    required: true,
    icon: (
      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: 'technical_inspection',
    name: 'Technical Inspection',
    required: true,
    icon: (
      <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    key: 'rental_agreement',
    name: 'Rental Agreement',
    required: false,
    icon: (
      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  },
  {
    key: 'other_documents',
    name: 'Other Documents',
    required: false,
    icon: (
      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
];

export default function DocumentDashboard({
  cars,
  onUpdateDocument,
  onUploadDocument,
  onGenerateQR,
  onViewDocument,
  className = ""
}: DocumentDashboardProps) {
  const [selectedCar, setSelectedCar] = useState<CarDocumentSummary | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDocument, setFilterDocument] = useState<string>('');
  const [sortBy, setSortBy] = useState<'plate' | 'brand' | 'status'>('plate');

  // Calculate document statistics
  const getDocumentStats = () => {
    const stats = {
      totalCars: cars.length,
      totalDocuments: 0,
      uploadedDocuments: 0,
      expiredDocuments: 0,
      expiringSoonDocuments: 0,
      missingRequiredDocuments: 0
    };

    cars.forEach(car => {
      DOCUMENT_TYPES.forEach(docType => {
        stats.totalDocuments++;
        const docData = car.documents[docType.key];
        
        if (docData?.url) {
          stats.uploadedDocuments++;
          
          if (docType.key !== 'other_documents' && docData.expiryDate) {
            const expiryDate = new Date(docData.expiryDate);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              stats.expiredDocuments++;
            } else if (daysUntilExpiry <= 30) {
              stats.expiringSoonDocuments++;
            }
          }
        } else if (docType.required) {
          stats.missingRequiredDocuments++;
        }
      });
    });

    return stats;
  };

  const getDocumentStatus = (car: CarDocumentSummary, docType: DocumentType) => {
    const docData = car.documents[docType.key];
    if (!docData?.url) return { status: 'missing', color: 'error', text: 'Missing' };

    if (docType.key !== 'other_documents' && docData.expiryDate) {
      const expiryDate = new Date(docData.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        return { status: 'expired', color: 'error', text: 'Expired' };
      } else if (daysUntilExpiry <= 30) {
        return { status: 'expiring', color: 'warning', text: `${daysUntilExpiry} days` };
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

  const filteredCars = cars.filter(car => {
    if (filterStatus && car.status !== filterStatus) return false;
    if (filterDocument) {
      const docData = car.documents[filterDocument];
      if (!docData?.url) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'brand':
        return a.brand.localeCompare(b.brand);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return a.plateNumber.localeCompare(b.plateNumber);
    }
  });

  const stats = getDocumentStats();

  const handleCarClick = (car: CarDocumentSummary) => {
    setSelectedCar(car);
    setIsDetailModalOpen(true);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Management Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage vehicle documents across your fleet
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cars</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalCars}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploaded Documents</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats.uploadedDocuments}/{stats.totalDocuments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired Documents</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.expiredDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.expiringSoonDocuments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Document
            </label>
            <select 
              value={filterDocument}
              onChange={(e) => setFilterDocument(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Documents</option>
              {DOCUMENT_TYPES.map(docType => (
                <option key={docType.key} value={docType.key}>{docType.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort by
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'plate' | 'brand' | 'status')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="plate">Plate Number</option>
              <option value="brand">Brand</option>
              <option value="status">Status</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('');
                setFilterDocument('');
                setSortBy('plate');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Cars List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                {DOCUMENT_TYPES.map(docType => (
                  <th key={docType.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {docType.name}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCars.map((car) => (
                <tr key={car.carId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {car.brand} {car.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {car.plateNumber}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge
                      size="sm"
                      color={car.status === 'Available' ? 'success' : car.status === 'Booked' ? 'primary' : 'warning'}
                    >
                      {car.status}
                    </Badge>
                  </td>
                  
                  {DOCUMENT_TYPES.map(docType => {
                    const docStatus = getDocumentStatus(car, docType);
                    return (
                      <td key={docType.key} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(docStatus.status)}
                          <span className={cn("text-sm font-medium", getStatusColor(docStatus.status))}>
                            {docStatus.text}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCarClick(car)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Car Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="max-w-4xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Document Management - {selectedCar?.brand} {selectedCar?.model}
          </h2>
          
          {selectedCar && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedCar.brand} {selectedCar.model}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {selectedCar.plateNumber}
                  </p>
                </div>
                <Badge
                  size="sm"
                  color={selectedCar.status === 'Available' ? 'success' : selectedCar.status === 'Booked' ? 'primary' : 'warning'}
                >
                  {selectedCar.status}
                </Badge>
              </div>

              <DocumentManager
                documents={DOCUMENT_TYPES.map(docType => ({
                  name: docType.name,
                  key: docType.key,
                  urlKey: `${docType.key}_url`,
                  issueDateKey: docType.key === 'rental_agreement' ? 'rental_agreement_start_date' : `${docType.key}_issue_date`,
                  expiryDateKey: docType.key === 'rental_agreement' ? 'rental_agreement_end_date' : `${docType.key}_expiry_date`,
                  icon: docType.icon,
                  required: docType.required
                }))}
                data={selectedCar.documents}
                onUpdate={(documentKey, field, value) => 
                  onUpdateDocument(selectedCar.carId, documentKey, field, value)
                }
                onUpload={(documentKey, file) => 
                  onUploadDocument(selectedCar.carId, documentKey, file)
                }
                onGenerateQR={(documentKey) => 
                  onGenerateQR(selectedCar.carId, documentKey)
                }
                onView={onViewDocument}
                showUploadButtons={true}
                showQRButtons={true}
                showDateInputs={true}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
