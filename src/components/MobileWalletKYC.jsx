'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MobileWalletKYC() {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: ''
  });
  const [step, setStep] = useState('form'); // form, credential-qr, credential-issued, proof-qr, verified
  const [qrCode, setQrCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Submit form and get credential offer QR code
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/qr/credential-offer`, formData);

      if (response.data.success) {
        setQrCode(response.data.qrCode);
        setSessionId(response.data.sessionId);
        setStep('credential-qr');

        // Start polling for credential issuance
        startPollingCredentialStatus(response.data.sessionId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create credential offer');
    } finally {
      setLoading(false);
    }
  };

  // Poll to check if credential was issued
  const startPollingCredentialStatus = (sid) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/qr/credential-status/${sid}`);

        if (response.data.success && response.data.status === 'issued') {
          clearInterval(pollInterval);
          setStep('credential-issued');
          console.log('Credential successfully issued to mobile wallet!');
        }
      } catch (err) {
        console.error('Error polling credential status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  // Step 2: Request proof (after credential is issued)
  const handleRequestProof = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/qr/proof-request`, {
        minAge: 18
      });

      if (response.data.success) {
        setQrCode(response.data.qrCode);
        setSessionId(response.data.sessionId);
        setStep('proof-qr');

        // Start polling for proof submission
        startPollingProofStatus(response.data.sessionId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create proof request');
    } finally {
      setLoading(false);
    }
  };

  // Poll to check if proof was submitted
  const startPollingProofStatus = (sid) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/qr/proof-status/${sid}`);

        if (response.data.success && response.data.status === 'completed') {
          clearInterval(pollInterval);
          setVerificationResult({
            valid: response.data.valid,
            verifiedAt: response.data.verifiedAt
          });
          setStep('verified');
        }
      } catch (err) {
        console.error('Error polling proof status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  const handleReset = () => {
    setFormData({ name: '', dateOfBirth: '', email: '' });
    setStep('form');
    setQrCode('');
    setSessionId('');
    setError('');
    setVerificationResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        KYC Verification with Polygon ID Mobile Wallet
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
              <strong>How this works:</strong>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Enter your KYC information below</li>
                <li>Scan the QR code with Polygon ID mobile app</li>
                <li>Receive your KYC credential in your mobile wallet</li>
                <li>Generate a ZK proof on your phone to verify your age</li>
              </ol>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Generating QR Code...' : 'Generate Credential Offer QR Code'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Credential Offer QR Code */}
      {step === 'credential-qr' && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Scan this QR code with Polygon ID mobile app</strong>
              <br />
              The app will request your KYC credential. Accept it to store it in your mobile wallet.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <img src={qrCode} alt="Credential Offer QR Code" className="mx-auto max-w-xs" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Waiting for mobile wallet to accept credential...</span>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Session ID: {sessionId}
          </p>
        </div>
      )}

      {/* Step 3: Credential Issued - Request Proof */}
      {step === 'credential-issued' && (
        <div className="text-center">
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Credential Issued Successfully!
            </h3>
            <p className="text-green-700">
              Your KYC credential is now stored in your Polygon ID mobile wallet.
            </p>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Step: Verify Your Age</strong>
              <br />
              Click below to generate a proof request. You'll scan another QR code with your mobile wallet
              to generate a zero-knowledge proof that you're over 18, without revealing your actual birthday.
            </p>
          </div>

          <button
            onClick={handleRequestProof}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating Proof Request...' : 'Request Age Verification Proof'}
          </button>
        </div>
      )}

      {/* Step 4: Proof Request QR Code */}
      {step === 'proof-qr' && (
        <div className="text-center">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Scan this QR code with Polygon ID mobile app</strong>
              <br />
              The app will generate a zero-knowledge proof that you're over 18 years old.
              Your actual birthday will never be revealed!
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <img src={qrCode} alt="Proof Request QR Code" className="mx-auto max-w-xs" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Waiting for mobile wallet to submit proof...</span>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Session ID: {sessionId}
          </p>
        </div>
      )}

      {/* Step 5: Verification Result */}
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
                ? 'Age Verification Successful!'
                : 'Age Verification Failed'}
            </h3>
            <p className={verificationResult.valid ? 'text-green-700' : 'text-red-700'}>
              {verificationResult.valid
                ? 'Zero-knowledge proof verified! You are over 18 years old.'
                : 'The proof verification failed. Please try again.'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}
            </p>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Privacy Note:</strong> Your actual date of birth was never shared!
              Only a cryptographic proof that you're over 18 was generated and verified.
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

      {/* Download Mobile App Notice */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800 text-center">
          <strong>Don't have Polygon ID?</strong>
          <br />
          Download the mobile app:
          <br />
          <a
            href="https://apps.apple.com/app/polygon-id/id1629870183"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline mx-2"
          >
            iOS
          </a>
          |
          <a
            href="https://play.google.com/store/apps/details?id=com.polygonid.wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline mx-2"
          >
            Android
          </a>
        </p>
      </div>
    </div>
  );
}
