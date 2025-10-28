'use client'

import ServerSideKYC from '@/components/ServerSideKYC'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-brand py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Zero-Knowledge KYC Verification
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Prove you're over 18 using zero-knowledge proofs powered by Polygon ID.
          </p>
        </div>
      </section>

      {/* KYC Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <ServerSideKYC />
        </div>
      </section>
    </div>
  )
}
