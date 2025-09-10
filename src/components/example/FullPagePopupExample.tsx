'use client';

import React, { useState } from 'react';
import FullPagePopup, { DocumentCard } from '@/components/common/FullPagePopup';

const FullPagePopupExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState({
    carteGrise: { file: null as File | null, startDate: '', endDate: '' },
    insurance: { file: null as File | null, startDate: '', endDate: '' },
    technicalInspection: { file: null as File | null, startDate: '', endDate: '' },
    rentalAgreement: { file: null as File | null, startDate: '', endDate: '' },
  });

  const handleFileChange = (documentType: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: { ...prev[documentType], file }
    }));
  };

  const handleDateChange = (documentType: keyof typeof documents, field: 'startDate' | 'endDate', value: string) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: { ...prev[documentType], [field]: value }
    }));
  };

  const handleUpload = () => {
    console.log('Documents to upload:', documents);
    // Implement your upload logic here
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          FullPagePopup Example
        </h1>
        
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Open Upload Documents Popup
        </button>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Selected Documents:
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(documents).map(([key, doc]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {doc.file ? doc.file.name : 'No file selected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FullPagePopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upload Car Documents"
      >
        <div className="space-y-6">
          {/* Car Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Toyota Camry</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">License Plate: 321-خ-123</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                    Maintenance
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                    2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentCard
              title="Carte Grise"
              subtitle="Vehicle Registration"
              color="blue"
              onFileChange={(file) => handleFileChange('carteGrise', file)}
              startDate={documents.carteGrise.startDate}
              endDate={documents.carteGrise.endDate}
              onStartDateChange={(date) => handleDateChange('carteGrise', 'startDate', date)}
              onEndDateChange={(date) => handleDateChange('carteGrise', 'endDate', date)}
            />
            <DocumentCard
              title="Insurance"
              subtitle="Insurance Policy"
              color="green"
              onFileChange={(file) => handleFileChange('insurance', file)}
              startDate={documents.insurance.startDate}
              endDate={documents.insurance.endDate}
              onStartDateChange={(date) => handleDateChange('insurance', 'startDate', date)}
              onEndDateChange={(date) => handleDateChange('insurance', 'endDate', date)}
            />
            <DocumentCard
              title="Technical Inspection"
              subtitle="Safety Certificate"
              color="yellow"
              onFileChange={(file) => handleFileChange('technicalInspection', file)}
              startDate={documents.technicalInspection.startDate}
              endDate={documents.technicalInspection.endDate}
              onStartDateChange={(date) => handleDateChange('technicalInspection', 'startDate', date)}
              onEndDateChange={(date) => handleDateChange('technicalInspection', 'endDate', date)}
            />
            <DocumentCard
              title="Rental Agreement"
              subtitle="Contract Document"
              color="purple"
              onFileChange={(file) => handleFileChange('rentalAgreement', file)}
              startDate={documents.rentalAgreement.startDate}
              endDate={documents.rentalAgreement.endDate}
              onStartDateChange={(date) => handleDateChange('rentalAgreement', 'startDate', date)}
              onEndDateChange={(date) => handleDateChange('rentalAgreement', 'endDate', date)}
            />
          </div>
        </div>
      </FullPagePopup>
    </div>
  );
};

export default FullPagePopupExample;




