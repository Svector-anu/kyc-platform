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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Server-Side KYC Verification (Working Demo)
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Form Input */}
      {step === 'form' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How this works (Server-Side Model):</strong>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Server issues a KYC credential to your wallet address</li>
                <li>Server generates a ZK proof that you're over 18</li>
                <li>Server verifies the proof</li>
              </ol>
              <p className="mt-2 text-xs text-blue-600">
                Note: Less private (server knows your birthday), but works immediately without mobile app.
              </p>
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Issuing Credential...' : 'Issue Credential'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Credential Issued */}
      {step === 'credential-issued' && (
        <div className="text-center">
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Credential Issued Successfully!
            </h3>
            <p className="text-green-700 mb-2">
              Your KYC credential has been issued.
            </p>
            <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
              ID: {credentialId}
            </p>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Step:</strong> Generate a zero-knowledge proof that you're over 18.
              The proof will be generated on the server using the ZK circuits.
            </p>
          </div>

          <button
            onClick={handleGenerateProof}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating Proof...' : 'Generate Age Proof (Server-Side)'}
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

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Privacy Note:</strong> In this server-side model, the server knows your birthday
              because it generates the proof. For true privacy, use the mobile wallet approach where
              proofs are generated on your phone.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Start New Verification
          </button>
        </div>
      )}
    </div>
  );
}
