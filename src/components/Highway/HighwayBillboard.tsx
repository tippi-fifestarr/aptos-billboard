// src/components/Highway/HighwayBillboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAllMessages, formatTimestamp, shortenAddress } from '@/lib/billboardService';
import { useWallet } from '@/hooks/useWallet';
import { WalletStatus, GasStationTransaction } from '@/types';
import { HIGHWAY_COLORS } from '@/utils/constants';
import Footer from '@/components/Footer';

interface Message {
  content: string;
  author: string;
  timestamp: string;
}

export default function HighwayBillboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMessage, setFeaturedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const allMessages = await getAllMessages();
      setMessages(allMessages);
      
      // Set the most recent message as featured
      if (allMessages.length > 0) {
        setFeaturedMessage(allMessages[allMessages.length - 1]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingHighway />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Highway Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 w-full h-32 bg-gray-800"></div>
        <div className="absolute bottom-16 w-full h-1 bg-yellow-300"></div>
        <div className="absolute bottom-8 w-full h-1 bg-white"></div>
        
        {/* Road dashes */}
        <div className="absolute bottom-12 w-full flex justify-center space-x-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-12 h-1 bg-yellow-300 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🛣️</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Highway Billboard</h1>
              <p className="text-blue-200">Drive the blockchain highway</p>
            </div>
          </div>
          
          {/* Gas Gauge */}
          <GasGauge />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Featured Billboard */}
        {featuredMessage && (
          <FeaturedBillboard message={featuredMessage} />
        )}

        {/* Drive-by Messages */}
        <div className="mt-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-2xl">🚗</div>
            <h2 className="text-2xl font-bold text-white">Keep Driving</h2>
            <div className="text-sm text-blue-200">
              {messages.length} billboards on this highway
            </div>
          </div>
          
          <DriveByMessages messages={messages} />
        </div>

        {/* Post New Billboard */}
        <div className="mt-12">
          <PostBillboardSection onMessagePosted={loadMessages} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Featured Billboard Component
function FeaturedBillboard({ message }: { message: Message }) {
  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className="text-yellow-300 text-lg font-semibold">⭐ FEATURED BILLBOARD ⭐</div>
      </div>
      
      <div className="bg-yellow-400 text-black p-8 rounded-lg shadow-2xl border-8 border-yellow-500 relative">
        {/* Billboard posts */}
        <div className="absolute -top-4 left-4 w-4 h-8 bg-gray-600"></div>
        <div className="absolute -top-4 right-4 w-4 h-8 bg-gray-600"></div>
        
        <div className="text-center">
          <div className="text-3xl font-black mb-4 text-gray-900">
            {message.content}
          </div>
          
          <div className="text-sm text-gray-700 flex justify-between items-center">
            <span>📍 {shortenAddress(message.author)}</span>
            <span>🕒 {formatTimestamp(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Drive-by Messages Component
function DriveByMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={`${message.author}-${message.timestamp}`}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 flex items-center space-x-4"
        >
          <div className="text-2xl">📍</div>
          <div className="flex-1">
            <div className="text-white font-semibold mb-1">
              Mile {messages.length - index}: {message.content}
            </div>
            <div className="text-blue-200 text-sm flex space-x-4">
              <span>👤 {shortenAddress(message.author)}</span>
              <span>🕒 {formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-center py-12 text-blue-200">
          <div className="text-4xl mb-4">🛣️</div>
          <p>No billboards on this highway yet.</p>
          <p>Be the first to post a message!</p>
        </div>
      )}
    </div>
  );
}

// Enhanced Gas Gauge Component with Connect Button
function GasGauge() {
  const { status, balance, fuelPercentage, paymentInfo, connectWallet, disconnectWallet } = useWallet();
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  // Determine gauge color based on fuel level
  const getGaugeColor = () => {
    if (fuelPercentage < 25) return HIGHWAY_COLORS.gasGaugeEmpty;
    if (fuelPercentage < 75) return HIGHWAY_COLORS.gasGaugeHalf;
    return HIGHWAY_COLORS.gasGaugeFull;
  };

  const handleConnect = (walletType: 'petra' | 'social') => {
    setShowWalletOptions(false);
    connectWallet(walletType);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-[240px]">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">⛽</div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm flex items-center gap-2">
            Gas Tank
            {status === WalletStatus.CONNECTED && (
              <span className="text-xs" style={{ color: paymentInfo.color }}>
                {paymentInfo.icon}
              </span>
            )}
          </div>
          
          {status === WalletStatus.CONNECTED ? (
            <div className="mt-2">
              {/* Fuel gauge bar */}
              <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${fuelPercentage}%`,
                    backgroundColor: getGaugeColor()
                  }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-300">E</span>
                <span className="text-blue-200">{balance.toFixed(2)} APT</span>
                <span className="text-gray-300">F</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="mt-2 w-full bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
              >
                🛑 Disconnect
              </button>
            </div>
          ) : status === WalletStatus.CONNECTING ? (
            <div className="mt-2 text-center">
              <div className="text-xs text-blue-200 mb-2">Starting engine...</div>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <div className="mt-2">
              {!showWalletOptions ? (
                <button
                  onClick={() => setShowWalletOptions(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold py-2 px-3 rounded transition-colors"
                >
                  🔗 Connect Wallet
                </button>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => handleConnect('petra')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                  >
                    🦊 Petra (Free Gas)
                  </button>
                  <button
                    onClick={() => handleConnect('social')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                  >
                    🔗 Google (Pay Gas)
                  </button>
                  <button
                    onClick={() => setShowWalletOptions(false)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Gas Station Section with Full Wallet Integration
function PostBillboardSection({ onMessagePosted }: { onMessagePosted: () => void }) {
  const {
    status,
    connectWallet,
    disconnectWallet,
    addressString,
    isGasStationAvailable,
    paymentInfo,
    signTransaction,
    error
  } = useWallet();
  
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const handleConnect = (walletType: 'petra' | 'social') => {
    setShowWalletOptions(false);
    connectWallet(walletType);
  };

  const handlePostMessage = async () => {
    if (!message.trim()) {
      setPostError('Please enter a message for your billboard');
      return;
    }

    if (status !== WalletStatus.CONNECTED || !addressString) {
      setPostError('Please connect your wallet first');
      return;
    }

    setIsPosting(true);
    setPostError(null);

    try {
      const { processMessageTransaction } = await import('@/services/gasStation');

      const transactionData: GasStationTransaction = {
        sender: addressString,
        content: message,
        useGasStation: isGasStationAvailable,
        walletType: isGasStationAvailable ? 'petra' : 'social',
      };

      // Create wrapper for transaction signing
      const signTransactionWrapper = async (transaction: { transactionOrPayload: unknown }) => {
        const result = await signTransaction({
          transactionOrPayload: transaction.transactionOrPayload as never,
        });
        return { authenticator: result.authenticator };
      };

      await processMessageTransaction(transactionData, signTransactionWrapper);
      
      // Success!
      setMessage('');
      setShowSuccess(true);
      
      // Auto-refresh messages after successful posting
      setTimeout(() => {
        onMessagePosted(); // Refresh the messages
      }, 1000); // Wait 1 second for blockchain confirmation
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.error('Failed to post message:', error);
      setPostError(error instanceof Error ? error.message : 'Failed to post message');
    } finally {
      setIsPosting(false);
    }
  };

  // Wallet not connected - show gas station entrance
  if (status === WalletStatus.DISCONNECTED) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="text-center">
          {/* Enhanced Gas Station Building */}
          <div className="relative mb-6">
            <div className="text-6xl mb-2 animate-pulse">⛽</div>
            <div className="w-full h-3 bg-gray-700 rounded shadow-inner"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 rounded-t-lg border-2 border-b-0 flex items-center justify-center shadow-lg"
                 style={{ backgroundColor: HIGHWAY_COLORS.signOrange, borderColor: HIGHWAY_COLORS.signBlack }}>
              <span className="text-xs font-bold text-white">GAS</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">🛣️ Highway Rest Stop</h3>
          <p className="text-blue-200 mb-4">
            Connect your wallet to post a billboard message
          </p>
          
          {!showWalletOptions ? (
            <button
              className="text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: HIGHWAY_COLORS.billboardYellow }}
              onClick={() => setShowWalletOptions(true)}
            >
              🚗 Pull Into Station
            </button>
          ) : (
            <div className="space-y-3">
              <p className="font-medium mb-3" style={{ color: HIGHWAY_COLORS.billboardYellow }}>Choose Your Pump:</p>
              
              <button
                onClick={() => handleConnect('petra')}
                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-3"
                style={{ backgroundColor: HIGHWAY_COLORS.signBlue }}
              >
                <span className="text-xl">🦊</span>
                <div className="text-left">
                  <div>Full Service - Petra Wallet</div>
                  <div className="text-xs opacity-90">⛽ Free gas courtesy of station</div>
                </div>
              </button>
              
              <button
                onClick={() => handleConnect('social')}
                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-3"
                style={{ backgroundColor: HIGHWAY_COLORS.signRed }}
              >
                <span className="text-xl">🔗</span>
                <div className="text-left">
                  <div>Self Service - Google Login</div>
                  <div className="text-xs opacity-90">💰 You pay for gas</div>
                </div>
              </button>
              
              <button
                onClick={() => setShowWalletOptions(false)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
              >
                🚗 Drive Away
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wallet connecting
  if (status === WalletStatus.CONNECTING) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🔄</div>
          <h3 className="text-xl font-bold text-white mb-2">Starting Engine...</h3>
          <p className="text-blue-200">Connecting to your wallet</p>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Wallet connected - show billboard posting interface
  if (status === WalletStatus.CONNECTED) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
        {/* Enhanced Gas Station Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">⛽</span>
            <h3 className="text-xl font-bold text-white">Billboard Posting Station</h3>
            <span className="text-2xl animate-pulse" style={{ color: paymentInfo.color }}>{paymentInfo.icon}</span>
          </div>
          <div className="px-4 py-2 rounded-lg shadow-inner" style={{ backgroundColor: `${paymentInfo.color}20`, borderColor: paymentInfo.color, border: '1px solid' }}>
            <p className="text-sm font-medium" style={{ color: paymentInfo.color }}>
              {paymentInfo.description}
            </p>
          </div>
        </div>

        {/* Enhanced Message Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="billboard-message" className="block text-white font-semibold mb-2 flex items-center gap-2">
              📢 Your Billboard Message:
              <span className="text-xs text-blue-200 font-normal">(Visible to all highway travelers)</span>
            </label>
            <textarea
              id="billboard-message"
              className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none shadow-inner transition-all duration-300"
              rows={3}
              placeholder="What do you want to tell the highway travelers?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              disabled={isPosting}
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-300">{message.length}/100 characters</span>
              <span className="text-blue-200">💡 Keep it highway-friendly!</span>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePostMessage}
              disabled={isPosting || !message.trim()}
              className="flex-1 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
              style={{
                backgroundColor: isPosting || !message.trim() ? '#666666' : HIGHWAY_COLORS.billboardYellow,
                cursor: isPosting || !message.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Posting to Highway...
                </>
              ) : (
                <>
                  🚗 Post to Highway {isGasStationAvailable ? '(FREE GAS)' : '(YOU PAY GAS)'}
                </>
              )}
            </button>
            
            <button
              onClick={disconnectWallet}
              className="text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              style={{ backgroundColor: HIGHWAY_COLORS.signRed }}
            >
              🛑 Leave Station
            </button>
          </div>

          {/* Enhanced Error Display */}
          {(postError || error) && (
            <div className="border-2 text-red-200 px-4 py-3 rounded-lg shadow-lg"
                 style={{ backgroundColor: `${HIGHWAY_COLORS.signRed}20`, borderColor: HIGHWAY_COLORS.signRed }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚧</span>
                <div>
                  <strong>Road Construction Ahead:</strong>
                  <p className="text-sm mt-1">{postError || error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Success Display */}
          {showSuccess && (
            <div className="border-2 text-green-200 px-4 py-3 rounded-lg shadow-lg animate-pulse"
                 style={{ backgroundColor: `${HIGHWAY_COLORS.freeGas}20`, borderColor: HIGHWAY_COLORS.freeGas }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <div>
                  <strong>Billboard Posted Successfully!</strong>
                  <p className="text-sm mt-1">Your message is now live on the highway for all travelers to see!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-white mb-2">Engine Trouble</h3>
        <p className="text-red-200 mb-4">{error || 'Wallet connection failed'}</p>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={() => setShowWalletOptions(true)}
        >
          🔧 Try Again
        </button>
      </div>
    </div>
  );
}

// Loading Component
function LoadingHighway() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🚗</div>
        <div className="text-white text-xl">Driving down the highway...</div>
        <div className="text-blue-200">Loading billboard messages</div>
      </div>
    </div>
  );
}