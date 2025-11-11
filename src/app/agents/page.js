'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    try {
      const res = await fetch('http://localhost:4000/api/agents')
      const data = await res.json()
      if (data.success) {
        setAgents(data.agents)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', 'Highly Trusted', 'Trusted', 'Verified', 'New']

  const filtered = agents
    .filter(a => {
      const matchesSearch =
        a.agentName.toLowerCase().includes(search.toLowerCase()) ||
        (a.publicId && a.publicId.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory =
        selectedCategory === 'All' || a.trustLevel === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.trustScore - a.trustScore
      if (sortBy === 'attestations') return b.attestationCount - a.attestationCount
      return 0
    })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="text-white py-16" style={{ backgroundColor: '#0046FF' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
                <p className="text-white/80 text-lg">
                  Discover verified AI agents with decentralized identity and reputation scoring
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Total Agents</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Verified</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.trustLevel).length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white/70 text-sm mb-1">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search agents by name or DID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="attestations">Sort by Attestations</option>
                </select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading agents...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <Link
                href="/agents/register"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register First Agent
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((agent) => (
                <AgentCard key={agent.publicId || agent.agentDID} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">
            © 2025 Billions. Powered by <span className="font-semibold">Polygon ID</span> & <span className="font-semibold">Zero-Knowledge Cryptography</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

function AgentCard({ agent }) {
  const [showUseModal, setShowUseModal] = useState(false)
  const publicIdOrDID = agent.publicId || agent.agentDID
  const shortId = publicIdOrDID.includes(':')
    ? publicIdOrDID.split(':').pop().slice(0, 12) + '...'
    : publicIdOrDID.slice(0, 12) + '...'

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-[1.02] group">
        {/* Agent Icon & Name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {agent.agentName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{agent.agentName}</h3>
              <p className="text-xs text-gray-500 font-mono truncate">{shortId}</p>
            </div>
          </div>
          <Link
            href={`/agents/${encodeURIComponent(publicIdOrDID)}`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(agent.trustScore)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-bold text-gray-900">{typeof agent.trustScore === 'number' ? agent.trustScore.toFixed(1) : parseFloat(agent.trustScore || 0).toFixed(1)}</span>
        <span className="text-xs text-gray-500">
          ({agent.attestationCount} attestations)
        </span>
      </div>

      {/* Trust Level Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          agent.trustLevel === 'Highly Trusted'
            ? 'bg-green-100 text-green-700 border border-green-200' :
          agent.trustLevel === 'Trusted'
            ? 'bg-blue-100 text-blue-700 border border-blue-200' :
          agent.trustLevel === 'Verified'
            ? 'bg-purple-100 text-purple-700 border border-purple-200' :
          'bg-gray-100 text-gray-700 border border-gray-200'
        }`}>
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {agent.trustLevel}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUseModal(true)}
          className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
        >
          Use Agent
        </button>
        <Link
          href={`/agents/${encodeURIComponent(publicIdOrDID)}`}
          className="flex-1 text-center py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
        >
          View Details
        </Link>
      </div>
    </div>

    {/* Use Agent Modal */}
    {showUseModal && (
      <UseAgentModal
        agent={agent}
        publicId={publicIdOrDID}
        onClose={() => setShowUseModal(false)}
      />
    )}
    </>
  )
}

function UseAgentModal({ agent, publicId, onClose }) {
  const [action, setAction] = useState('echo')
  const [payload, setPayload] = useState({ text: '', url: '', city: '', date: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usageStats, setUsageStats] = useState(null)
  const [paymentRequired, setPaymentRequired] = useState(false)
  const [paymentMetadata, setPaymentMetadata] = useState(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    // Fetch usage stats when modal opens
    fetchUsageStats()
  }, [])

  async function fetchUsageStats() {
    try {
      const userWallet = localStorage.getItem('walletAddress')
      if (!userWallet) return

      const res = await fetch(`http://localhost:4000/api/agents/${publicId}/usage-stats?userWallet=${userWallet}`)
      const data = await res.json()

      if (data.success) {
        setUsageStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching usage stats:', err)
    }
  }

  async function handleUse() {
    setLoading(true)
    setError(null)
    setResult(null)
    setPaymentRequired(false)

    try {
      // Get wallet address from localStorage (assuming it's stored during KYC)
      const userWallet = localStorage.getItem('walletAddress')
      if (!userWallet) {
        setError('Please connect your wallet first')
        setLoading(false)
        return
      }

      let actionPayload = {}
      if (action === 'echo') {
        actionPayload = { text: payload.text }
      } else if (action === 'fetch-url') {
        actionPayload = { url: payload.url }
      } else if (action === 'book-intent') {
        actionPayload = { city: payload.city, date: payload.date }
      }

      const res = await fetch(`http://localhost:4000/api/agents/${publicId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userWallet,
          action,
          payload: actionPayload
        })
      })

      const data = await res.json()

      // HTTP 402 Payment Required
      if (res.status === 402) {
        setPaymentRequired(true)
        setPaymentMetadata(data.payment)
        setUsageStats(data.usageStats)
        setLoading(false)
        return
      }

      if (data.success) {
        setResult(data.result)
        // Update usage stats after successful use
        if (data.usageStats) {
          setUsageStats(data.usageStats)
        }
      } else {
        setError(data.error || 'Failed to use agent')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    setPaymentProcessing(true)
    setError(null)

    try {
      // Simulate payment for now (in production, use thirdweb SDK)
      // This is where you'd integrate real USDC payment on Base Sepolia
      const simulatedTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`

      // Create payment proof
      const paymentProof = {
        txHash: simulatedTxHash,
        amount: paymentMetadata.price,
        currency: paymentMetadata.currency,
        from: localStorage.getItem('walletAddress'),
        to: paymentMetadata.payTo,
        timestamp: Date.now(),
        network: paymentMetadata.network
      }

      // Retry the agent usage with payment header
      const userWallet = localStorage.getItem('walletAddress')
      let actionPayload = {}
      if (action === 'echo') {
        actionPayload = { text: payload.text }
      } else if (action === 'fetch-url') {
        actionPayload = { url: payload.url }
      } else if (action === 'book-intent') {
        actionPayload = { city: payload.city, date: payload.date }
      }

      const res = await fetch(`http://localhost:4000/api/agents/${publicId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment': JSON.stringify(paymentProof)
        },
        body: JSON.stringify({
          userWallet,
          action,
          payload: actionPayload
        })
      })

      const data = await res.json()

      if (data.success) {
        setResult(data.result)
        setPaymentRequired(false)
        setPaymentMetadata(null)
        // Update usage stats
        if (data.usageStats) {
          setUsageStats(data.usageStats)
        }
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPaymentProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Use Agent</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Agent Name */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">Agent</p>
          <p className="font-semibold text-gray-900">{agent.agentName}</p>
        </div>

        {/* Usage Stats */}
        {usageStats && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Usage Statistics</p>
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                usageStats.tier === 'free'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {usageStats.tier === 'free' ? 'Free Tier' : 'Pro Tier'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-blue-600">Free Uses</p>
                <p className="font-bold text-blue-900">{usageStats.freeUsed || 0} / 3</p>
              </div>
              <div>
                <p className="text-blue-600">Paid Uses</p>
                <p className="font-bold text-blue-900">{usageStats.paidUsed || 0}</p>
              </div>
            </div>
            {usageStats.freeRemaining > 0 && (
              <p className="text-xs text-green-600 mt-2">
                {usageStats.freeRemaining} free {usageStats.freeRemaining === 1 ? 'use' : 'uses'} remaining
              </p>
            )}
            {usageStats.freeRemaining === 0 && (
              <p className="text-xs text-purple-600 mt-2">
                0.01 USDC per use (Base Sepolia)
              </p>
            )}
          </div>
        )}

        {/* Payment Required Notice */}
        {paymentRequired && paymentMetadata && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-start mb-3">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-900 mb-1">Payment Required</p>
                <p className="text-xs text-yellow-700 mb-2">
                  You've used all 3 free uses. Payment is required to continue.
                </p>
                <div className="bg-white rounded-lg p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">{paymentMetadata.price} {paymentMetadata.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-mono text-gray-900">{paymentMetadata.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pay to:</span>
                    <span className="font-mono text-gray-900 truncate ml-2 max-w-[180px]" title={paymentMetadata.payTo}>
                      {paymentMetadata.payTo.slice(0, 8)}...{paymentMetadata.payTo.slice(-6)}
                    </span>
                  </div>
                </div>
                <a
                  href="https://www.coinbase.com/faucets/base-sepolia-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Get Test USDC (Sepolia Faucet)
                </a>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={paymentProcessing}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentProcessing ? 'Processing Payment...' : `Pay ${paymentMetadata.price} USDC & Use Agent`}
            </button>
          </div>
        )}

        {/* Action Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          >
            <option value="echo">Echo (Mock)</option>
            <option value="fetch-url">Fetch URL (Real)</option>
            <option value="book-intent">Book Intent (Mock)</option>
          </select>
        </div>

        {/* Dynamic Payload Inputs */}
        <div className="mb-4">
          {action === 'echo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <input
                type="text"
                value={payload.text}
                onChange={(e) => setPayload({ ...payload, text: e.target.value })}
                placeholder="Enter text to echo..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          )}

          {action === 'fetch-url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input
                type="url"
                value={payload.url}
                onChange={(e) => setPayload({ ...payload, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          )}

          {action === 'book-intent' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={payload.city}
                  onChange={(e) => setPayload({ ...payload, city: e.target.value })}
                  placeholder="Lagos"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={payload.date}
                  onChange={(e) => setPayload({ ...payload, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-900 mb-2">Result:</p>
            <pre className="text-xs text-green-800 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          {!paymentRequired && (
            <button
              onClick={handleUse}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Using...' : 'Use Agent'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
