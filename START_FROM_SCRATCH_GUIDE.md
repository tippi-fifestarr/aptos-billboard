# Highway Billboard dApp - Product Requirements Document

Build a full-stack blockchain messaging application where users can post messages to a virtual highway billboard.

## Product Vision

Create a highway-themed messaging platform where users drive down a digital highway and can post messages on billboards for other travelers to see. The experience should feel intuitive and fun, using highway metaphors throughout.

## Core Features

### 1. Highway-Themed Interface
- **Visual Design**: Highway/road aesthetic with billboards, gas stations, mile markers
- **Color Scheme**: Highway blues, road grays, warning oranges, billboard yellows
- **Typography**: Clear, bold fonts suitable for highway signage

### 2. Message Posting System
- Users can post short messages (max 100 characters) to the highway billboard
- Messages are stored on the Aptos blockchain
- Real-time updates when new messages are posted
- Display recent messages as "mile markers" along the highway

### 3. Wallet Integration
- Support for Petra wallet and Google/social login via Aptos Connect
- **Sponsored Transactions**: Users should NOT pay gas fees (use Aptos Gas Station)
- Smooth onboarding experience for both crypto natives and newcomers

### 4. Real-Time Data
- Display all messages in real-time using Aptos No-Code Indexer
- Show message metadata: author address, timestamp
- Auto-refresh when new messages are posted

## Technical Requirements

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS
- **Network**: Aptos Testnet

### Blockchain Integration
- **Smart Contract**: Use existing deployed contract at `0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard`
- **Contract Functions**:
  - `initialize_billboard(max_messages: u64)` - already called
  - `send_message(billboard_address: address, message: string)` - for posting messages
  - `get_all_messages()` - for retrieving messages (via indexer)
- **Wallet Adapter**: Aptos wallet adapter for multi-wallet support
- **Gas Station**: Sponsored transactions for seamless UX (function: `send_message`)
- **Indexer**: Real-time data via GraphQL

### User Experience Flow

1. **Arrival**: User visits highway-themed landing page
2. **Connection**: "Pull into gas station" to connect wallet
3. **Posting**: Simple form to post message to billboard
4. **Reading**: Browse messages from other highway travelers
5. **Real-time**: See new messages appear automatically

## UI Components

### Highway Rest Stop (Wallet Connection)
- Gas station metaphor for wallet connection
- Clear options for Petra vs Google login
- Visual fuel gauge showing account balance

### Billboard Posting Station
- Highway billboard design for message input
- Character counter and validation
- Submit button: "Post to Highway"

### Message Display
- Featured billboard for latest message
- Mile markers for historical messages
- Scrollable highway view

## Success Criteria

### User Experience
- [ ] Zero gas fees for all users (sponsored transactions)
- [ ] Intuitive highway metaphors throughout
- [ ] Smooth wallet connection for both wallet types
- [ ] Real-time message updates

### Technical
- [ ] Messages stored permanently on Aptos blockchain
- [ ] GraphQL integration for real-time data
- [ ] Responsive design works on mobile and desktop
- [ ] Fast loading and smooth animations

### Business
- [ ] Demonstrates Aptos Build ecosystem capabilities
- [ ] Showcases seamless Web3 onboarding
- [ ] Provides foundation for future highway-themed features

## Future Enhancements (Out of Scope)

- User profiles and avatars
- Message reactions and threading
- Advanced search and filtering
- 3D highway visualization
- Weather effects and day/night cycles
- Analytics dashboard

## Technical Stack

```
Frontend: Next.js + React + Tailwind CSS
Blockchain: Existing contract at 0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard
Wallet: @aptos-labs/wallet-adapter-react
Gas Station: @aptos-labs/gas-station-client (sponsor send_message function)
Indexer: Aptos No-Code Indexer (GraphQL) - already configured
Deployment: Vercel
```

## Implementation Notes

- Contract is already deployed and initialized on Aptos Testnet
- Indexer is already set up and indexing message events
- Focus should be on frontend integration and gas station configuration
- The key challenge is getting sponsored transactions working for the `send_message` function

---

*Build a highway billboard that brings the joy of road trips to the blockchain.*