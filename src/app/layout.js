import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Billions - Zero-Knowledge KYC for Humans & AI Agents',
  description: 'Generate private proofs of eligibility without revealing personal data.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Billions</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/agents" className="text-sm font-medium hover:text-primary transition-colors">
                Agents
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-secondary transition-all active:scale-95"
            >
              Verify with ZKP
            </Link>
          </div>
        </nav>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="border-t border-border py-6 mt-20">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2025 Billions Network. Zero-knowledge identity for humans and AI agents.
          </div>
        </footer>
      </body>
    </html>
  )
}
