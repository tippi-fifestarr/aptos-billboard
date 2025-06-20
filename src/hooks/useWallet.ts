import { useState, useEffect, useCallback } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { getAccountAPTBalance } from '@/lib/billboardService';
import { WalletStatus, WalletType, WalletAccount } from '@/types';
import { MAX_APT_DISPLAY, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';

/**
 * Custom hook to manage wallet connection, balance, and gas station integration
 * Extends the Aptos wallet adapter with highway-themed functionality
 */
export function useWallet() {
  const {
    connect,
    disconnect,
    account,
    connected,
    wallet,
    network,
    signAndSubmitTransaction,
    signTransaction
  } = useAptosWallet();
  
  const [status, setStatus] = useState<WalletStatus>(WalletStatus.DISCONNECTED);
  const [balance, setBalance] = useState<number>(0);
  const [fuelPercentage, setFuelPercentage] = useState<number>(0);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Connect to wallet with type detection
  const connectWallet = async (preferredType: WalletType = 'petra') => {
    try {
      setStatus(WalletStatus.CONNECTING);
      setError(null);
      
      if (preferredType === 'petra') {
        // Check network before connecting
        if (network && network.name && !network.name.toLowerCase().includes('testnet')) {
          console.warn('Wallet not on Testnet - gas station may not work');
        }
        
        await connect("Petra");
        setWalletType('petra');
        console.log(SUCCESS_MESSAGES.walletConnected + ' (Petra - Gas Station Available)');
      } else if (preferredType === 'social') {
        await connect("Continue with Google");
        setWalletType('social');
        console.log(SUCCESS_MESSAGES.walletConnected + ' (Social Login - User Pays Gas)');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setStatus(WalletStatus.ERROR);
      setError(ERROR_MESSAGES.walletConnectionFailed);
      setWalletType(null);
    }
  };
  
  // Disconnect wallet and reset state
  const disconnectWallet = async () => {
    try {
      await disconnect();
      setStatus(WalletStatus.DISCONNECTED);
      setBalance(0);
      setFuelPercentage(0);
      setWalletType(null);
      setError(null);
      console.log('🛑 Engine stopped - wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet');
    }
  };
  
  // Get wallet account with proper typing
  const getWalletAccount = (): WalletAccount | null => {
    if (!account) return null;
    
    return {
      address: account.address,
      publicKey: account.publicKey ? account.publicKey.toString() : undefined,
    };
  };
  
  // Get address as string for transactions
  const getAddressString = useCallback((): string | null => {
    if (!account) return null;
    
    return typeof account.address === 'string'
      ? account.address
      : String(account.address);
  }, [account]);
  
  // Check if gas station is available for current wallet
  const isGasStationAvailable = (): boolean => {
    return walletType === 'petra' && connected;
  };
  
  // Get payment method info for UI
  const getPaymentInfo = () => {
    if (!connected || !walletType) {
      return {
        method: 'none',
        description: 'Connect wallet to see payment method',
        color: '#FFFFFF', // White text for visibility on dark background
        icon: '🔌'
      };
    }
    
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
  
  // Update balance when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && account) {
        try {
          // Auto-detect wallet type if not set
          if (!walletType && wallet) {
            if (wallet.name === 'Petra') {
              setWalletType('petra');
              console.log('🔍 Auto-detected Petra wallet');
            } else if (wallet.name === 'Continue with Google') {
              setWalletType('social');
              console.log('🔍 Auto-detected Google social login');
            }
          }
          
          const addressStr = getAddressString();
          if (!addressStr) {
            console.error('Could not get address string from account');
            return;
          }
          
          const aptBalance = await getAccountAPTBalance(addressStr);
          setBalance(aptBalance);
          
          // Calculate fuel percentage (0-100) based on MAX_APT_DISPLAY
          const percentage = Math.min((aptBalance / MAX_APT_DISPLAY) * 100, 100);
          setFuelPercentage(percentage);
          
          setStatus(WalletStatus.CONNECTED);
          
          // Log balance info with highway theme
          console.log(`⛽ Fuel gauge updated: ${aptBalance.toFixed(4)} APT (${percentage.toFixed(1)}% full)`);
          
        } catch (error) {
          console.error('Error fetching balance:', error);
          setStatus(WalletStatus.ERROR);
          setError('Failed to fetch wallet balance');
        }
      } else {
        setStatus(WalletStatus.DISCONNECTED);
        setBalance(0);
        setFuelPercentage(0);
        setWalletType(null); // Reset wallet type when disconnected
      }
    };
    
    fetchBalance();
  }, [connected, account, wallet, walletType, getAddressString]);
  
  // Network validation effect
  useEffect(() => {
    if (connected && network && walletType === 'petra') {
      if (!network.name?.toLowerCase().includes('testnet')) {
        setError(ERROR_MESSAGES.walletNetworkMismatch);
        console.warn('⚠️ Wallet not on Testnet - gas station sponsorship unavailable');
      } else {
        setError(null);
      }
    }
  }, [connected, network, walletType]);
  
  // Refresh balance manually
  const refreshBalance = async () => {
    if (connected && account) {
      const addressStr = getAddressString();
      if (addressStr) {
        try {
          const aptBalance = await getAccountAPTBalance(addressStr);
          setBalance(aptBalance);
          const percentage = Math.min((aptBalance / MAX_APT_DISPLAY) * 100, 100);
          setFuelPercentage(percentage);
          console.log('🔄 Balance refreshed');
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }
    }
  };

  return {
    // Connection methods
    connectWallet,
    disconnectWallet,
    
    // State
    status,
    balance,
    fuelPercentage,
    walletType,
    error,
    
    // Account info
    account: getWalletAccount(),
    addressString: getAddressString(),
    connected,
    wallet,
    network,
    
    // Transaction methods
    signAndSubmitTransaction,
    signTransaction,
    
    // Gas station info
    isGasStationAvailable: isGasStationAvailable(),
    paymentInfo: getPaymentInfo(),
    
    // Utility methods
    refreshBalance,
  };
}