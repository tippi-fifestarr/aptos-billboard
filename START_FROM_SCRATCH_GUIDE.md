# Simple Test: Sponsored Transaction Posting

**Goal**: Test if MCP can make users post messages WITHOUT paying gas fees.

## The Test

Build a minimal page where:
1. User connects Petra wallet OR Google login
2. User posts a message to the blockchain
3. **User pays 0 APT gas fees** (sponsored by gas station)

## Contract Details

- **Address**: `0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard`
- **Function**: `send_message(billboard_address: address, message: string)`
- **Network**: Aptos Testnet

## Requirements

- Next.js + React
- Support Petra and Google wallets
- **Sponsored transactions using Aptos Gas Station**
- Function to sponsor: `send_message`

## Success Criteria

- [ ] Petra wallet: Posts message with 0 APT gas fee
- [ ] Google login: Posts message with 0 APT gas fee
- [ ] Messages successfully stored on blockchain

That's it. No UI complexity, no indexer, no real-time updates. Just test: **can both wallets post sponsored messages?**