'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { NETWORK, GAS_STATION_API_KEY, LEGACY_API_KEY } from '@/utils/constants';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider component wraps the application with the AptosWalletAdapterProvider
 * This enables wallet functionality with gas station integration throughout the highway billboard app
 */
export default function WalletProvider({ children }: WalletProviderProps) {
  // Use testnet for gas station compatibility
  const network = NETWORK.name === 'devnet' ? Network.DEVNET : Network.TESTNET;

  // Debug logging for gas station configuration
  console.log('🛣️ Highway Billboard Gas Station Configuration (Chess approach):');
  console.log('Network:', network);
  console.log('API Key loaded:', !!GAS_STATION_API_KEY);

  // Configure Aptos client without plugin to avoid type collisions between ts-sdk versions
  const config = new AptosConfig({
    network,
  });

  const aptosClient = new Aptos(config);
  console.log('Aptos client configured with staging gas station:', !!aptosClient.config.getTransactionSubmitter());

  return (
    <AptosWalletAdapterProvider
      optInWallets={["Petra", "Continue with Google"]}
      autoConnect={false}
      dappConfig={{
        network,
      }}
      onError={(error) => {
        console.error("Highway Billboard Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}