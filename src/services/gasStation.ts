// src/services/gasStation.ts
// Simplified transaction service using wallet adapter with gas station integration

import {
  CONTRACT_ADDRESS,
  MODULE_NAME,
  ERROR_MESSAGES,
  GAS_STATION_API_KEY
} from '@/utils/constants';
import type { GasStationTransaction } from '@/types';

// Rate limiting storage (simple in-memory for demo - use Redis in production)
interface RateLimit {
  count: number;
  resetTime: number;
}

const userRateLimit = new Map<string, RateLimit>();

/**
 * Simple rate limiting (5 requests per minute)
 */
export function checkRateLimit(userAddress: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = userRateLimit.get(userAddress);
  const maxRequests = 5;
  const windowMs = 60000; // 1 minute

  // Clean up expired entries
  if (userLimit && userLimit.resetTime <= now) {
    userRateLimit.delete(userAddress);
  }

  const currentLimit = userRateLimit.get(userAddress);

  if (!currentLimit) {
    // First request for this user
    userRateLimit.set(userAddress, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true };
  }

  if (currentLimit.count >= maxRequests) {
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
 * Returns basic Gas Station status for UI
 */
export function getGasStationStatus(): { available: boolean; message: string; apiKeyConfigured: boolean } {
  const apiKeyConfigured = !!GAS_STATION_API_KEY;
  const available = apiKeyConfigured; // basic check; can extend with ping later
  const message = available
    ? 'Gas Station is configured and ready for sponsored transactions.'
    : 'Gas Station is not configured. Set NEXT_PUBLIC_GAS_STATION_API_KEY.';
  return { available, message, apiKeyConfigured };
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

  if (content.length > 100) {
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
 * Simplified transaction processing using wallet adapter with gas station integration
 * The wallet adapter now handles all the complex gas station logic automatically
 */
export async function processMessageTransaction(
  transactionData: GasStationTransaction,
  signAndSubmitTransaction: (transaction: unknown) => Promise<{ hash: string }>,
  transactionSubmitter?: unknown
) {
  const { sender, content } = transactionData;

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

    // Step 3: Build and submit transaction using wallet adapter
    console.log('Submitting sponsored transaction via wallet adapter...');
    const transaction = {
      data: {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::send_message`,
        functionArguments: [CONTRACT_ADDRESS, content],
      },
      // Ensure Gas Station sponsorship and conform to configured limits
      withFeePayer: true,
      options: {
        maxGasAmount: 50,
        gasUnitPrice: 100,
      },
      // Per-transaction submitter improves compatibility with social/keyless wallets
      transactionSubmitter,
    };

    const response = await signAndSubmitTransaction(transaction);

    console.log('Transaction successful with automatic gas station sponsorship:', response.hash);

    return {
      success: true,
      transactionHash: response.hash,
      sponsored: true, // All transactions are now sponsored
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