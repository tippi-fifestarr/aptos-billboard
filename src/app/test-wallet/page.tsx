'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getGasStationStatus, processMessageTransaction } from '@/services/gasStation';
import { WalletStatus, GasStationTransaction } from '@/types';
// No need for specific transaction types - we'll use flexible casting

export default function TestWalletPage() {
  const {
    connectWallet,
    disconnectWallet,
    status,
    balance,
    fuelPercentage,
    walletType,
    error,
    addressString,
    isGasStationAvailable,
    paymentInfo,
    refreshBalance,
    signTransaction,
  } = useWallet();

  const [gasStationStatus] = useState(() => getGasStationStatus());
  
  // Transaction testing state
  const [testMessage, setTestMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    transactionHash: string;
    walletType: string | null;
    sponsored: boolean;
    confirmedTransaction?: unknown;
  } | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const handleConnect = (type: 'petra' | 'social') => {
    connectWallet(type);
  };

  const handlePostTestMessage = async () => {
    if (!testMessage.trim()) {
      setTransactionError('Please enter a test message');
      return;
    }

    if (status !== WalletStatus.CONNECTED || !addressString) {
      setTransactionError('Wallet not connected');
      return;
    }

    setIsPosting(true);
    setTransactionError(null);
    setTransactionResult(null);

    try {
      const transactionData: GasStationTransaction = {
        sender: addressString,
        content: testMessage,
        useGasStation: isGasStationAvailable, // Use gas station for Petra, normal for social
        walletType: walletType,
      };

      console.log(`🧪 Testing transaction with ${walletType} wallet (${isGasStationAvailable ? 'sponsored' : 'user-paid'})`);

      // Create a wrapper function to match the expected signature
      const signTransactionWrapper = async (transaction: { transactionOrPayload: unknown }) => {
        const result = await signTransaction({
          transactionOrPayload: transaction.transactionOrPayload as never,
        });
        return {
          authenticator: result.authenticator,
        };
      };

      const result = await processMessageTransaction(transactionData, signTransactionWrapper);
      
      setTransactionResult(result);
      setTestMessage(''); // Clear form on success
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshBalance();
      }, 2000);

      console.log('✅ Test transaction successful:', result);

    } catch (error) {
      console.error('❌ Test transaction failed:', error);
      setTransactionError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Wallet Integration Test</h1>
        
        {/* Gas Station Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⛽ Gas Station Status</h2>
          <div className={`p-4 rounded ${gasStationStatus.available ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={gasStationStatus.available ? 'text-green-800' : 'text-red-800'}>
              {gasStationStatus.message}
            </p>
            <p className="text-sm mt-2">
              API Key Configured: {gasStationStatus.apiKeyConfigured ? '✅' : '❌'}
            </p>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Wallet Connection</h2>
          
          {status === WalletStatus.DISCONNECTED && (
            <div className="space-y-4">
              <p className="text-gray-600">Choose your wallet connection method:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleConnect('petra')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  🦊 Connect Petra Wallet
                </button>
                <button
                  onClick={() => handleConnect('social')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                  🔗 Continue with Google
                </button>
              </div>
            </div>
          )}

          {status === WalletStatus.CONNECTING && (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🔄</div>
              <p>Connecting wallet...</p>
            </div>
          )}

          {status === WalletStatus.CONNECTED && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold">Wallet Type</h3>
                  <p>{walletType === 'petra' ? '🦊 Petra Wallet' : '🔗 Social Login'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-sm font-mono">{addressString?.substring(0, 20)}...</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold">Balance</h3>
                  <p>{balance.toFixed(4)} APT</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold">Fuel Level</h3>
                  <p>{fuelPercentage.toFixed(1)}%</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className={`p-4 rounded border-2`} style={{ borderColor: paymentInfo.color }}>
                <h3 className="font-semibold flex items-center gap-2">
                  {paymentInfo.icon} Payment Method
                </h3>
                <p style={{ color: paymentInfo.color }}>{paymentInfo.description}</p>
                <p className="text-sm mt-1">
                  Gas Station Available: {isGasStationAvailable ? '✅' : '❌'}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={refreshBalance}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  🔄 Refresh Balance
                </button>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  🛑 Disconnect
                </button>
              </div>
            </div>
          )}

          {status === WalletStatus.ERROR && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p><strong>Error:</strong> {error}</p>
              <button
                onClick={() => handleConnect('petra')}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>

        {/* Visual Fuel Gauge */}
        {status === WalletStatus.CONNECTED && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">⛽ Fuel Gauge Visualization</h2>
            <div className="relative w-full h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-400">
              <div 
                className="h-full transition-all duration-500 ease-in-out"
                style={{ 
                  width: `${fuelPercentage}%`,
                  backgroundColor: fuelPercentage < 25 ? '#FF0000' : fuelPercentage < 75 ? '#FFCC00' : '#00CC00'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
                {balance.toFixed(2)} APT ({fuelPercentage.toFixed(1)}%)
              </div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>E</span>
              <span>F</span>
            </div>
          </div>
        )}

        {/* Transaction Testing */}
        {status === WalletStatus.CONNECTED && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🧪 Transaction Testing</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <input
                  id="testMessage"
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message to post..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  disabled={isPosting}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {testMessage.length}/100 characters
                </div>
              </div>

              <div className={`p-4 rounded border-2`} style={{ borderColor: paymentInfo.color }}>
                <h3 className="font-semibold mb-2">Transaction Method</h3>
                <p className="text-sm">
                  <strong>Wallet:</strong> {walletType === 'petra' ? '🦊 Petra' : '🔗 Social Login'}<br/>
                  <strong>Payment:</strong> <span style={{ color: paymentInfo.color }}>{paymentInfo.description}</span><br/>
                  <strong>Gas Station:</strong> {isGasStationAvailable ? '✅ Available' : '❌ Not Available'}
                </p>
              </div>

              <button
                onClick={handlePostTestMessage}
                disabled={isPosting || !testMessage.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isGasStationAvailable ? 'Posting via Gas Station...' : 'Posting (User Pays Gas)...'}
                  </>
                ) : (
                  <>
                    🚗 Post Test Message {isGasStationAvailable ? '(FREE GAS)' : '(YOU PAY GAS)'}
                  </>
                )}
              </button>

              {transactionError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>Error:</strong> {transactionError}
                </div>
              )}

              {transactionResult && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  <h4 className="font-semibold mb-2">✅ Transaction Successful!</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Hash:</strong> <code className="bg-white px-1 rounded">{transactionResult.transactionHash}</code></p>
                    <p><strong>Wallet:</strong> {transactionResult.walletType}</p>
                    <p><strong>Sponsored:</strong> {transactionResult.sponsored ? '✅ Yes (Gas Station)' : '❌ No (User Paid)'}</p>
                    <p className="text-xs mt-2 text-green-600">
                      💡 Check the indexer test page or main highway to see your message appear!
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                <h4 className="font-semibold mb-1">🧪 Test Instructions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Petra Wallet:</strong> Should use gas station (free transaction)</li>
                  <li><strong>Social Login:</strong> Should use normal transaction (you pay gas)</li>
                  <li>After posting, check <code>/test-indexer</code> to see real-time message updates</li>
                  <li>Verify your message appears in the main highway UI</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}