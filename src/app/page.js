'use client';
import Link from 'next/link'; 
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/lib/utils';
import KYCForm from '@/components/KYCForm';

export default function Home() {
  const { isConnected, address, connectWallet, disconnect, isConnecting, chainId } = useWallet();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Privacy-First KYC Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify your identity using zero-knowledge proofs without revealing personal data
          </p>
        </div>

        <div className="flex justify-center">
  <Link href="/dashboard">
    <Button variant="outline" size="lg">
      📊 View Dashboard
    </Button>
  </Link>
</div>




        {/* Wallet Connection Card */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>
              Connect your MetaMask to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Connected: {truncateAddress(address)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Chain ID: {chainId} {chainId === 11155111 ? '(Sepolia)' : ''}
                  </p>
                </div>
                <Button 
                  onClick={disconnect}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Form - Only show when wallet is connected */}
        {isConnected && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <KYCForm />
          </div>
        )}

        {/* Info Section */}
        <div className="pt-8 border-t">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔒 Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Your data never leaves your device. Only zero-knowledge proofs are shared.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ Fast Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Instant proof generation and verification using advanced cryptography.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🌐 Decentralized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Built on blockchain technology for transparency and security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}