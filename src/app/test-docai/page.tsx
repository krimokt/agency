"use client";
import { useState } from "react";

export default function TestDocAIPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testConfiguration = async () => {
    setLoading(true);
    setTestResult("Testing configuration...");
    
    try {
      const response = await fetch("/api/test-config");
      const data = await response.json();
      
      if (data.ok) {
        setTestResult(`✅ Configuration test passed!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Configuration test failed:\n\n${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error testing configuration:\n\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testProcessor = async () => {
    setLoading(true);
    setTestResult("Testing processor connection...");
    
    try {
      const response = await fetch("/api/test-processor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processorId: "your-processor-id-here"
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setTestResult(`✅ Processor test passed!\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Processor test failed:\n\n${data.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error testing processor:\n\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔧 Document AI Configuration Test
          </h1>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={testConfiguration}
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Test Configuration
              </button>
              
              <button
                onClick={testProcessor}
                disabled={loading}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Test Processor Connection
              </button>
            </div>

            {testResult && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Test Results:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                    {testResult}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 Troubleshooting Steps
              </h3>
              <ol className="text-blue-800 list-decimal list-inside space-y-2 text-sm">
                <li>Check your <code>.env.local</code> file has all required variables</li>
                <li>Ensure your service account key file exists in the <code>keys/</code> folder</li>
                <li>Verify your Google Cloud project has Document AI API enabled</li>
                <li>Check your service account has the correct permissions</li>
                <li>Ensure your processor ID is correct and active</li>
              </ol>
            </div>

            <div className="mt-6 bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                ⚠️ Required Environment Variables
              </h3>
              <div className="text-yellow-800 text-sm space-y-1">
                <div><code>GCP_PROJECT_ID</code> - Your Google Cloud project ID</div>
                <div><code>GCP_LOCATION</code> - Your processor location (e.g., "us")</div>
                <div><code>GCP_KEY_FILE</code> - Path to your service account key file</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








