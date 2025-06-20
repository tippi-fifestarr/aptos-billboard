// src/types/index.ts
// Shared type definitions for the highway billboard application

// Message type from the smart contract (compatible with indexer)
export interface Message {
  content: string;
  author: string;
  timestamp: string; // Keep as string for indexer compatibility
}

// Extended message type with additional UI properties
export interface UIMessage extends Message {
  index?: number;  // Position in the list (for mile markers)
  isFeatured?: boolean;  // Whether this message is featured
}

// Wallet connection status
export enum WalletStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

// Wallet type detection
export type WalletType = 'petra' | 'social' | null;

// Contract service response types
export interface ContractResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

// Highway theme types
export type HighwayTheme = "day" | "night";

// Gas station transaction types
export interface GasStationTransaction {
  sender: string;
  content: string;
  useGasStation: boolean;
  walletType: WalletType;
}

// Test result types for indexer testing
export interface TestResult {
  success: boolean;
  results?: Record<string, boolean>;
  error?: string;
  timestamp?: string;
}

// Wallet account type (from wallet adapter)
export interface WalletAccount {
  address: string | object;
  publicKey?: string | Uint8Array;
}

// Transaction signing result
export interface SignResult {
  authenticator: unknown;
  rawTransaction?: unknown;
  transaction?: unknown;
}