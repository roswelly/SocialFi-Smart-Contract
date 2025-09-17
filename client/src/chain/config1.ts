import { createConfig, http } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors'

export const config1 = getDefaultConfig({
    appName: 'Crossfun',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet],
    ssr: true, // If your dApp uses server side rendering (SSR)
});



export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http('https://mainnet.infura.io/v3/3235e327579e4c648e2b34fc73607c18'),
  },
})