"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import QRCodeGenerator from './QRCodeGenerator';

interface QRIntegrationExampleProps {
  clientId: string;
  clientName?: string;
}

const QRIntegrationExample: React.FC<QRIntegrationExampleProps> = ({
  clientId,
  clientName
}) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsQRModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📱 Generate QR Code
      </button>

      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      >
        <QRCodeGenerator
          clientId={clientId}
          clientName={clientName}
          onClose={() => setIsQRModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default QRIntegrationExample; 