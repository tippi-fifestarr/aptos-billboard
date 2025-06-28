# ⛽ Aptos Gas Station - Complete Implementation Guide

> **Everything you need to know about implementing Gas Station for sponsored transactions**

This guide covers every step of implementing Aptos Gas Station in your dApp, from initial setup to production deployment. Based on the real-world implementation in the Highway Billboard project.

## 📋 Table of Contents

1. [What is Gas Station?](#what-is-gas-station)
2. [Prerequisites](#prerequisites)
3. [Aptos Build Setup](#aptos-build-setup)
4. [Environment Configuration](#environment-configuration)
5. [SDK Installation](#sdk-installation)
6. [Core Implementation](#core-implementation)
7. [Wallet Integration](#wallet-integration)
8. [Transaction Flow](#transaction-flow)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Production Deployment](#production-deployment)
12. [Troubleshooting](#troubleshooting)

## 🎯 What is Gas Station?

**Gas Station** is Aptos Build's transaction sponsorship service that allows dApps to pay gas fees on behalf of their users, creating a seamless Web3 experience.

### Key Benefits:
- **Zero Friction Onboarding** - Users don't need APT to start using your dApp
- **Improved UX** - No gas fee prompts for sponsored transactions
- **Selective Sponsorship** - Choose which wallets/functions to sponsor
- **Rate Limiting** - Built-in protection against abuse

### How It Works:
```
User Action → Wallet Detection → Gas Station API → Sponsored Transaction
```

## 🔧 Prerequisites

### Required Tools:
- **Node.js 18+**
- **Aptos CLI 7.4.0+**
- **Deployed Smart Contract** on Testnet
- **Aptos Build Account** (https://build.aptoslabs.com)

### Network Requirements:
- **TESTNET ONLY** - Gas Station currently only works on Testnet
- All wallets must be connected to Testnet
- Smart contract must be deployed on Testnet

## 🏗️ Aptos Build Setup

### Step 1: Create Gas Station Project

1. **Go to Aptos Build Dashboard**
   ```
   https://build.aptoslabs.com
   ```

2. **Create New Project**
   - Click "Create Project"
   - Select "Gas Station"
   - Name your project (e.g., "Highway Billboard Gas Station")

3. **Configure Network**
   ```
   Network: TESTNET (required)
   ```

4. **Whitelist Contract Functions**
   ```
   Contract Address: 0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03
   Module: billboard
   Function: send_message
   ```

5. **Copy API Key**
   ```
   Format: aptoslabs_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2: Configure Rate Limits (Optional)

```
Max Requests: 5 per minute (recommended)
Max Gas Amount: 50 (Gas Station limit)
```

## 🔐 Environment Configuration

### Environment Variables

Create or update your `.env.local`:

```env
# Gas Station Configuration
NEXT_PUBLIC_GAS_STATION_API_KEY=aptoslabs_YOUR_GAS_STATION_API_KEY_HERE

# Contract Configuration (for reference)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03
NEXT_PUBLIC_MODULE_NAME=billboard
```

### Verification

Test your API key:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GAS_STATION_API_KEY" \
  https://api.testnet.aptoslabs.com/gas-station/v1/health
```

## 📦 SDK Installation

### Install Required Dependencies

```bash
npm install @aptos-labs/gas-station-client @aptos-labs/ts-sdk@1.39.0
```

### Important Version Notes:
- **Gas Station Client**: Latest version
- **Aptos SDK**: v1.39.0 (required for wallet adapter compatibility)
- **Wallet Adapter**: Compatible versions only

### Package.json Example:
```json
{
  "dependencies": {
    "@aptos-labs/gas-station-client": "^1.0.0",
    "@aptos-labs/ts-sdk": "1.39.0",
    "@aptos-labs/wallet-adapter-react": "^6.1.2"
  }
}
```

## 🔧 Core Implementation

### Step 1: Create Gas Station Service

Create `src/services/gasStation.ts`:

```typescript
import { createGasStationClient } from '@aptos-labs/gas-station-client';
import {
  Network,
  Aptos,
  AptosConfig,
  SimpleTransaction,
  AnyRawTransaction,
  AccountAuthenticator
} from '@aptos-labs/ts-sdk';

// Initialize gas station client
export const gasStationClient = createGasStationClient({
  network: Network.TESTNET,
  apiKey: process.env.NEXT_PUBLIC_GAS_STATION_API_KEY!,
});

// Initialize Aptos client for transaction building
export const aptos = new Aptos(new AptosConfig({ 
  network: Network.TESTNET 
}));
```

### Step 2: Build Transactions

```typescript
export async function buildMessageTransaction(
  senderAddress: string, 
  content: string, 
  useGasStation: boolean = true
) {
  const transaction = await aptos.transaction.build.simple({
    sender: senderAddress,
    withFeePayer: useGasStation, // Critical for gas station sponsorship
    data: {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::send_message`,
      functionArguments: [CONTRACT_ADDRESS, content],
      typeArguments: []
    },
    options: {
      maxGasAmount: useGasStation ? 50 : 200000, // Gas station has strict limits
    },
  });
  
  return transaction;
}
```

### Step 3: Submit Sponsored Transactions

```typescript
export async function submitGasStationTransaction(
  transaction: unknown,
  senderAuthenticator: unknown
) {
  const response = await gasStationClient.simpleSignAndSubmitTransaction(
    transaction as SimpleTransaction,
    senderAuthenticator as AccountAuthenticator
  );
  
  if (response.error !== undefined || response.data === undefined) {
    throw new Error(`Gas station error: ${JSON.stringify(response.error)}`);
  }
  
  return response.data.transactionHash;
}
```

### Step 4: Fallback for Normal Transactions

```typescript
export async function submitNormalTransaction(
  transaction: unknown,
  senderAuthenticator: unknown
) {
  const response = await aptos.transaction.submit.simple({
    transaction: transaction as AnyRawTransaction,
    senderAuthenticator: senderAuthenticator as AccountAuthenticator,
  });
  
  return response.hash;
}
```

## 🔗 Wallet Integration

### Step 1: Wallet Type Detection

```typescript
export function useWallet() {
  const [walletType, setWalletType] = useState<'petra' | 'social' | null>(null);
  
  // Auto-detect wallet type
  useEffect(() => {
    if (connected && wallet) {
      if (wallet.name === 'Petra') {
        setWalletType('petra');
      } else if (wallet.name === 'Continue with Google') {
        setWalletType('social');
      }
    }
  }, [connected, wallet]);
  
  // Check if gas station is available
  const isGasStationAvailable = (): boolean => {
    return walletType === 'petra' && connected;
  };
  
  return { walletType, isGasStationAvailable: isGasStationAvailable() };
}
```

### Step 2: Payment Method Display

```typescript
const getPaymentInfo = () => {
  if (walletType === 'petra') {
    return {
      method: 'sponsored',
      description: 'Free gas courtesy of gas station',
      color: '#00CC00', // Green for free gas
      icon: '⛽'
    };
  } else {
    return {
      method: 'user-paid',
      description: 'You pay gas fees (normal transaction)',
      color: '#FFCC00', // Yellow for paid gas
      icon: '💰'
    };
  }
};
```

## 🔄 Transaction Flow

### Complete Transaction Processing

```typescript
export async function processMessageTransaction(
  transactionData: GasStationTransaction,
  signTransaction: (transaction: { transactionOrPayload: unknown }) => Promise<{ authenticator: unknown }>
) {
  const { sender, content, useGasStation, walletType } = transactionData;
  
  try {
    // Step 1: Validate content
    const contentValidation = validateMessageContent(content);
    if (!contentValidation.valid) {
      throw new Error(contentValidation.error);
    }
    
    // Step 2: Check rate limit
    const rateLimitResult = checkRateLimit(sender);
    if (!rateLimitResult.allowed) {
      throw new Error('Rate limit exceeded');
    }
    
    // Step 3: Build transaction
    const transaction = await buildMessageTransaction(sender, content, useGasStation);
    
    // Step 4: Sign transaction
    const signResult = await signTransaction({ transactionOrPayload: transaction });
    
    // Step 5: Submit transaction
    let transactionHash: string;
    
    if (useGasStation) {
      transactionHash = await submitGasStationTransaction(transaction, signResult.authenticator);
    } else {
      transactionHash = await submitNormalTransaction(transaction, signResult.authenticator);
    }
    
    // Step 6: Wait for confirmation
    const confirmedTransaction = await waitForTransactionConfirmation(transactionHash);
    
    return {
      success: true,
      transactionHash,
      confirmedTransaction,
      sponsored: useGasStation,
      walletType
    };
    
  } catch (error) {
    console.error('Transaction processing failed:', error);
    throw error;
  }
}
```

### Usage in Components

```typescript
const handlePostMessage = async () => {
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
};
```

## 🛡️ Error Handling

### Common Error Scenarios

```typescript
export function getGasStationStatus() {
  const available = !!GAS_STATION_API_KEY && GAS_STATION_API_KEY.length > 0;
  
  return {
    available,
    message: available 
      ? "⛽ Gas station open - free transactions available"
      : "🛑 Gas station closed - API key not configured",
    apiKeyConfigured: !!GAS_STATION_API_KEY,
  };
}
```

### Error Message Mapping

```typescript
const getErrorMessage = (error: Error) => {
  if (error.message.includes('Rate limit')) {
    return 'Traffic jam - too many requests, please wait';
  } else if (error.message.includes('gas station')) {
    return 'Gas station unavailable - service temporarily down';
  } else if (error.message.includes('insufficient')) {
    return 'Empty tank - insufficient APT for gas fees';
  } else if (error.message.includes('User rejected')) {
    return 'Transaction was cancelled by user';
  }
  return `Transaction failed: ${error.message}`;
};
```

## 🧪 Testing

### Step 1: Create Test Page

Create `src/app/test-gas-station/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { getGasStationStatus } from '@/services/gasStation';

export default function TestGasStationPage() {
  const { connectWallet, isGasStationAvailable, walletType } = useWallet();
  const [status, setStatus] = useState('Not tested');
  
  const testGasStation = async () => {
    setStatus('Testing...');
    
    try {
      const gasStationStatus = getGasStationStatus();
      
      if (!gasStationStatus.available) {
        setStatus('❌ Gas Station API key not configured');
        return;
      }
      
      if (!isGasStationAvailable) {
        setStatus('⚠️ Gas Station available but wallet not eligible (need Petra)');
        return;
      }
      
      setStatus('✅ Gas Station ready for sponsored transactions');
      
    } catch (error) {
      setStatus(`❌ Gas Station test failed: ${error}`);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gas Station Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Wallet Type:</strong> {walletType || 'Not connected'}
        </div>
        
        <div>
          <strong>Gas Station Available:</strong> {isGasStationAvailable ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>Test Status:</strong> {status}
        </div>
        
        <button
          onClick={testGasStation}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Gas Station
        </button>
      </div>
    </div>
  );
}
```

### Step 2: Test Scenarios

1. **API Key Test**
   - Verify environment variable is loaded
   - Test API key format (starts with `aptoslabs_`)

2. **Wallet Compatibility Test**
   - Connect Petra wallet → Should show sponsored transactions
   - Connect social login → Should show normal transactions

3. **Transaction Test**
   - Post message with Petra → Should be free
   - Post message with social → Should show gas fee

4. **Rate Limiting Test**
   - Post multiple messages quickly
   - Verify rate limiting kicks in

## 🚀 Production Deployment

### Step 1: Environment Variables

Set in your deployment platform (Vercel, etc.):

```env
NEXT_PUBLIC_GAS_STATION_API_KEY=aptoslabs_your_production_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

### Step 2: Verification Checklist

- [ ] Gas Station API key is valid
- [ ] Contract functions are whitelisted
- [ ] Network is set to TESTNET
- [ ] Rate limits are configured
- [ ] Error handling is implemented
- [ ] Fallback to normal transactions works

### Step 3: Monitoring

```typescript
// Add logging for production monitoring
const logGasStationUsage = (transactionHash: string, sponsored: boolean, walletType: string) => {
  console.log('Gas Station Transaction:', {
    hash: transactionHash,
    sponsored,
    walletType,
    timestamp: new Date().toISOString()
  });
};
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Gas Station API key not configured"
**Problem:** Environment variable not loaded
**Solution:** 
- Check `.env.local` file exists
- Verify variable name: `NEXT_PUBLIC_GAS_STATION_API_KEY`
- Restart development server

#### 2. "Function not whitelisted"
**Problem:** Contract function not approved in Gas Station
**Solution:**
- Go to Aptos Build dashboard
- Add function to whitelist: `send_message`
- Wait 5-10 minutes for propagation

#### 3. "Network mismatch"
**Problem:** Wallet on wrong network
**Solution:**
- Switch wallet to Testnet
- Verify contract is deployed on Testnet
- Check Gas Station is configured for Testnet

#### 4. "Transaction failed with gas station error"
**Problem:** Gas limit exceeded or other gas station issue
**Solution:**
- Check `maxGasAmount` is ≤ 50 for gas station
- Verify transaction is properly formatted
- Check rate limits haven't been exceeded

#### 5. "Petra wallet not getting sponsored transactions"
**Problem:** Wallet type detection failing
**Solution:**
```typescript
// Debug wallet detection
console.log('Wallet name:', wallet?.name);
console.log('Wallet type detected:', walletType);
console.log('Gas station available:', isGasStationAvailable);
```

### Debug Commands

```bash
# Test API key
curl -H "Authorization: Bearer $NEXT_PUBLIC_GAS_STATION_API_KEY" \
     https://api.testnet.aptoslabs.com/gas-station/v1/health

# Check environment variables
echo $NEXT_PUBLIC_GAS_STATION_API_KEY

# Verify contract on Testnet
aptos account lookup-address --account-address 0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03
```

## 📊 Best Practices

### 1. Rate Limiting
- Implement client-side rate limiting
- Store limits in memory or localStorage
- Provide clear feedback to users

### 2. Error Handling
- Always have fallback to normal transactions
- Provide user-friendly error messages
- Log errors for debugging

### 3. User Experience
- Clearly indicate when transactions are sponsored
- Show different UI for different wallet types
- Provide loading states during transactions

### 4. Security
- Validate all inputs before sending to gas station
- Implement content filtering for message content
- Monitor for abuse patterns

## 🎯 Key Takeaways

1. **Gas Station only works on Testnet** - This is the most important limitation
2. **Petra wallet gets sponsored transactions** - Other wallets pay normal fees
3. **Function whitelisting is required** - Must be configured in Aptos Build
4. **Rate limiting is built-in** - But implement client-side limits too
5. **Always have fallbacks** - Normal transactions when gas station fails

## 📚 Additional Resources

- [Aptos Build Documentation](https://build.aptoslabs.com)
- [Gas Station Client SDK](https://www.npmjs.com/package/@aptos-labs/gas-station-client)
- [Aptos TypeScript SDK](https://www.npmjs.com/package/@aptos-labs/ts-sdk)
- [Highway Billboard Implementation](https://github.com/tippi-fifestarr/aptos-billboard)

---

*This guide is based on the real-world implementation in the Highway Billboard project. For the latest updates and examples, check the [GitHub repository](https://github.com/tippi-fifestarr/aptos-billboard).*