'use client';

import Dashboard from '@/components/Dashboard';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">⚠️ Wallet Not Connected</h1>
          <p className="text-muted-foreground">Please connect your wallet to view the dashboard</p>
          <Link href="/">
            <Button>Go Home & Connect Wallet</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
        
        <Dashboard />
      </div>
    </main>
  );
}