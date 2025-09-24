# Clean Test Environment Prompt

Use this prompt in a fresh Claude Code instance within an empty folder to validate MCP guidance:

```
In this empty folder, create the most minimal full-stack Aptos dApp to test gas station sponsored transactions following ONLY MCP guidance:

Requirements:
- Use MCP tools exclusively to scaffold everything (let MCP choose the frontend framework)
- Ultra-simple Move contract with one function that emits an event
- Deploy contract to testnet and verify it works normally (user pays gas)
- Frontend supporting both Petra wallet and Google login
- Configure gas station to sponsor the contract function using ONLY MCP guidance
- Test that BOTH wallet types can call the function with 0 APT fees
- Follow MCP guidance exactly as documented (don't add any undocumented patterns)
- Do NOT add any parameters not explicitly shown in MCP docs
- Do NOT reference any external examples or working implementations

Success Criteria:
Both Petra and Google wallets can post transactions with 0 APT cost following pure MCP guidance.

If this fails, document the exact error and what parameter was needed to fix it.
```

Expected Result: Following pure MCP guidance will fail without the missing parameters we've identified.