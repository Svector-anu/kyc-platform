import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Billions - Zero-Knowledge KYC for Humans & AI Agents',
  description: 'Generate private proofs of eligibility without revealing personal data.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logob.png"
                alt="Billions Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold" style={{ color: '#000000' }}>Billions</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/agents" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Agents
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: '#0046FF' }}
            >
              Verify with ZKP
            </Link>
          </div>
        </nav>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="border-t border-gray-200 py-8 px-4 mt-20">
          <div className="container mx-auto text-center">
            <p className="text-sm text-gray-500">
              © 2025 Billions. Powered by <span className="font-semibold">Polygon ID</span> & <span className="font-semibold">Zero-Knowledge Cryptography</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
