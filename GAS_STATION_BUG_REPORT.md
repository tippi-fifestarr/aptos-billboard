# Gas Station Sponsored Transactions Report (Resolved)

> Outcome: Sponsored transactions now work for both Petra and Aptos Connect on Testnet. The final fix was to submit transactions with `withFeePayer: true`, cap gas to match the Gas Station rule (e.g., `maxGasAmount: 50`, `gasUnitPrice: 100`), and pass a per-transaction `transactionSubmitter` for Aptos Connect. Dependencies were also aligned to the latest compatible versions.

## Issue Summary
Gas Station integration appears to be properly configured but transactions are NOT being sponsored. Users are still being charged network fees despite following MCP guidance and proper configuration.

## Environment

### At time of issue (broken)
- **Network**: Aptos Testnet
- **Framework**: Next.js 15.3.3 with React 18
- **SDK Version**: @aptos-labs/ts-sdk v3.0.0
- **Wallet Adapter**: @aptos-labs/wallet-adapter-react v6.1.2
- **Gas Station Client**: @aptos-labs/gas-station-client v2.0.2
- **Wallets Tested**: Petra Wallet, Aptos Connect (Google)

### Resolution environment (working)
- **Framework**: Next.js 15.5.x with React 18
- **SDK Version**: @aptos-labs/ts-sdk ^3.1.3
- **Wallet Adapter**: @aptos-labs/wallet-adapter-react ^7.0.7
- **Gas Station Client**: @aptos-labs/gas-station-client ^2.0.3

## Expected Behavior
Transactions should be sponsored by the gas station, showing 0 APT network fees to users.

## Actual Behavior (before fix)
- **Petra Wallet**: Sometimes charged fees depending on config
- **Aptos Connect (Google)**: Showed fee prompts; required user APT

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

### 3. WalletProvider Configuration (initial)
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

### 5. Transaction Submission (initial)
Using wallet adapter's `signAndSubmitTransaction` without fee payer:
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

### 1. MCP-Recommended Approach (initially failed)
**Configuration**:
- `GasStationTransactionSubmitter` constructor
- Production endpoints
- `@aptos-labs/gas-station-client@2.0.2`

**Result**: Proper initialization, but transactions still charge users.

### 2. Chess Repo Approach (also failed initially)
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

## Investigation Findings

### Function Whitelisting Status ✅
**RESOLVED**: Verified via Build dashboard that `send_message` function is properly whitelisted and shows "CONFIGURED" status in both gas station applications tested.

### Gas Station Application Mismatch 🔍
**DISCOVERED**: Production Vercel deployment (which worked in June) uses API key from `highwaygasstation` application:
- **Working Production Key**: `aptoslabs_SCzXNuu7DpW_...` (from `highwaygasstation` app)
- **Failing Local Key**: `aptoslabs_4LqT6avuF1A_...` (from `highway` app)

Both applications have `send_message` function configured, but exhibit different behavior.

### Integration Approach Analysis 🔍
- We confirmed a working pattern in a minimal gastest app using: `withFeePayer: true`, gas caps aligned to the Gas Station rule, and passing a per-transaction `transactionSubmitter`.
- The main page already supported Petra sponsorship; Aptos Connect still required an explicit per-transaction `transactionSubmitter`.

### Test Results
1. **MCP-Recommended Approach**: Failed despite proper configuration
2. **Chess Repo Replication**: Failed despite matching working repository exactly
3. **Production Key Test**: Still fails locally even with working production API key

### Domain/Environment Hypothesis 🤔
Gas station may work in production (Vercel) but not locally due to:
- Domain allowlisting restrictions (localhost not whitelisted)
- Environment-specific configurations
- Origin header validation

## Final Fix (Working Solution)

1. Ensure packages are on compatible versions:
   - `@aptos-labs/ts-sdk`: ^3.1.3
   - `@aptos-labs/gas-station-client`: ^2.0.3
   - `@aptos-labs/wallet-adapter-react`: ^7.0.7
   - React 18, Next.js 15.5.x

2. Configure the transaction with fee payer and gas caps that match the Gas Station rule:
```ts
await signAndSubmitTransaction({
  data: {
    function: `${BILLBOARD_ADDRESS}::billboard::send_message`,
    functionArguments: [BILLBOARD_ADDRESS, message],
  },
  withFeePayer: true,
  options: {
    maxGasAmount: 50,
    gasUnitPrice: 100,
  },
  // Critical for Aptos Connect
  transactionSubmitter: new GasStationTransactionSubmitter({
    network: Network.TESTNET,
    apiKey: GAS_STATION_API_KEY,
  }),
});
```

3. Keep the provider-level `transactionSubmitter` for Petra convenience, but pass a per-transaction `transactionSubmitter` to support Aptos Connect consistently.

4. Environment variable compatibility: support both `NEXT_PUBLIC_GAS_STATION_API_KEY` and `NEXT_PUBLIC_APTOS_GAS_STATION_API_KEY`.

Result: Petra and Aptos Connect both submit sponsored transactions (0 APT fees) against the configured rule.

## Repository
- **Code**: https://github.com/tippi-fifestarr/aptos-billboard
- **Branch**: `fix/ux-gas-station`
- **Live Site**: https://a-highway-billboard.vercel.app/

## Impact
Sponsored transactions now work across Petra and Aptos Connect, restoring a consistent onboarding UX with 0 APT fees.

---

---

Timeline
- Initial failures reproduced locally despite proper-looking setup.
- Identified Gas Station rule cap mismatch (200000 default vs 50 allowed) and added gas caps.
- Added `withFeePayer: true` to signal fee payer usage.
- Aligned dependency versions to latest compatible line.
- Added per-transaction `transactionSubmitter` to fix Aptos Connect flow.

This document reflects the journey and the final working solution.