"use client";

import React, { useMemo, useState } from 'react';
import Button from '@/components/ui/button/Button';
import { v4 as uuidv4 } from 'uuid';

interface CarQRCodeGeneratorProps {
  carId: string;
  carLabel?: string;
  onClose?: () => void;
  onTokenGenerated?: (tokenId: string) => void;
}

interface QRCodeData {
  qrTokenId: string;
  qrCodeDataUrl: string;
  uploadUrl: string;
  expiresAt: string;
}

const CarQRCodeGenerator: React.FC<CarQRCodeGeneratorProps> = ({ carId, carLabel, onClose, onTokenGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidUuid = (value?: string) => {
    if (!value) return false;
    return /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(value);
  };

  const effectiveCarId = useMemo(() => (isValidUuid(carId) ? carId : uuidv4()), [carId]);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/qr/generate-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: effectiveCarId }),
      });
      const data = await response.json();
      if (data.success) {
        setQrCodeData(data);
        // Extract JWT token from uploadUrl for polling
        const url = new URL(data.uploadUrl);
        const jwtToken = url.searchParams.get('token');
        // Call the callback with the JWT token
        if (onTokenGenerated && jwtToken) {
          onTokenGenerated(jwtToken);
        }
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (e) {
      setError('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUploadUrl = () => {
    if (qrCodeData?.uploadUrl) navigator.clipboard.writeText(qrCodeData.uploadUrl);
  };

  const downloadQRCode = () => {
    if (!qrCodeData?.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeData.qrCodeDataUrl;
    link.download = `car-qr-${effectiveCarId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="text-left mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mobile Upload via QR</h3>
        {carLabel && <p className="text-sm text-gray-600 dark:text-gray-300">For: {carLabel}</p>}
        {!isValidUuid(carId) && (
          <p className="text-xs text-gray-500 mt-1">Generated Car ID: {effectiveCarId}</p>
        )}
      </div>

      {!qrCodeData ? (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm text-blue-800 dark:text-blue-200">
            Generate a QR code that staff can scan on a phone to upload car documents directly.
          </div>

          <Button onClick={generateQRCode} disabled={isGenerating} className="w-full">
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <img src={qrCodeData.qrCodeDataUrl} alt="QR Code" className="mx-auto border rounded-lg" style={{ width: '200px', height: '200px' }} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Expires at:</span>
              <span className="text-gray-900 dark:text-white">{new Date(qrCodeData.expiresAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button onClick={copyUploadUrl} variant="outline">Copy URL</Button>
            <Button onClick={downloadQRCode} variant="outline">Download</Button>
            <Button onClick={() => { setQrCodeData(null); setError(null); }} variant="outline">New QR</Button>
          </div>

          {onClose && (
            <div className="pt-2">
              <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarQRCodeGenerator;


