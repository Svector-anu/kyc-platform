'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { baseSepolia, base } from '@reown/appkit/networks'
import { BrowserProvider } from 'ethers'

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    // Initialize Reown AppKit
    const projectId = '320a33bb15f6c040c88fa6c332ee2ff4'

    const metadata = {
      name: 'Billions - KYC Platform',
      description: 'Zero-knowledge identity for humans and AI agents',
      url: 'http://localhost:3000',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }

    const modal = createAppKit({
      adapters: [new EthersAdapter()],
      networks: [baseSepolia, base],
      defaultNetwork: baseSepolia,
      projectId,
      metadata,
      features: {
        analytics: false
      }
    })

    // Subscribe to account changes
    const unsubscribe = modal.subscribeAccount((account) => {
      if (account.address) {
        setAddress(account.address)
        setIsConnected(true)

        // Save to localStorage for backward compatibility
        localStorage.setItem('walletAddress', account.address)

        // Get provider
        if (window.ethereum) {
          const ethersProvider = new BrowserProvider(window.ethereum)
          setProvider(ethersProvider)
        }
      } else {
        setAddress(null)
        setIsConnected(false)
        setProvider(null)
        localStorage.removeItem('walletAddress')
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const value = {
    address,
    isConnected,
    provider
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
