// src/lib/billboardService.ts
import {
    Aptos,
    AptosConfig,
    Network,
  } from "@aptos-labs/ts-sdk";
  
  // Configure for devnet (fixed from the generated code)
  const aptosConfig = new AptosConfig({
    network: Network.TESTNET,
    fullnode: "https://fullnode.testnet.aptoslabs.com/v1",
  });
  
  const aptos = new Aptos(aptosConfig);
  
  // Your contract details
  const CONTRACT_ADDRESS = "0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03";
  const MODULE_NAME = "billboard";
  
  // Types matching your Move contract
  export interface Message {
    content: string;
    author: string;
    timestamp: string;
  }
  
  export interface BillboardData {
    messages: Message[];
    messageCount: number;
  }
  
  // Get all messages from your billboard (now using indexer for real-time data!)
  export async function getAllMessages(): Promise<Message[]> {
    try {
      // Try indexer first for real-time data
      const { billboardIndexer } = await import('./indexerClient');
      const indexedMessages = await billboardIndexer.getAllMessages();
      
      return indexedMessages.map((msg) => ({
        content: msg.message,
        author: msg.author_address,
        timestamp: msg.time,
      }));
    } catch (indexerError) {
      console.warn('Indexer failed, falling back to blockchain view:', indexerError);
      
      // Fallback to direct blockchain query
      try {
        const result = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_all_messages`,
            typeArguments: [],
            functionArguments: [CONTRACT_ADDRESS],
          },
        });
  
        const messages = result[0] as Array<{
          content: string;
          author: string;
          timestamp: string;
        }>;
        
        return messages.map((msg) => ({
          content: msg.content,
          author: msg.author,
          timestamp: msg.timestamp,
        }));
      } catch (blockchainError) {
        console.error('Both indexer and blockchain queries failed:', blockchainError);
        return [];
      }
    }
  }
  
  // Get message count
  export async function getMessageCount(): Promise<number> {
    try {
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_message_count`,
          typeArguments: [],
          functionArguments: [CONTRACT_ADDRESS],
        },
      });
  
      return Number(result[0]);
    } catch (error) {
      console.error('Error fetching message count:', error);
      return 0;
    }
  }
  
  // Get account APT balance (for our "gas gauge")
  export async function getAccountAPTBalance(accountAddress: string): Promise<number> {
    try {
      const balance = await aptos.getAccountAPTAmount({
        accountAddress,
      });
      return Number(balance) / 100000000; // Convert from Octas to APT
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }
  
  // Utility function to format timestamp for display
  export function formatTimestamp(timestamp: string): string {
    // Convert microseconds to milliseconds
    const date = new Date(parseInt(timestamp) / 1000);
    return date.toLocaleString();
  }
  
  // Utility function to shorten address for display
  export function shortenAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }