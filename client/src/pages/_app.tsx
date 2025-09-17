import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiConfig, createConfig, WagmiProvider } from 'wagmi'
import { supportedChains } from '@/chain/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';



const config = getDefaultConfig({
  appName: "Crossfun",
  projectId: "YOUR_PROJECT_ID",
  chains: supportedChains as any,
  ssr: true,
});


const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WebSocketProvider>
            <Component {...pageProps} />
          </WebSocketProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
      <ToastContainer />
    </WagmiProvider>
  )
}