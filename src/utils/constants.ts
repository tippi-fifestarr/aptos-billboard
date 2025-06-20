// src/utils/constants.ts
// Configuration constants for the highway billboard application

// Contract configuration
export const CONTRACT_ADDRESS = "0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03";
export const MODULE_NAME = "billboard";

// API Keys - separate keys for different services
export const INDEXER_API_KEY = process.env.NEXT_PUBLIC_INDEXER_API_KEY || "";
export const GAS_STATION_API_KEY = process.env.NEXT_PUBLIC_GAS_STATION_API_KEY || "";

// Legacy API key for backward compatibility
export const LEGACY_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY || "";

// Network configuration
export const NETWORK = {
  name: "testnet",
  fullnodeUrl: "https://fullnode.testnet.aptoslabs.com/v1",
};

// Gas station configuration
export const GAS_STATION_CONFIG = {
  maxGasAmount: 50, // Critical: Gas station maximum
  normalMaxGas: 200000, // For non-sponsored transactions
  rateLimit: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  },
};

// Maximum APT amount for "full tank" in the gas gauge
export const MAX_APT_DISPLAY = 10;

// Highway theme colors
export const HIGHWAY_COLORS = {
  // Road Infrastructure
  roadAsphalt: "#333333",        // Dark road surface
  laneYellow: "#FFCC00",         // Yellow lane divider
  laneWhite: "#FFFFFF",          // White lane marker
  roadShoulder: "#A9A9A9",       // Road shoulder
  
  // Highway Signs
  signBlue: "#0066CC",           // Informational signs
  signGreen: "#006633",          // Directional signs
  signRed: "#CC0000",            // Warning/stop signs
  signOrange: "#FF6600",         // Construction/caution
  signBrown: "#8B4513",          // Recreational/scenic
  signWhite: "#FFFFFF",          // Text on signs
  signBlack: "#000000",          // Border on signs
  
  // Gas Station Theme
  gasStation: "#FF6600",         // Orange for gas station
  freeGas: "#00CC00",           // Green for sponsored transactions
  paidGas: "#FFCC00",           // Yellow for user-paid transactions
  emptyTank: "#FF0000",         // Red for empty/low balance
  
  // Gas Gauge Colors
  gasGaugeEmpty: "#FF0000",     // Empty fuel
  gasGaugeHalf: "#FFCC00",      // Half fuel
  gasGaugeFull: "#00CC00",      // Full fuel
  
  // Accent Colors
  headlightGlow: "#FFFFCC",     // Highlight effect
  nightSky: "#0A1929",          // Dark mode background
  billboardYellow: "#FFD700",   // Featured billboard background
  mileMarker: "#4A90E2",        // Mile marker blue
};

// UI Configuration
export const UI_CONFIG = {
  // Animation durations (ms)
  transitionDuration: 300,
  loadingSpinnerDuration: 1000,
  successMessageDuration: 5000,
  
  // Polling intervals (ms)
  balanceRefreshInterval: 30000,  // 30 seconds
  indexerPollInterval: 5000,      // 5 seconds
  
  // Message limits
  maxMessageLength: 100,
  maxMessagesDisplay: 50,
  
  // Responsive breakpoints
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
};

// Error messages with highway theme
export const ERROR_MESSAGES = {
  // Wallet errors
  walletNotConnected: "🛑 Please pull into the gas station to connect your wallet",
  walletConnectionFailed: "⚠️ Engine trouble - failed to connect wallet",
  walletNetworkMismatch: "🚧 Wrong highway - please switch to Testnet",
  
  // Transaction errors
  insufficientFunds: "⛽ Empty tank - insufficient APT for gas fees",
  transactionFailed: "🚧 Road construction - transaction failed",
  gasStationUnavailable: "🛑 Gas station closed - service unavailable",
  rateLimitExceeded: "🚦 Traffic jam - too many requests, please wait",
  
  // Content errors
  messageEmpty: "📝 Billboard message cannot be empty",
  messageTooLong: "📏 Billboard message too long (max 100 characters)",
  invalidContent: "🚫 Billboard content contains prohibited words",
  
  // Network errors
  networkError: "📡 Poor signal - network connection failed",
  indexerError: "📊 Traffic report unavailable - indexer connection failed",
  apiKeyMissing: "🔑 Missing credentials - API key not configured",
};

// Success messages with highway theme
export const SUCCESS_MESSAGES = {
  walletConnected: "✅ Engine started - wallet connected successfully",
  transactionSubmitted: "🚗 Message posted to the highway",
  gasStationSponsored: "⛽ Free gas courtesy of the station",
  messagePosted: "📢 Your billboard is now live on the highway",
};

// Validation rules
export const VALIDATION = {
  messageMinLength: 1,
  messageMaxLength: 100,
  addressMinLength: 10,
  requiredFields: ['content', 'userAddress'],
};