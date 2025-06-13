# 🛣️ Highway Billboard - Blockchain Messaging dApp

> **Drive the blockchain highway and post your messages on digital billboards!**

A real-time blockchain messaging application that demonstrates the power of Aptos Build's No-Code Indexer, combining intuitive highway metaphors with cutting-edge Web3 technology.

![Highway Billboard Preview](./screenshot.png)

## 🎯 Project Mission

This project serves as a comprehensive demonstration and testing ground for three core Aptos features:
- **📊 No-Code Indexer** - Real-time blockchain data processing
- **⛽ Gas Station** - Transaction sponsoring for seamless UX  
- **🔐 Aptos Connect** - Social login integration

Built for DevDocs.work as part of Aptos client engagement to improve developer experience and provide real-world feedback on Aptos Build tools.

## ✨ Features

### Current Implementation
- **🎨 Highway-Themed UI** - Beautiful, intuitive interface using highway metaphors
- **📱 Real-Time Data** - Live billboard updates via Aptos No-Code Indexer
- **🚗 Mile Markers** - Messages displayed as highway mile markers
- **⭐ Featured Billboard** - Prominent display of recent messages
- **📍 Community Engagement** - Multi-user message posting

### Planned Features
- **⛽ Gas Station Integration** - Sponsored transactions for new users
- **🔑 Social Login** - Google OAuth via Aptos Connect
- **💰 Premium Billboards** - Pay APT for featured placement
- **⏰ Time-Based Ads** - Billboard rental system

## 🏗️ Technical Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Aptos Blockchain │    │  No-Code Indexer │
│                 │    │                  │    │                 │
│  Highway UI     │◄──►│  Billboard       │────►│  Real-time      │
│  Components     │    │  Smart Contract  │    │  Data Processing│
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Smart Contract
- **Language**: Move
- **Network**: Aptos Testnet
- **Contract**: `billboard::billboard`
- **Key Functions**:
  - `initialize_billboard` - Create new billboard
  - `send_message` - Post message to billboard
  - `get_all_messages` - Retrieve all messages

### Frontend Stack
- **Framework**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Blockchain**: Aptos TypeScript SDK
- **Real-time Data**: GraphQL via No-Code Indexer
- **Dev Tools**: Turbopack for fast development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Aptos CLI 7.4.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/highway-billboard
   cd highway-billboard
   ```

2. **Install dependencies**
   ```bash
   cd billboard-frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your indexer API URL and admin secret
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit the highway!**
   Open [http://localhost:3000](http://localhost:3000)

### Smart Contract Deployment

1. **Navigate to contract directory**
   ```bash
   cd billboard-contract
   ```

2. **Deploy to testnet**
   ```bash
   aptos move publish --named-addresses billboard=default
   ```

3. **Initialize your billboard**
   ```bash
   aptos move run --function-id default::billboard::initialize_billboard --args u64:10
   ```

4. **Post your first message**
   ```bash
   aptos move run --function-id default::billboard::send_message --args address:default string:"Hello Highway!"
   ```

## 📊 No-Code Indexer Setup

Our implementation showcases Aptos Build's No-Code Indexer for real-time data processing:

### Configuration
- **Event Source**: `MessageAdded` events from billboard contract
- **Database Schema**: 
  - `author_address` (blockchain address)
  - `time` (timestamp in microseconds)
  - `message` (billboard content)
- **API Type**: GraphQL with Hasura admin interface

### Key Learnings
✅ **When it works**: Provides excellent real-time data updates  
⚠️ **Setup complexity**: Requires technical debugging for authentication  
📚 **Documentation gaps**: Auth methods need clearer explanation  

*See detailed feedback in our [Developer Experience Report](./docs/developer-experience.md)*

## 🎨 Highway Metaphor Design

Our UI transforms blockchain concepts into familiar highway experiences:

| Blockchain Concept | Highway Metaphor | UI Element |
|-------------------|------------------|------------|
| Account Balance | Gas Tank | ⛽ Gas Gauge |
| Transaction Fee | Fuel Cost | Gas Price Display |
| Message Posting | Billboard Rental | Featured Billboard |
| Browsing Messages | Driving Highway | Mile Markers |
| Wallet Connection | Gas Station | Connect Button |

## 🔧 Configuration

### Environment Variables

```env
# Indexer Configuration
NEXT_PUBLIC_INDEXER_API_URL=https://api.testnet.aptoslabs.com/nocode/v1/manage/your-id/v1/graphql
NEXT_PUBLIC_HASURA_ADMIN_SECRET=your-admin-secret

# Contract Configuration  
NEXT_PUBLIC_CONTRACT_ADDRESS=0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03
NEXT_PUBLIC_NETWORK=testnet
```

### Key Files Structure

```
highway-billboard/
├── billboard-contract/          # Move smart contract
│   ├── sources/billboard.move   # Main contract logic
│   └── Move.toml               # Contract configuration
├── billboard-frontend/          # React application
│   ├── src/
│   │   ├── components/Highway/  # Highway-themed components
│   │   ├── lib/
│   │   │   ├── billboardService.ts    # Blockchain interaction
│   │   │   └── indexerClient.ts       # Real-time data client
│   │   └── app/page.tsx         # Main highway interface
│   └── tailwind.config.js       # Styling configuration
└── docs/                        # Documentation
```

## 📈 Live Data & Analytics

**Active Billboard Stats**:
- 🎯 **8 Messages Posted** across multiple users
- 👥 **2 Active Users** engaging with the platform  
- ⚡ **Real-time Updates** via indexer processing
- 🏆 **Featured**: "Hooty from tippi onchain"

**Community Messages**:
- "is it free?" 
- "finale?"
- "freeee"
- "good day"
- "hooooooty"

## 🛣️ Roadmap

### Phase 1: Core Functionality ✅
- [x] Smart contract deployment
- [x] No-code indexer integration  
- [x] Highway-themed frontend
- [x] Real-time message display

### Phase 2: Enhanced UX (In Progress)
- [ ] Aptos Connect social login
- [ ] Gas Station transaction sponsoring
- [ ] Wallet connection interface
- [ ] Message posting via frontend

### Phase 3: Premium Features
- [ ] APT payment for featured placement
- [ ] Time-based billboard rentals
- [ ] Message categories and filtering
- [ ] Advanced highway analytics

### Phase 4: Production Ready
- [ ] Mainnet deployment
- [ ] Performance optimization  
- [ ] Advanced error handling
- [ ] Comprehensive testing suite

## 🤝 Contributing

We welcome contributions that improve the developer experience and showcase Aptos Build features!

### Development Setup
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Submit pull request with detailed description

### Feedback Areas
- **No-Code Indexer UX** improvements
- **Highway UI/UX** enhancements  
- **Gas Station** integration examples
- **Documentation** improvements

## 📖 Documentation

- [Developer Experience Report](./docs/developer-experience.md) - Detailed setup journey and feedback
- [Smart Contract Guide](./docs/smart-contract.md) - Move development details
- [Frontend Architecture](./docs/frontend-architecture.md) - React implementation guide
- [Indexer Integration](./docs/indexer-setup.md) - No-code indexer configuration

## 🐛 Known Issues & Workarounds

### Authentication Setup
- **Issue**: No-code indexer requires manual endpoint discovery
- **Workaround**: Use `/manage/` endpoint with `x-hasura-admin-secret` header
- **Status**: Reported to Aptos team for documentation improvement

### Table Tracking
- **Issue**: Database tables not automatically exposed in GraphQL
- **Workaround**: Manually click "Track" in Hasura console
- **Status**: Expected behavior, needs better user guidance

## 📞 Support & Contact

**Project Maintainer**: tippi (DevDocs.work)  
**Client**: Aptos Labs  
**Purpose**: Developer experience improvement & feature feedback

For technical questions or feedback:
- Create GitHub issue with detailed description
- Include console logs and steps to reproduce
- Tag with appropriate labels (bug/enhancement/feedback)

---

## 🎉 Acknowledgments

Special thanks to:
- **Aptos Labs** for innovative blockchain infrastructure
- **DevDocs.work** for developer documentation expertise  
- **Community Contributors** who posted messages and tested the platform
- **Alice & Bob** (our AI development assistants) for debugging support! 🤖

---

*Built with ❤️ for the Aptos ecosystem*

**Ready to drive the blockchain highway? Start your engines! 🚗💨**