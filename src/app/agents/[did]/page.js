'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Copy, Check } from 'lucide-react'
import PaymentModal from '@/components/PaymentModal'

export default function AgentDetailPage() {
  const params = useParams()
  const publicIdOrDID = decodeURIComponent(params.did)

  const [agent, setAgent] = useState(null)
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showUseModal, setShowUseModal] = useState(false)

  useEffect(() => {
    fetchAgentDetails()
  }, [publicIdOrDID])

  async function fetchAgentDetails() {
    try {
      const res = await fetch(`http://localhost:4000/api/agents/${encodeURIComponent(publicIdOrDID)}/reputation`)
      const data = await res.json()

      if (data.success) {
        setReputation(data.reputation)
        setAgent({
          publicId: data.reputation.publicId,
          agentName: data.reputation.agentName,
          agentType: data.reputation.agentType,
          description: data.reputation.description,
          capabilities: data.reputation.capabilities,
          ownerDeveloperDID: data.reputation.ownerDeveloperDID,
          createdAt: data.reputation.createdAt,
        })
      }
    } catch (error) {
      console.error('Error fetching agent:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyPublicId() {
    navigator.clipboard.writeText(publicIdOrDID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Agent not found</p>
          <Link href="/agents" className="text-primary hover:underline">
            ← Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/agents"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{agent.agentName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
              {publicIdOrDID.includes(':') ? publicIdOrDID.split(':').pop().slice(0, 20) : publicIdOrDID.slice(0, 20)}...
            </code>
            <button
              onClick={copyPublicId}
              className="p-1 hover:text-foreground transition-colors"
              title="Copy Public ID"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {agent.ownerDeveloperDID && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs">Owner:</span>
              <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                {agent.ownerDeveloperDID.split(':').pop().slice(0, 20)}...
              </code>
            </div>
          )}
        </div>

        {/* Overview Section */}
        <div className="border border-border rounded-lg bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <p className="font-medium">{agent.agentType}</p>
            </div>

            {agent.capabilities?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {agent.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{agent.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reputation Section */}
        <div className="border border-border rounded-lg bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Reputation</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.round(reputation?.trustScore || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold">
                  {reputation?.trustScore?.toFixed(1) || '0.0'}/5
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {reputation?.attestationCount || 0} attestation{reputation?.attestationCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                reputation?.trustLevel === 'Highly Trusted' ? 'bg-success/10 text-success' :
                reputation?.trustLevel === 'Trusted' ? 'bg-primary/10 text-primary' :
                reputation?.trustLevel === 'Verified' ? 'bg-accent/10 text-accent' :
                'bg-muted text-muted-foreground'
              }`}>
                {reputation?.trustLevel || 'New'}
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                {reputation?.kycAttestationCount || 0} KYC-verified · {reputation?.communityAttestationCount || 0} Community
              </p>
            </div>
          </div>
        </div>

        {/* Attestations Section */}
        <div className="border border-border rounded-lg bg-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Attestations</h2>
          
          {reputation?.attestations?.length > 0 ? (
            <div className="space-y-4">
              {reputation.attestations.slice(0, 5).map((att) => (
                <div key={att.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < att.credentialSubject.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        att.metadata.isKYCVerified
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {att.credentialSubject.attesterType}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(att.issuanceDate).toLocaleDateString('en-NG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {att.credentialSubject.comment && (
                    <p className="text-sm text-muted-foreground">"{att.credentialSubject.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No attestations yet. Be the first to attest!
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowUseModal(true)}
            className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Use Agent
          </button>
          <Link
            href={`/agents/${encodeURIComponent(publicIdOrDID)}/attest`}
            className="flex-1 text-center py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-secondary transition-all"
          >
            Attest Agent
          </Link>
          <button
            className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
            disabled
          >
            Request Proof
          </button>
        </div>
      </div>

      {/* Use Agent Modal */}
      {showUseModal && agent && (
        <UseAgentModal
          agent={agent}
          publicId={publicIdOrDID}
          onClose={() => setShowUseModal(false)}
        />
      )}
    </div>
  )
}

function UseAgentModal({ agent, publicId, onClose }) {
  const [action, setAction] = useState('echo')
  const [payload, setPayload] = useState({ text: '', url: '', city: '', date: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentRequired, setPaymentRequired] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)

  async function handleUse(proof = null) {
    setLoading(true)
    setError(null)
    setResult(null)

    // Use the passed proof or the state proof
    const paymentProofToUse = proof || paymentProof;

    try {
      const userWallet = localStorage.getItem('walletAddress')
      if (!userWallet) {
        setError('Please complete KYC verification first')
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
        headers: {
          'Content-Type': 'application/json',
          ...(paymentProofToUse && { 'x-payment': JSON.stringify(paymentProofToUse) })
        },
        body: JSON.stringify({
          userWallet,
          action,
          payload: actionPayload
        })
      })

      const data = await res.json()

      // Detect HTTP 402 Payment Required
      if (res.status === 402) {
        setPaymentRequired(true)
        setPaymentData(data.payment)
        setLoading(false)
        return
      }

      if (data.success) {
        setResult(data.result)
      } else {
        setError(data.error || 'Failed to use agent')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handlePaymentSuccess(proof) {
    setPaymentProof(proof)
    setPaymentRequired(false)
    handleUse(proof) // Retry with payment proof passed directly
  }

  function handlePaymentCancel() {
    setPaymentRequired(false)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
          <button
            onClick={handleUse}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Using...' : 'Use Agent'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentRequired && paymentData && (
        <PaymentModal
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
}
