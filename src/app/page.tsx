"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🇲🇦 Moroccan Document AI System
          </h1>
          <p className="text-xl text-gray-600">
            Complete AI-powered processing for Moroccan IDs and Driver Licenses
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Moroccan Document Extraction Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🆔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Moroccan Document Extraction
              </h2>
              <p className="text-gray-600 mb-6">
                Process both sides of Moroccan CIN and driver licenses using 4 specialized Custom Extractor processors.
              </p>
              <Link
                href="/id-extract"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Extract Documents
              </Link>
            </div>
          </div>

          {/* AI Documents Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                General AI Document Processing
              </h2>
              <p className="text-gray-600 mb-6">
                Process any document type with AI. Supports invoices, contracts, receipts, and more with automatic field detection.
              </p>
              <Link
                href="/ai-documents"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Process Documents
              </Link>
            </div>
          </div>
        </div>

        {/* Test Configuration Card */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Test Configuration
            </h2>
            <p className="text-gray-600 mb-6">
              Having issues? Test your Google Cloud Document AI configuration to identify and fix problems.
            </p>
            <Link
              href="/test-docai"
              className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Test Configuration
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚀 Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">4 Custom Extractor processors</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">Moroccan CIN front & back</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">Moroccan driver license front & back</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">90%+ accuracy with Custom Extractors</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">Multi-language support (Arabic, French, English)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3 text-xl">✅</span>
                <span className="text-gray-700">Enterprise security standards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🛠️ Setup Required
          </h3>
          <p className="text-blue-800 mb-3">
            To use the Moroccan document processing, you need to set up Google Cloud Document AI:
          </p>
          <ol className="text-blue-800 list-decimal list-inside space-y-1 text-sm">
            <li>✅ Create a Google Cloud project (Project ID: 423581069301)</li>
            <li>✅ Enable Document AI API</li>
            <li>✅ Create 4 Custom Extractor processors</li>
            <li>Download service account key</li>
            <li>Set environment variables</li>
          </ol>
          <div className="mt-4 space-x-4">
            <Link
              href="/ENVIRONMENT_SETUP.md"
              className="inline-block text-blue-600 hover:text-blue-800 underline"
            >
              View setup guide →
            </Link>
            <Link
              href="/test-docai"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Test Configuration
            </Link>
            <Link
              href="/id-extract"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Try Document Extraction
            </Link>
          </div>
        </div>

        {/* Processor Status */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🎯 Your Processors Status
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Moroccan National Identity Card</h4>
              <div className="space-y-1 text-green-700">
                <div>• Front: <code className="bg-green-100 px-1 rounded">3a99d7a85b81d553</code> ✅</div>
                <div>• Back: <code className="bg-green-100 px-1 rounded">57289e0cb8656e24</code> ✅</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Moroccan Driver License</h4>
              <div className="space-y-1 text-green-700">
                <div>• Front: <code className="bg-green-100 px-1 rounded">66a18a389e1dc180</code> ✅</div>
                <div>• Back: <code className="bg-green-100 px-1 rounded">c48ce968f7471c21</code> ✅</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 