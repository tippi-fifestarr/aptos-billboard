'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { GasStationTransactionSubmitter } from '@aptos-labs/gas-station-client';
import { NETWORK, GAS_STATION_API_KEY } from '@/utils/constants';

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
  console.log('🛣️ Highway Billboard Gas Station Configuration:');
  console.log('Network:', network);
  console.log('API Key loaded:', !!GAS_STATION_API_KEY);
  console.log('API Key prefix:', GAS_STATION_API_KEY?.substring(0, 20) + '...');

  // Create Gas Station client for sponsored transactions (MCP-guided approach)
  const gasStationTransactionSubmitter = new GasStationTransactionSubmitter({
    network,
    apiKey: GAS_STATION_API_KEY,
  });

  console.log('Gas Station Submitter created:', !!gasStationTransactionSubmitter);

  // Configure Aptos client with Gas Station plugin
  const config = new AptosConfig({
    network,
    pluginSettings: {
      TRANSACTION_SUBMITTER: gasStationTransactionSubmitter,
    },
  });

  const aptosClient = new Aptos(config);
  console.log('Aptos client configured with gas station:', !!aptosClient.config.getTransactionSubmitter());

  return (
    <AptosWalletAdapterProvider
      optInWallets={["Petra", "Continue with Google"]}
      autoConnect={false}
      dappConfig={{
        network,
        transactionSubmitter: aptosClient.config.getTransactionSubmitter(),
      }}
      onError={(error) => {
        console.error("Highway Billboard Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}