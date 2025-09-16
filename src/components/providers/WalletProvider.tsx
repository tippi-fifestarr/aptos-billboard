'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { createGasStationClientRaw } from '@aptos-labs/gas-station-client';
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
  console.log('🛣️ Highway Billboard Gas Station Configuration (Chess approach):');
  console.log('Network:', network);
  console.log('API Key loaded:', !!GAS_STATION_API_KEY);

  // Use the WORKING approach from aptos-chess (staging + raw client)
  const gasStationClient = createGasStationClientRaw({
    baseUrl: "https://api.testnet.staging.aptoslabs.com/gs/v1",
    interceptors: {
      request: (request) => {
        request.headers.set(
          "authorization",
          `Bearer ${GAS_STATION_API_KEY}`,
        );
        return request;
      },
    },
  });

  console.log('Gas Station Raw Client created:', !!gasStationClient);

  // Configure Aptos client with staging endpoints (like chess repo)
  const config = new AptosConfig({
    network,
    fullnode: "https://api.testnet.staging.aptoslabs.com/v1",
    indexer: "https://api.testnet.staging.aptoslabs.com/v1/graphql",
    pluginSettings: {
      TRANSACTION_SUBMITTER: gasStationClient,
    },
  });

  const aptosClient = new Aptos(config);
  console.log('Aptos client configured with staging gas station:', !!aptosClient.config.getTransactionSubmitter());

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