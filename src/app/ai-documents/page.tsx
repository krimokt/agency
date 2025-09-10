"use client";
import { useState } from "react";
import Button from "@/components/ui/button/Button";

interface ExtractedFields {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  documentId?: string;
  expiryDate?: string;
  nationality?: string;
  gender?: string;
  address?: string;
  fullText?: string;
  confidence?: number;
  documentType?: string;
  unknownEntities?: Array<{
    type: string;
    text: string;
    confidence: number;
  }>;
  rawResult?: any;
}

export default function AIDocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<ExtractedFields | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setFields(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/document-ai", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        setFields(data.fields);
      } else {
        setError(data.error || "Document processing failed");
      }
    } catch (err) {
      setError("An error occurred while processing the document");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Processing</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Upload and extract information from documents</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Document</h2>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            
            {!file ? (
              <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="primary">Choose File</Button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="primary"
                  >
                    {loading ? "Processing..." : "Process"}
                  </Button>
                  <Button
                    onClick={() => {
                      setFile(null);
                      setFields(null);
                      setError(null);
                    }}
                    variant="outline"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {fields && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Extracted Information</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Confidence: {fields.confidence ? `${(fields.confidence * 100).toFixed(1)}%` : 'N/A'} • 
                Type: {fields.documentType || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: "First Name", value: fields.firstName },
                { label: "Last Name", value: fields.lastName },
                { label: "Date of Birth", value: fields.birthDate },
                { label: "Place of Birth", value: fields.birthPlace },
                { label: "Gender", value: fields.gender },
                { label: "Nationality", value: fields.nationality },
                { label: "Document ID", value: fields.documentId },
                { label: "Expiry Date", value: fields.expiryDate }
              ].map((field, index) => (
                field.value && (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
                    <span className="text-sm text-gray-900 dark:text-white">{field.value}</span>
                  </div>
                )
              ))}
              
              {fields.address && (
                <div className="md:col-span-2 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</div>
                  <div className="text-sm text-gray-900 dark:text-white">{fields.address}</div>
                </div>
              )}
            </div>

            {fields.unknownEntities && fields.unknownEntities.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {fields.unknownEntities.map((entity, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{entity.type.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-gray-900 dark:text-white">{entity.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}















