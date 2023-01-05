import ReactDOM from 'react-dom/client'
import App from './App'

import { BrowserRouter as Router } from 'react-router-dom'

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import './index.css'


const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [
    alchemyProvider({ apiKey: 'WyBFuEnjTohf0DtDBV1araDXubDTXAJL' }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <Router>
        <App />
      </Router>
    </RainbowKitProvider>
  </WagmiConfig>
)