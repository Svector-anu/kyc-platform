'use client';

import { useState } from 'react';
import KYCModal from './KYCModal';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleKYCSuccess = (credential) => {
    setIsModalOpen(false);
    // Navigate to dashboard with credential data
    router.push(`/dashboard?credentialId=${credential.credentialId}`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 text-white" style={{ backgroundColor: '#0046FF' }}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Zero-Knowledge<br />KYC Verification
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Prove you're over 18 using <span className="font-semibold text-yellow-300">zero-knowledge cryptography</span> powered by Polygon ID
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Complete KYC Verification
              </button>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Privacy-First</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Blockchain-Verified</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Instant Verification</span>
                </div>
              </div>

              {/* Brand */}
              <p className="text-sm text-white/60 mt-8">
                Powered by <span className="font-bold text-white">Billions</span>
              </p>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-auto">
              <path fill="#f9fafb" d="M0,32L48,37.3C96,43,192,53,288,56C384,59,480,53,576,48C672,43,768,37,864,37.3C960,37,1056,43,1152,45.3C1248,48,1344,48,1392,48L1440,48L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z"></path>
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Simple, secure, and privacy-preserving verification in 3 steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative p-8 bg-white rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 left-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: '#0046FF' }}>
                    1
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Submit Your Info</h3>
                  <p className="text-gray-600">
                    Provide basic information to create your verified credential on the blockchain
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-8 bg-white rounded-2xl shadow-lg border-2 hover:shadow-xl transition-shadow" style={{ borderColor: '#E6EFFF' }}>
                <div className="absolute -top-4 left-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: '#0046FF' }}>
                    2
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Generate Proof</h3>
                  <p className="text-gray-600">
                    Create a zero-knowledge proof that verifies your age without revealing your birthday
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-8 bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 left-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ backgroundColor: '#61DA53' }}>
                    3
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Get Verified</h3>
                  <p className="text-gray-600">
                    Receive instant verification and access your credential dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-gray-800">
                  Privacy & Security First
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your personal information is protected using military-grade zero-knowledge cryptography
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#61DA53' }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Zero-Knowledge Proofs</h4>
                      <p className="text-gray-600">Verify age without revealing your birthday</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#61DA53' }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Blockchain Secured</h4>
                      <p className="text-gray-600">Credentials anchored to Polygon Amoy network</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#61DA53' }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Instant Verification</h4>
                      <p className="text-gray-600">Complete verification in under 10 seconds</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#61DA53' }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Decentralized Identity</h4>
                      <p className="text-gray-600">You own and control your credentials</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: '#0046FF' }}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="relative text-white">
                    <svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-center mb-4">
                      Powered by Polygon ID
                    </h3>
                    <p className="text-center text-white/90">
                      Industry-leading zero-knowledge infrastructure trusted by enterprises worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Ready to Get Verified?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start your privacy-preserving KYC verification in seconds
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#0046FF' }}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Verification Now
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-200">
          <div className="container mx-auto text-center">
            <p className="text-sm text-gray-500">
              © 2025 Billions. Powered by <span className="font-semibold">Polygon ID</span> & <span className="font-semibold">Zero-Knowledge Cryptography</span>
            </p>
          </div>
        </footer>
      </div>

      {/* KYC Modal */}
      <KYCModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleKYCSuccess}
      />
    </>
  );
}
