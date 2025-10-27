'use client'

import EnhancedKYCForm from '@/components/EnhancedKYCForm'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-brand py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Zero-knowledge KYC for humans and AI agents.
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Generate private proofs of eligibility without revealing personal data.
          </p>
        </div>
      </section>
      
      {/* KYC Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <EnhancedKYCForm />
        </div>
      </section>
    </div>
  )
}
