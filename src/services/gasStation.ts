// src/services/gasStation.ts
// Gas station client for transaction sponsorship

import { createGasStationClient } from '@aptos-labs/gas-station-client';
import {
  Network,
  Aptos,
  AptosConfig,
  SimpleTransaction,
  AnyRawTransaction,
  AccountAuthenticator
} from '@aptos-labs/ts-sdk';
import { 
  GAS_STATION_API_KEY, 
  CONTRACT_ADDRESS, 
  MODULE_NAME, 
  GAS_STATION_CONFIG,
  ERROR_MESSAGES 
} from '@/utils/constants';
import type { GasStationTransaction } from '@/types';

// Initialize gas station client
export const gasStationClient = createGasStationClient({
  network: Network.TESTNET,
  apiKey: GAS_STATION_API_KEY,
});

// Initialize Aptos client for transaction building
export const aptos = new Aptos(new AptosConfig({ 
  network: Network.TESTNET 
}));

// Rate limiting storage (in production, use Redis or database)
interface RateLimit {
  count: number;
  resetTime: number;
}

const userRateLimit = new Map<string, RateLimit>();

/**
 * Check if user has exceeded rate limit
 */
export function checkRateLimit(userAddress: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = userRateLimit.get(userAddress);

  // Clean up expired entries
  if (userLimit && userLimit.resetTime <= now) {
    userRateLimit.delete(userAddress);
  }

  const currentLimit = userRateLimit.get(userAddress);
  
  if (!currentLimit) {
    // First request for this user
    userRateLimit.set(userAddress, {
      count: 1,
      resetTime: now + GAS_STATION_CONFIG.rateLimit.windowMs,
    });
    return { allowed: true };
  }

  if (currentLimit.count >= GAS_STATION_CONFIG.rateLimit.maxRequests) {
    return { 
      allowed: false, 
      resetTime: currentLimit.resetTime 
    };
  }

  // Increment count
  currentLimit.count += 1;
  return { allowed: true };
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.messageEmpty };
  }

  if (content.length === 0) {
    return { valid: false, error: ERROR_MESSAGES.messageEmpty };
  }

  if (content.length > GAS_STATION_CONFIG.maxGasAmount) {
    return { valid: false, error: ERROR_MESSAGES.messageTooLong };
  }

  // Basic profanity filter (extend as needed)
  const prohibitedWords = ['spam', 'scam', 'hack', 'phishing'];
  const lowerContent = content.toLowerCase();
  
  for (const word of prohibitedWords) {
    if (lowerContent.includes(word)) {
      return { valid: false, error: ERROR_MESSAGES.invalidContent };
    }
  }

  return { valid: true };
}

/**
 * Build a transaction for message posting
 * Supports both gas station sponsored and normal transactions
 */
export async function buildMessageTransaction(
  senderAddress: string, 
  content: string, 
  useGasStation: boolean = true
) {
  try {
    console.log(`Building transaction for ${useGasStation ? 'gas station' : 'normal'} submission`);
    
    const transaction = await aptos.transaction.build.simple({
      sender: senderAddress,
      withFeePayer: useGasStation, // Critical for gas station sponsorship
      data: {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::send_message`,
        functionArguments: [CONTRACT_ADDRESS, content],
        typeArguments: []
      },
      options: {
        // Gas station has strict limits, normal transactions can use more
        maxGasAmount: useGasStation 
          ? GAS_STATION_CONFIG.maxGasAmount 
          : GAS_STATION_CONFIG.normalMaxGas,
      },
    });
    
    console.log('Transaction built successfully');
    return transaction;
  } catch (error) {
    console.error('Error building transaction:', error);
    throw new Error(`Failed to build transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Submit a signed transaction via gas station
 */
export async function submitGasStationTransaction(
  transaction: unknown,
  senderAuthenticator: unknown
) {
  try {
    console.log('Submitting transaction to gas station...');
    
    const response = await gasStationClient.simpleSignAndSubmitTransaction(
      transaction as SimpleTransaction,
      senderAuthenticator as AccountAuthenticator
    );
    
    if (response.error !== undefined || response.data === undefined) {
      console.error('Gas station response error:', response.error);
      throw new Error(`Gas station error: ${JSON.stringify(response.error)}`);
    }
    
    console.log('Gas station submission successful:', response.data.transactionHash);
    return response.data.transactionHash;
  } catch (error) {
    console.error('Gas station submission failed:', error);
    throw error;
  }
}

/**
 * Submit a normal transaction (user pays gas)
 */
export async function submitNormalTransaction(
  transaction: unknown,
  senderAuthenticator: unknown
) {
  try {
    console.log('Submitting normal transaction...');
    
    const response = await aptos.transaction.submit.simple({
      transaction: transaction as AnyRawTransaction,
      senderAuthenticator: senderAuthenticator as AccountAuthenticator,
    });
    
    console.log('Normal transaction submission successful:', response.hash);
    return response.hash;
  } catch (error) {
    console.error('Normal transaction submission failed:', error);
    throw error;
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransactionConfirmation(transactionHash: string) {
  try {
    console.log('Waiting for transaction confirmation...');
    
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: transactionHash,
      options: { 
        checkSuccess: true,
        timeoutSecs: 30
      },
    });
    
    console.log('Transaction confirmed:', executedTransaction.hash);
    return executedTransaction;
  } catch (error) {
    console.error('Transaction confirmation failed:', error);
    throw error;
  }
}

/**
 * Complete transaction flow - build, sign, submit, and confirm
 * This is the main function that components will use
 */
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
      const waitTime = rateLimitResult.resetTime 
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) 
        : 60;
      throw new Error(`${ERROR_MESSAGES.rateLimitExceeded} Try again in ${waitTime} seconds.`);
    }
    
    // Step 3: Build transaction
    const transaction = await buildMessageTransaction(sender, content, useGasStation);
    
    // Step 4: Sign transaction
    console.log('Requesting transaction signature...');
    const signResult = await signTransaction({ transactionOrPayload: transaction });
    
    if (!signResult || !signResult.authenticator) {
      throw new Error('Failed to sign transaction - no authenticator returned');
    }
    
    // Step 5: Submit transaction
    let transactionHash: string;
    
    if (useGasStation) {
      transactionHash = await submitGasStationTransaction(transaction, signResult.authenticator);
    } else {
      transactionHash = await submitNormalTransaction(transaction, signResult.authenticator);
    }
    
    // Step 6: Wait for confirmation
    const confirmedTransaction = await waitForTransactionConfirmation(transactionHash);
    
    console.log(`Transaction successful via ${walletType} wallet (${useGasStation ? 'sponsored' : 'user-paid'})`);
    
    return {
      success: true,
      transactionHash,
      confirmedTransaction,
      sponsored: useGasStation,
      walletType
    };
    
  } catch (error) {
    console.error('Transaction processing failed:', error);
    
    // Provide user-friendly error messages
    let errorMessage = ERROR_MESSAGES.transactionFailed;
    
    if (error instanceof Error) {
      if (error.message.includes('Rate limit') || error.message.includes('Traffic jam')) {
        errorMessage = error.message;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = ERROR_MESSAGES.networkError;
      } else if (error.message.includes('gas station')) {
        errorMessage = ERROR_MESSAGES.gasStationUnavailable;
      } else if (error.message.includes('insufficient')) {
        errorMessage = ERROR_MESSAGES.insufficientFunds;
      } else if (error.message.includes('User rejected') || error.message.includes('cancelled')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message.includes('Billboard message')) {
        errorMessage = error.message; // Content validation errors
      } else {
        errorMessage = `${ERROR_MESSAGES.transactionFailed}: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Check if gas station is available and properly configured
 */
export function isGasStationAvailable(): boolean {
  return !!GAS_STATION_API_KEY && GAS_STATION_API_KEY.length > 0;
}

/**
 * Get gas station status for UI display
 */
export function getGasStationStatus() {
  const available = isGasStationAvailable();
  
  return {
    available,
    message: available 
      ? "⛽ Gas station open - free transactions available"
      : "🛑 Gas station closed - API key not configured",
    apiKeyConfigured: !!GAS_STATION_API_KEY,
  };
}