import { Chain } from 'viem'
import { mainnet } from 'wagmi/chains'

interface ChainConfig {
  apiBaseUrl: string
  wsBaseUrl: string
  blockscoutUrl: string
  dexTarget: number
  contractAddresses: string[]
}

interface ChainConfigs {
  [chainId: number]: ChainConfig
}

// Ethereum Mainnet Chain Configuration
const ethereumConfig: ChainConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL!,
  blockscoutUrl: process.env.NEXT_PUBLIC_BLOCKSCOUT_URL!,
  dexTarget: Number(process.env.NEXT_PUBLIC_DEX_TARGET),
  contractAddresses: [
    process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS!,
  ].filter(Boolean)
}

// Chain configurations mapped by chainId
export const chainConfigs: ChainConfigs = {
  [mainnet.id]: ethereumConfig,
}

// Supported chains for the application
export const supportedChains: Chain[] = [mainnet]

// Helper function to get chain configuration by chainId
export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return chainConfigs[chainId]
}

// Helper function to get current active contract address for a chain
export const getActiveContractAddress = (chainId: number): string | undefined => {
  const config = chainConfigs[chainId]
  return config?.contractAddresses[0] // Returns the most recent contract address
}
