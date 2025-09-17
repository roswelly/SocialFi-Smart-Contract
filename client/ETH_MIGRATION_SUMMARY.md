# ETH Migration Summary

## Overview
This document summarizes the changes made to migrate the Pump-UI project from using BONE tokens on Shibarium to ETH on Ethereum mainnet.

## Changes Made

### 1. Chain Configuration (`src/chain/config.ts`)
- Updated from `shibarium` to `mainnet` (Ethereum mainnet)
- Removed Flare chain configuration
- Updated chain configuration object names and references

### 2. Token Symbol References
Updated all UI references from "BONE" to "ETH":

#### Components Updated:
- `src/pages/token/[address].tsx` - Token trading interface
- `src/components/notifications/PurchaseConfirmationPopup.tsx` - Purchase confirmation dialog
- `src/components/PriceLiquidity.tsx` - Price and liquidity display
- `src/components/notifications/LiveNotifications.tsx` - Live transaction notifications
- `src/components/notifications/HowItWorksPopup.tsx` - How it works information
- `src/components/charts/TradingViewChart.tsx` - Trading view chart
- `src/components/charts/pol` - Price chart component
- `src/pages/profile/[address].tsx` - User profile page
- `src/pages/FAQ.tsx` - FAQ page
- `src/components/TokenDetails/TokenInfo.tsx` - Token information display
- `src/components/TokenDetails/TransactionHistory.tsx` - Transaction history
- `src/pages/dashboard.tsx` - Dashboard page
- `src/pages/index.tsx` - Home page
- `src/components/tokens/TokenCard.tsx` - Token card component

### 3. Blockchain Explorer URLs
Updated all blockchain explorer URLs from Shibarium to Ethereum mainnet:

#### From:
- `https://shibariumscan.io/` → `https://etherscan.io/`
- `https://www.shibariumscan.io/` → `https://etherscan.io/`

#### Updated in:
- `src/utils/blockchainUtils.ts` - Transaction explorer URLs
- `src/utils/api.ts` - Token holder API calls
- `src/components/charts/TradingViewChart.tsx` - Transaction and swap links
- `src/components/charts/pol` - Transaction and swap links
- `src/pages/dashboard.tsx` - Address click handlers
- `src/components/TokenDetails/TransactionHistory.tsx` - Transaction and address links
- `src/components/TokenDetails/TokenInfo.tsx` - Contract address links
- `src/pages/profile/[address].tsx` - Address click handlers

### 4. DEX Integration
Updated DEX integration from Chewyswap to Uniswap:

#### From:
- `https://chewyswap.dog/swap/?outputCurrency=${token.address}&chain=shibarium`
- `https://chewyswap.dog/swap/?outputCurrency=${token.address}&chain=shibarium`

#### To:
- `https://app.uniswap.org/swap?outputCurrency=${token.address}&chain=mainnet`

#### Updated in:
- `src/components/charts/TradingViewChart.tsx`
- `src/components/charts/pol`
- `src/components/tokens/TokenCard.tsx`
- `src/utils/api.ts` - Comment update

### 5. API Integration
- Updated token holder API calls to use Etherscan API instead of Shibarium API
- Added requirement for `ETHERSCAN_API_KEY` environment variable

### 6. Documentation
- Updated `README.md` to reflect Ethereum mainnet contract address requirement

## Environment Variables Required

### New/Updated Variables:
```bash
# Ethereum Mainnet Contract Address
NEXT_PUBLIC_BONDING_CURVE_ADDRESS="ethereum-mainnet-contract-address"

# Etherscan API Key (for token holder data)
ETHERSCAN_API_KEY="your_etherscan_api_key"

# Update existing variables for Ethereum mainnet
NEXT_PUBLIC_API_BASE_URL="ethereum-mainnet-backend-url"
NEXT_PUBLIC_WS_BASE_URL="ethereum-mainnet-websocket-url"
NEXT_PUBLIC_BLOCKSCOUT_URL="https://etherscan.io"
```

## Next Steps Required

### 1. Smart Contract Deployment
- Deploy the `BondingCurveManager` contract to Ethereum mainnet
- Update the `NEXT_PUBLIC_BONDING_CURVE_ADDRESS` environment variable

### 2. Backend API Updates
- Update backend API endpoints to work with Ethereum mainnet
- Ensure all blockchain event listeners are configured for Ethereum mainnet
- Update any chain-specific logic in the backend

### 3. Environment Configuration
- Set up all required environment variables for Ethereum mainnet
- Obtain Etherscan API key for token holder data
- Update API base URLs and WebSocket URLs

### 4. Testing
- Test token creation on Ethereum mainnet
- Test buying/selling tokens with ETH
- Verify all blockchain explorer links work correctly
- Test DEX integration with Uniswap

### 5. Gas Fee Considerations
- Ethereum mainnet has higher gas fees than Shibarium
- Consider implementing gas estimation and user warnings
- May need to adjust UI to show gas costs more prominently

## Important Notes

1. **Gas Fees**: Ethereum mainnet gas fees are significantly higher than Shibarium. Users should be informed about this.

2. **Network Congestion**: Ethereum mainnet can experience congestion, which may affect transaction confirmation times.

3. **Contract Verification**: Ensure the deployed smart contract is verified on Etherscan for transparency.

4. **Testing**: Thoroughly test on Ethereum testnets (Goerli/Sepolia) before deploying to mainnet.

5. **User Experience**: Consider adding network switching functionality if you plan to support multiple chains in the future.

## Rollback Plan

If issues arise, the project can be rolled back by:
1. Reverting the chain configuration to Shibarium
2. Restoring BONE token references
3. Updating blockchain explorer URLs back to Shibarium
4. Restoring Chewyswap integration

## Support

For any issues or questions regarding this migration, please refer to:
- Ethereum mainnet documentation
- Etherscan API documentation
- Uniswap integration guides
