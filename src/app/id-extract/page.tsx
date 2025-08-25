"use client";
import { useState } from "react";

interface ExtractedFields {
  [key: string]: any;
}

interface Processor {
  id: string;
  name: string;
  description: string;
  documentType: string;
}

const PROCESSORS: Processor[] = [
  {
    id: "3a99d7a85b81d553",
    name: "Moroccan IDs",
    description: "Front side of Moroccan National Identity Card",
    documentType: "Moroccan ID Front"
  },
  {
    id: "57289e0cb8656e24",
    name: "moroccan id back",
    description: "Back side of Moroccan National Identity Card",
    documentType: "Moroccan ID Back"
  },
  {
    id: "66a18a389e1dc180",
    name: "moroccan_driver_front",
    description: "Front side of Moroccan Driver License",
    documentType: "Moroccan Driver License Front"
  },
  {
    id: "c48ce968f7471c21",
    name: "moroccan_driver_back",
    description: "Back side of Moroccan Driver License",
    documentType: "Moroccan Driver License Back"
  }
];

export default function IDExtractPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<Processor>(PROCESSORS[0]);
  const [fields, setFields] = useState<ExtractedFields>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setFields({});
    }
  };

  const handleProcessorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const processor = PROCESSORS.find(p => p.id === e.target.value);
    if (processor) {
      setSelectedProcessor(processor);
      setError(null);
      setSuccess(false);
      setFields({});
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedProcessor) {
      setError("Please select a file and processor");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("processorId", selectedProcessor.id);

      const res = await fetch("/api/id-extract", { 
        method: "POST", 
        body: form 
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setFields(data.fields);
        setSuccess(true);
      } else {
        setError(data.error || "Extraction failed");
      }
    } catch (err) {
      setError("An error occurred while processing the document");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      first_name: "First Name",
      last_name: "Last Name",
      date_of_birth: "Date of Birth",
      place_of_birth: "Place of Birth",
      document_id: "Document ID",
      expiry_date: "Expiry Date",
      nationality: "Nationality",
      gender: "Gender",
      address: "Address",
      issuing_authority: "Issuing Authority",
      issue_date: "Issue Date",
      fullText: "Full Text",
      confidence: "Confidence",
      documentType: "Document Type",
      pageCount: "Page Count"
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatFieldValue = (key: string, value: any): string => {
    if (key === 'confidence') {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (key === 'fullText') {
      return value.length > 100 ? `${value.substring(0, 100)}...` : value;
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🆔 Moroccan Document Extraction
          </h1>
          
          <div className="space-y-6">
            {/* Processor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document Type
              </label>
              <select
                value={selectedProcessor.id}
                onChange={handleProcessorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROCESSORS.map((processor) => (
                  <option key={processor.id} value={processor.id}>
                    {processor.documentType} - {processor.description}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Selected: <code className="bg-gray-100 px-1 rounded">{selectedProcessor.id}</code>
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {selectedProcessor.documentType}
              </label>
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

            {/* Extract Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !selectedProcessor || loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Extract ${selectedProcessor.documentType}`}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ {selectedProcessor.documentType} processed successfully! Extracted {Object.keys(fields).length} fields.
                </p>
              </div>
            )}

            {/* Extracted Fields Display */}
            {Object.keys(fields).length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Extracted Fields from {selectedProcessor.documentType}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Confidence: {fields.confidence ? `${(fields.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                    <span>Document Type: {fields.documentType || 'N/A'}</span>
                    <span>Pages: {fields.pageCount || 'N/A'}</span>
                  </div>
                </div>

                {/* Raw JSON View */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Raw JSON Data
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-64">
                      {JSON.stringify(fields, null, 2)}
                    </pre>
                  </div>
                </details>

                {/* Autofill Form */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Autofill Form
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(fields)
                      .filter(([key]) => !['fullText', 'confidence', 'documentType', 'pageCount'].includes(key))
                      .map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {getFieldLabel(key)}
                          </label>
                          <input
                            type="text"
                            value={formatFieldValue(key, value)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 How to Use
            </h3>
            <ol className="text-blue-800 list-decimal list-inside space-y-2 text-sm">
              <li>Select the document type you want to process from the dropdown</li>
              <li>Upload the corresponding side of your document</li>
              <li>Click "Extract Information" to process with AI</li>
              <li>View extracted fields and use the autofill form</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Available Processors:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                {PROCESSORS.map((processor) => (
                  <li key={processor.id}>
                    <strong>{processor.documentType}:</strong> {processor.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              🔧 Having Issues?
            </h3>
            <p className="text-yellow-800 text-sm mb-3">
              If you're getting errors, test your configuration first:
            </p>
            <a
              href="/test-docai"
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
            >
              Test Configuration
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
