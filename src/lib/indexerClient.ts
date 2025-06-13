// src/lib/indexerClient.ts
// Real-time billboard data from Aptos Build No-Code Indexer (GraphQL)

export interface IndexedMessage {
    author_address: string;
    time: string;
    message: string;
  }
  
  export interface GraphQLResponse {
    data: {
      table: IndexedMessage[];
    };
  }
  
  // Your live GraphQL endpoint from Aptos Build (use the /manage/ endpoint!)
  const INDEXER_API_URL = process.env.NEXT_PUBLIC_INDEXER_API_URL || 'https://api.testnet.aptoslabs.com/nocode/v1/manage/cmbtx8djy013rs6015b87fsck/v1/graphql';
  
  export class BillboardIndexerClient {
    private apiUrl: string;
  
    constructor(apiUrl: string = INDEXER_API_URL) {
      this.apiUrl = apiUrl;
    }
  
    // Execute GraphQL query
    private async executeQuery(query: string, variables: Record<string, any> = {}): Promise<any> {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
  
        // Add Hasura admin secret if available
        const adminSecret = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;
        if (adminSecret) {
          headers['x-hasura-admin-secret'] = adminSecret;
        }
  
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`GraphQL API error: ${response.status}`);
        }
  
        const result = await response.json();
        
        if (result.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        }
  
        return result.data;
      } catch (error) {
        console.error('GraphQL query error:', error);
        throw error;
      }
    }
  
    // Get all billboard messages (real-time)
    async getAllMessages(limit: number = 50): Promise<IndexedMessage[]> {
      const query = `
        query GetBillboardMessages($limit: Int) {
          table(limit: $limit, order_by: {time: desc}) {
            author_address
            time
            message
          }
        }
      `;
  
      try {
        const data = await this.executeQuery(query, { limit });
        return data.table || [];
      } catch (error) {
        console.error('Error fetching messages from indexer:', error);
        return [];
      }
    }
  
    // Get messages by specific author
    async getMessagesByAuthor(authorAddress: string): Promise<IndexedMessage[]> {
      const query = `
        query GetMessagesByAuthor($authorAddress: String!) {
          table(where: {author_address: {_eq: $authorAddress}}, order_by: {time: desc}) {
            author_address
            time
            message
          }
        }
      `;
  
      try {
        const data = await this.executeQuery(query, { authorAddress });
        return data.table || [];
      } catch (error) {
        console.error('Error fetching messages by author:', error);
        return [];
      }
    }
  
    // Get recent messages (for real-time updates)
    async getRecentMessages(sinceTimestamp: string): Promise<IndexedMessage[]> {
      const query = `
        query GetRecentMessages($sinceTimestamp: String!) {
          table(where: {time: {_gt: $sinceTimestamp}}, order_by: {time: desc}) {
            author_address
            time
            message
          }
        }
      `;
  
      try {
        const data = await this.executeQuery(query, { sinceTimestamp });
        return data.table || [];
      } catch (error) {
        console.error('Error fetching recent messages:', error);
        return [];
      }
    }
  
    // Get message count
    async getMessageCount(): Promise<number> {
      const query = `
        query GetMessageCount {
          table_aggregate {
            aggregate {
              count
            }
          }
        }
      `;
  
      try {
        const data = await this.executeQuery(query);
        return data.table_aggregate?.aggregate?.count || 0;
      } catch (error) {
        console.error('Error fetching message count:', error);
        return 0;
      }
    }
  
    // Real-time polling for new messages
    async pollForNewMessages(
      lastTimestamp: string,
      callback: (newMessages: IndexedMessage[]) => void,
      intervalMs: number = 5000
    ): Promise<() => void> {
      let currentTimestamp = lastTimestamp;
      
      const poll = async () => {
        try {
          const newMessages = await this.getRecentMessages(currentTimestamp);
          
          if (newMessages.length > 0) {
            callback(newMessages);
            // Update timestamp to the most recent message
            currentTimestamp = newMessages[0].time;
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      };
  
      // Start polling
      const intervalId = setInterval(poll, intervalMs);
      
      // Return cleanup function
      return () => clearInterval(intervalId);
    }
  }
  
  // Utility functions for the highway billboard
  export function formatTimestamp(timestamp: string): string {
    // Convert microseconds to milliseconds for JavaScript Date
    const date = new Date(parseInt(timestamp) / 1000);
    return date.toLocaleString();
  }
  
  export function shortenAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  export function getTimeSince(timestamp: string): string {
    const now = Date.now();
    const messageTime = parseInt(timestamp) / 1000; // Convert from microseconds
    const diffMs = now - messageTime;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
  
  // Default client instance
  export const billboardIndexer = new BillboardIndexerClient();