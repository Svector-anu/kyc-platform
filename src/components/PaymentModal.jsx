'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

export default function PaymentModal({ paymentData, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSkipPayment = () => {
    // Test mode: simulate successful payment
    const mockPaymentProof = {
      txHash: 'test-payment-' + Date.now(),
      amount: paymentData.price,
      from: '0xd0a2362c6cf02f8fdacd3e2abcbfbc625aa0f967',
      to: paymentData.payTo,
      currency: paymentData.currency,
      network: paymentData.network,
      timestamp: new Date().toISOString(),
      testMode: true
    };

    onSuccess(mockPaymentProof);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setTxHash('');

    try {
      // 1. Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to make payments');
      }

      // 2. Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // 3. Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // 4. Check network (Base Sepolia chainId: 84532)
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== paymentData.chainId) {
        // Try to switch network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${paymentData.chainId.toString(16)}` }],
          });
        } catch (switchError) {
          // Network not added, try to add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${paymentData.chainId.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
              }]
            });
          } else {
            throw switchError;
          }
        }
        // Recreate provider after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        return await sendPayment(newSigner, userAddress);
      }

      await sendPayment(signer, userAddress);

    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const sendPayment = async (signer, userAddress) => {
    try {
      // 4. Create USDC contract instance
      const usdcABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];

      const usdcContract = new ethers.Contract(
        paymentData.tokenAddress,
        usdcABI,
        signer
      );

      // 5. Check USDC balance
      const balance = await usdcContract.balanceOf(userAddress);
      const decimals = await usdcContract.decimals();
      const amount = ethers.parseUnits(paymentData.price, decimals);

      if (balance < amount) {
        throw new Error(`Insufficient USDC balance. You need ${paymentData.price} USDC but have ${ethers.formatUnits(balance, decimals)} USDC`);
      }

      // 6. Send transaction
      console.log('Sending payment:', {
        to: paymentData.payTo,
        amount: paymentData.price,
        tokenAddress: paymentData.tokenAddress
      });

      const tx = await usdcContract.transfer(paymentData.payTo, amount);
      setTxHash(tx.hash);

      console.log('Transaction sent:', tx.hash);

      // 7. Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // 8. Call success callback with payment proof
      onSuccess({
        txHash: tx.hash,
        amount: paymentData.price,
        from: userAddress,
        to: paymentData.payTo,
        currency: paymentData.currency,
        network: paymentData.network,
        timestamp: new Date().toISOString()
      });

      setLoading(false);

    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Required</h2>
          <p className="text-gray-600">
            This agent requires payment after 3 free uses
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Amount:</span>
            <span className="text-2xl font-bold text-gray-900">
              {paymentData.price} {paymentData.currency}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Network:</span>
            <span className="font-semibold text-gray-900 capitalize">{paymentData.network}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pay to:</span>
            <span className="font-mono text-xs text-gray-900">
              {paymentData.payTo.slice(0, 6)}...{paymentData.payTo.slice(-4)}
            </span>
          </div>
        </div>

        {/* Transaction Status */}
        {txHash && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mt-0.5"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Transaction Pending
                </p>
                <p className="text-xs text-blue-700 font-mono break-all">
                  {txHash}
                </p>
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                >
                  View on BaseScan →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Payment Failed</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sending...
                </span>
              ) : (
                `Pay ${paymentData.price} ${paymentData.currency}`
              )}
            </button>
          </div>

          {/* Test Mode Button */}
          <button
            onClick={handleSkipPayment}
            disabled={loading}
            className="w-full px-6 py-2 border-2 border-yellow-300 bg-yellow-50 text-yellow-800 rounded-xl font-medium hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            🧪 Skip Payment (Test Mode)
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-center text-gray-500 mt-4">
          You'll need MetaMask installed and sufficient USDC on {paymentData.network}
        </p>
      </div>
    </div>
  );
}
