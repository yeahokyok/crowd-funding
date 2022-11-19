import React from 'react'
import ReactDOM from 'react-dom/client'
import { chain, createClient, configureChains, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { ConnectKitProvider } from 'connectkit'
import { ChakraProvider } from '@chakra-ui/react'

import App from './App'
import './index.css'

const { chains, provider } = configureChains(
    [chain.hardhat, chain.goerli],

    [
        jsonRpcProvider({
            rpc: () => ({
                http: process.env.REACT_APP_RPC_URL,
            }),
        }),
        alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY }),
    ],
)

const connectors = [new MetaMaskConnector({ chains: chains })]

const client = createClient({
    autoConnect: true,
    provider: provider,
    connectors: connectors,
})

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <WagmiConfig client={client}>
            <ConnectKitProvider>
                <ChakraProvider>
                    <App />
                </ChakraProvider>
            </ConnectKitProvider>
        </WagmiConfig>
    </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
