'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ServerSideKYC() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'  // Default for demo
  });
  const [step, setStep] = useState('form'); // form, credential-issued, proof-generated, verified
  const [credentialId, setCredentialId] = useState('');
  const [proofData, setProofData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Issue Credential
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/issue-credential`, formData);

      if (response.data.success) {
        setCredentialId(response.data.credential.credentialId);
        setStep('credential-issued');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate Proof (Server-Side)
  const handleGenerateProof = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/generate-proof`, {
        credentialId,
        minAge: 18
      });

      if (response.data.success) {
        setProofData(response.data);
        setStep('proof-generated');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate proof');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify Proof
  const handleVerifyProof = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/verify-proof`, {
        proof: proofData.proof
      });

      if (response.data.success) {
        setVerificationResult(response.data);
        setStep('verified');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      email: '',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    });
    setStep('form');
    setCredentialId('');
    setProofData(null);
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
      {/* Header with gradient */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Zero-Knowledge KYC
        </h2>
        <p className="text-gray-600 mb-2">Privacy-Preserving Age Verification</p>
        <p className="text-sm text-gray-400">Powered by <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Billions</span></p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Form Input */}
      {step === 'form' && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="relative">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">How it works</h3>
              </div>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 mt-0.5">1</span>
                  <span>Issue a verified KYC credential</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold mr-3 mt-0.5">2</span>
                  <span>Generate a zero-knowledge proof of age eligibility</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold mr-3 mt-0.5">3</span>
                  <span>Verify the cryptographic proof</span>
                </li>
              </ol>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Wallet Address
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none font-mono text-sm"
                placeholder="0x..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Issuing Credential...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Issue Credential
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Credential Issued */}
      {step === 'credential-issued' && (
        <div className="text-center space-y-6 animate-fade-in">
          {/* Success Card */}
          <div className="relative overflow-hidden p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl shadow-lg">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-300 rounded-full -mr-20 -mt-20 opacity-20"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Credential Issued!
              </h3>
              <p className="text-gray-700 mb-4">
                Your KYC credential has been successfully created and stored.
              </p>
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Credential ID</p>
                <p className="text-sm font-mono text-gray-800 break-all">{credentialId}</p>
              </div>
            </div>
          </div>

          {/* Next Step Info */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-purple-600 rounded-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 mb-1">Next: Generate Proof</h4>
                <p className="text-sm text-gray-600">
                  Create a zero-knowledge proof using advanced cryptographic circuits to verify you're 18+
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateProof}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Proof...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Generate Age Proof
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Proof Generated */}
      {step === 'proof-generated' && (
        <div className="text-center">
          <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">
              Zero-Knowledge Proof Generated!
            </h3>
            <p className="text-purple-700">
              A cryptographic proof has been generated that proves you're over 18.
            </p>
            <p className="text-xs text-gray-600 mt-2 font-mono bg-gray-100 p-2 rounded">
              Proof ID: {proofData.proofId}
            </p>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Final Step:</strong> Verify the proof to confirm age eligibility.
            </p>
          </div>

          <button
            onClick={handleVerifyProof}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Verifying Proof...' : 'Verify Proof'}
          </button>
        </div>
      )}

      {/* Step 4: Verification Result */}
      {step === 'verified' && verificationResult && (
        <div className="text-center">
          <div className={`mb-6 p-6 rounded-lg border ${
            verificationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-6xl mb-4">
              {verificationResult.valid ? '✅' : '❌'}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              verificationResult.valid ? 'text-green-800' : 'text-red-800'
            }`}>
              {verificationResult.valid
                ? 'Verification Successful!'
                : 'Verification Failed'}
            </h3>
            <p className={verificationResult.valid ? 'text-green-700' : 'text-red-700'}>
              {verificationResult.valid
                ? 'Zero-knowledge proof verified! User is over 18 years old.'
                : 'The proof verification failed. Please try again.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Verified at: {verificationResult.timestamp}
            </p>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What just happened:</strong> Your age eligibility was verified using zero-knowledge
              cryptography without revealing your exact date of birth to third parties.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Start New Verification
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Powered by Billions</p>
          </div>
        </div>
      )}
    </div>
  );
}
