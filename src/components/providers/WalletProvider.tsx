'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { NETWORK } from '@/utils/constants';

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider component wraps the application with the AptosWalletAdapterProvider
 * This enables wallet functionality throughout the highway billboard app
 */
export default function WalletProvider({ children }: WalletProviderProps) {
  // Use testnet for gas station compatibility
  const network = NETWORK.name === 'devnet' ? Network.DEVNET : Network.TESTNET;

  return (
    <AptosWalletAdapterProvider
      optInWallets={["Petra", "Continue with Google"]}
      autoConnect={false}
      dappConfig={{ network }}
      onError={(error) => {
        console.error("Highway Billboard Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}