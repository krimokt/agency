"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';

interface QRCodeGeneratorProps {
  clientId: string;
  clientName?: string;
  onClose?: () => void;
}

interface QRCodeData {
  qrTokenId: string;
  qrCodeDataUrl: string;
  uploadUrl: string;
  expiresAt: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  clientId,
  clientName,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      if (data.success) {
        setQrCodeData(data);
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      setError('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUploadUrl = () => {
    if (qrCodeData?.uploadUrl) {
      navigator.clipboard.writeText(qrCodeData.uploadUrl);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData?.qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeData.qrCodeDataUrl;
      link.download = `qr-code-${clientId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Generate QR Code
        </h2>
        {clientName && (
          <p className="text-gray-600">For client: {clientName}</p>
        )}
      </div>

      {!qrCodeData ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-500 text-2xl mr-3">ℹ️</div>
              <div>
                <p className="text-blue-800 font-medium">How it works</p>
                <p className="text-blue-600 text-sm">
                  Generate a QR code that clients can scan to upload their ID and driving license documents.
                  The QR code expires after 4 minutes.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <img
              src={qrCodeData.qrCodeDataUrl}
              alt="QR Code"
              className="mx-auto border rounded-lg"
              style={{ width: '200px', height: '200px' }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Expires at:</span>
              <span className="text-gray-900">
                {new Date(qrCodeData.expiresAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Time remaining:</span>
              <span className="text-gray-900">
                {Math.max(0, Math.floor((new Date(qrCodeData.expiresAt).getTime() - Date.now()) / 1000 / 60))} minutes
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={copyUploadUrl}
              variant="outline"
              className="w-full"
            >
              📋 Copy Upload URL
            </Button>

            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="w-full"
            >
              📥 Download QR Code
            </Button>

            <Button
              onClick={() => {
                setQrCodeData(null);
                setError(null);
              }}
              variant="outline"
              className="w-full"
            >
              🔄 Generate New QR Code
            </Button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-500 text-2xl mr-3">✅</div>
              <div>
                <p className="text-green-800 font-medium">QR Code Generated!</p>
                <p className="text-green-600 text-sm">
                  Share this QR code with the client. They can scan it to upload their documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {onClose && (
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator; 