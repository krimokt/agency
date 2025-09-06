"use client";
import { useState } from "react";

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🤖 AI Document Processing
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload Document
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Choose File
              </label>
              
              {file && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {file && (
            <div className="mb-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Process Document with AI"}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {fields && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Extracted Information
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Confidence: {fields.confidence ? `${(fields.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                  <span>Document Type: {fields.documentType || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={fields.firstName || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={fields.lastName || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        type="text"
                        value={fields.birthDate || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                      <input
                        type="text"
                        value={fields.birthPlace || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
                    Document Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Document ID</label>
                      <input
                        type="text"
                        value={fields.documentId || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input
                        type="text"
                        value={fields.expiryDate || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <input
                        type="text"
                        value={fields.nationality || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <input
                        type="text"
                        value={fields.gender || ""}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {fields.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={fields.address}
                    readOnly
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                  />
                </div>
              )}

              {/* Unknown Entities */}
              {fields.unknownEntities && fields.unknownEntities.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.unknownEntities.map((entity, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 capitalize">
                          {entity.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-900">{entity.text}</div>
                        <div className="text-xs text-gray-500">
                          Confidence: {(entity.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Text */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View Full Extracted Text
                </summary>
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                    {fields.fullText || "No text extracted"}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}












