'use client'

import { useWallet } from '@/context/WalletContext'

export default function ConnectWalletButton() {
  const { address, isConnected } = useWallet()

  const handleConnect = () => {
    // Reown AppKit modal opens automatically when clicking appkit-button
    if (typeof window !== 'undefined') {
      const button = document.querySelector('appkit-button')
      if (button) {
        button.click()
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {isConnected && address ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono hidden lg:block">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <appkit-button />
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-secondary transition-all active:scale-95"
        >
          Connect Wallet
        </button>
      )}

      {/* Hidden Reown button that handles the actual connection */}
      <div className="hidden">
        <appkit-button />
      </div>
    </div>
  )
}
