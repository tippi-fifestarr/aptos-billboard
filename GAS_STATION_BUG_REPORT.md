# Gas Station Sponsored Transactions Bug Report

## Issue Summary
Gas Station integration appears to be properly configured but transactions are NOT being sponsored. Users are still being charged network fees despite following MCP guidance and proper configuration.

## Environment
- **Network**: Aptos Testnet
- **Framework**: Next.js 15.3.3 with React 18
- **SDK Version**: @aptos-labs/ts-sdk v3.0.0
- **Wallet Adapter**: @aptos-labs/wallet-adapter-react v6.1.2
- **Gas Station Client**: @aptos-labs/gas-station-client v2.0.2
- **Wallets Tested**: Petra Wallet, Aptos Connect (Google)

## Expected Behavior
Transactions should be sponsored by the gas station, showing 0 APT network fees to users.

## Actual Behavior
- **Petra Wallet**: Shows "Network fee: 0.00000600 APT" - user is charged
- **Google/Aptos Connect**: Shows "Network Fee: 0.000038 APT" - user is charged

## Configuration Details

### 1. Gas Station API Key
- **API Key**: `aptoslabs_[REDACTED]` (from "highway" application)
- **Application**: "highway" (Gas Station type "Gs")
- **Network**: testnet
- **Organization**: sasha-letchinger-devdocs-work

### 2. Contract Function Being Called
```
0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard::send_message
```

### 3. WalletProvider Configuration (Following MCP Guidance)
```typescript
// Create Gas Station client for sponsored transactions (MCP-guided approach)
const gasStationTransactionSubmitter = new GasStationTransactionSubmitter({
  network: Network.TESTNET,
  apiKey: GAS_STATION_API_KEY,
});

// Configure Aptos client with Gas Station plugin
const config = new AptosConfig({
  network: Network.TESTNET,
  pluginSettings: {
    TRANSACTION_SUBMITTER: gasStationTransactionSubmitter,
  },
});

const aptosClient = new Aptos(config);

// Inject into wallet adapter
<AptosWalletAdapterProvider
  dappConfig={{
    network: Network.TESTNET,
    transactionSubmitter: aptosClient.config.getTransactionSubmitter(),
  }}
>
```

### 4. Console Logs (Confirming Proper Setup)
```
🛣️ Highway Billboard Gas Station Configuration:
Network: testnet
API Key loaded: true
API Key prefix: aptoslabs_4LqT6avuF1...
Gas Station Submitter created: true
Aptos client configured with gas station: true
```

### 5. Transaction Submission
Using wallet adapter's `signAndSubmitTransaction`:
```typescript
const transaction = {
  data: {
    function: `0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard::send_message`,
    functionArguments: [CONTRACT_ADDRESS, message],
  },
};

const response = await signAndSubmitTransaction(transaction);
```

## Steps to Reproduce
1. Set up gas station with API key from Aptos Build
2. Configure `GasStationTransactionSubmitter` with proper network and API key
3. Inject into `AptosWalletAdapterProvider` via `transactionSubmitter` property
4. Submit transaction using `signAndSubmitTransaction` from wallet adapter
5. Observe that user is still charged network fees

## Investigation Attempts

### 1. MCP-Recommended Approach (FAILED)
**Configuration**:
- `GasStationTransactionSubmitter` constructor
- Production endpoints
- `@aptos-labs/gas-station-client@2.0.2`

**Result**: Proper initialization, but transactions still charge users.

### 2. Chess Repo Approach (ALSO FAILED)
Found working gas station implementation at https://github.com/banool/aptos-chess and replicated their exact approach:

**Configuration**:
- `createGasStationClientRaw` function
- Staging endpoints: `https://api.testnet.staging.aptoslabs.com/*`
- `@aptos-labs/gas-station-client@1.1.1` (downgraded)
- Manual Bearer token authorization

**Console Output** (Shows proper setup):
```
🛣️ Highway Billboard Gas Station Configuration (Chess approach):
Network: testnet
API Key loaded: true
Gas Station Raw Client created: true
Aptos client configured with staging gas station: true
```

**Result**: Still charges users despite identical configuration to working chess repo.

### 3. MCP Tool Creation Attempts
Tried creating new gas station applications via MCP tools but consistently received:
```
❌ Failed to create Gas Station application: Error: Failed to create api key: {"code":400,"message":"error deserializing procedure arguments"}
```

### 4. Different API Keys Tested
- `aptoslabs_[REDACTED_1]` (highwaygasstation)
- `aptoslabs_[REDACTED_2]` (highway)

Both approaches show proper initialization but no actual sponsorship.

## Suspected Issues

### 1. Function Whitelisting
The gas station applications may not have the specific contract function whitelisted for sponsorship:
`0x24051bca580d28e80a340a17f87c99def0cc0bde05f9f9d88e8eebdfad1cfb03::billboard::send_message`

### 2. Domain/Origin Configuration
Gas station may need explicit origin whitelisting for:
- `http://localhost:3000` (development)
- `https://a-highway-billboard.vercel.app` (production)

### 3. SDK Version Compatibility
Possible incompatibility between:
- `@aptos-labs/ts-sdk` v3.0.0
- `@aptos-labs/gas-station-client` v2.0.2
- `@aptos-labs/wallet-adapter-react` v6.1.2

## Questions for Aptos Team

1. **Function Whitelisting**: How do we configure gas stations to sponsor specific contract functions? Is this done in the Build dashboard?

2. **MCP Tool Issues**: Why are the MCP gas station creation tools failing with deserialization errors?

3. **Integration Verification**: Is our integration approach correct per the latest SDK versions?

4. **Debug Tools**: Are there any debug tools or logs we can check to see why sponsorship isn't working?

5. **Manual Configuration**: Can gas station function whitelisting be done manually through the Build dashboard?

## Repository
- **Code**: https://github.com/tippi-fifestarr/aptos-billboard
- **Branch**: `fix/ux-gas-station`
- **Live Site**: https://a-highway-billboard.vercel.app/

## Impact
This prevents seamless user onboarding as intended by gas stations. Users still need APT tokens for gas fees, defeating the purpose of sponsored transactions.

---

*Generated on 2025-09-16 by tippi fifestarr working with Claude Code*