'use client';

import { useState } from 'react';
import { testIndexerFunctionality } from '@/lib/indexerClient.test';

export default function TestIndexerPage() {
  const [testResult, setTestResult] = useState<{
    success: boolean;
    results?: Record<string, boolean>;
    error?: string;
    timestamp?: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      const result = await testIndexerFunctionality();
      setTestResult(result);
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Indexer Test Harness</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">SDK Compatibility Test</h2>
          <p className="text-gray-600 mb-4">
            This test verifies that the indexer client works correctly with the current SDK version.
            Run this before and after SDK changes to ensure compatibility.
          </p>
          
          <button
            onClick={runTest}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isRunning ? '🔄 Running Test...' : '🧪 Run Indexer Test'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Test Results {testResult.success ? '✅' : '❌'}
            </h3>
            
            {testResult.results && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className={`p-2 rounded ${testResult.results.apiConnection ? 'bg-green-100' : 'bg-red-100'}`}>
                    API Connection: {testResult.results.apiConnection ? '✅' : '❌'}
                  </div>
                  <div className={`p-2 rounded ${testResult.results.dataStructure ? 'bg-green-100' : 'bg-red-100'}`}>
                    Data Structure: {testResult.results.dataStructure ? '✅' : '❌'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`p-2 rounded ${testResult.results.getAllMessages ? 'bg-green-100' : 'bg-red-100'}`}>
                    Get Messages: {testResult.results.getAllMessages ? '✅' : '❌'}
                  </div>
                  <div className={`p-2 rounded ${testResult.results.getMessageCount ? 'bg-green-100' : 'bg-red-100'}`}>
                    Get Count: {testResult.results.getMessageCount ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            )}
            
            {testResult.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {testResult.error}
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              Test completed at: {testResult.timestamp}
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-medium">Raw Test Result</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}