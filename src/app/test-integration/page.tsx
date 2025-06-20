'use client';

import { useState } from 'react';
import HighwayBillboard from '@/components/Highway/HighwayBillboard';
import { testIndexerFunctionality } from '@/lib/indexerClient.test';

export default function TestIntegrationPage() {
  const [indexerStatus, setIndexerStatus] = useState<string>('Not tested');

  const runQuickTest = async () => {
    setIndexerStatus('Testing...');
    try {
      const result = await testIndexerFunctionality();
      setIndexerStatus(result.success ? '✅ Indexer Working' : '❌ Indexer Failed');
    } catch (error) {
      setIndexerStatus('❌ Test Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
      {/* Quick Test Header */}
      <div className="relative z-20 p-4 bg-black/20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-white font-bold">🧪 Integration Test - Beautiful UI + Wallet</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={runQuickTest}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
            >
              🔄 Test Indexer
            </button>
            <span className="text-white text-sm">{indexerStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Highway Billboard Component */}
      <HighwayBillboard />
      
      {/* Integration Test Instructions */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🧪 Integration Test Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-300">Gas Gauge Tests:</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Shows "Connect wallet to check fuel" when disconnected</li>
                <li>• Displays real APT balance when connected</li>
                <li>• Shows fuel gauge bar with color coding</li>
                <li>• Indicates payment method (⛽ free vs 💰 paid)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-300">Gas Station Tests:</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Shows gas station building when disconnected</li>
                <li>• Offers pump choice (Petra vs Social)</li>
                <li>• Connects wallets successfully</li>
                <li>• Posts messages with correct payment method</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-300">Transaction Tests:</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Petra users get FREE gas station sponsorship</li>
                <li>• Social users pay normal transaction fees</li>
                <li>• Messages appear immediately after posting</li>
                <li>• Success/error states display properly</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-300">UI Integration:</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Highway theme maintained throughout</li>
                <li>• Real-time message updates work</li>
                <li>• Featured billboard shows latest message</li>
                <li>• Mile markers display all messages</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <h4 className="font-semibold text-blue-200 mb-2">🎯 Success Criteria:</h4>
            <p className="text-blue-100 text-sm">
              If you can connect a wallet, see your real balance in the gas gauge, post a message 
              (with appropriate payment method), and see it appear immediately in the highway - 
              then Phase 2 integration is <strong>COMPLETE</strong>! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}