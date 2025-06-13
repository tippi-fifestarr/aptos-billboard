// src/components/Highway/HighwayBillboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAllMessages, formatTimestamp, shortenAddress } from '@/lib/billboardService';

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

// Gas Gauge Component
function GasGauge() {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">⛽</div>
        <div>
          <div className="text-white font-semibold text-sm">Gas Tank</div>
          <div className="text-blue-200 text-xs">Connect wallet to check</div>
        </div>
      </div>
    </div>
  );
}

// Post Billboard Section (placeholder for now)
function PostBillboardSection({ onMessagePosted }: { onMessagePosted: () => void }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
      <div className="text-center">
        <div className="text-2xl mb-4">🛑</div>
        <h3 className="text-xl font-bold text-white mb-2">Rest Stop</h3>
        <p className="text-blue-200 mb-4">
          Connect your wallet to post a new billboard on the highway
        </p>
        <button 
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={() => alert('Wallet connection coming next!')}
        >
          🔗 Connect Gas Station
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