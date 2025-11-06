'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useWallet } from '@/context/WalletContext'

export default function RegisterAgentPage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    agentName: '',
    agentType: 'AI agent',
    description: '',
    capabilities: []
  })
  const [capabilityInput, setCapabilityInput] = useState('')

  const addCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capabilityInput.trim()]
      })
      setCapabilityInput('')
    }
  }

  const removeCapability = (cap) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter(c => c !== cap)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use connected wallet address
      if (!isConnected || !address) {
        setError('Please connect your wallet first')
        setLoading(false)
        return
      }

      const res = await fetch('http://localhost:4000/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: formData.agentName,
          agentType: formData.agentType,
          description: formData.description,
          capabilities: formData.capabilities,
          developerWallet: address,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Use publicId for navigation (agentDID is private)
        const agentId = data.agent.publicId || data.agent.agentDID
        router.push(`/agents/${encodeURIComponent(agentId)}`)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to register agent. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link 
          href="/agents"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>

        {/* Header */}
        <div className="bg-gradient-brand text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Register Agent</h1>
          <p className="text-white/90">
            Create an agent identity and start collecting attestations.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-border rounded-lg bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Developer Wallet */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Developer Wallet Address <span className="text-destructive">*</span>
              </label>
              {isConnected ? (
                <div className="w-full px-4 py-2 border-2 border-green-500/20 bg-green-50 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span className="text-gray-700">{formData.developerWallet}</span>
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold">Connected</span>
                  </div>
                </div>
              ) : (
                <div className="w-full px-4 py-2 border-2 border-red-500/20 bg-red-50 rounded-lg text-red-600 flex items-center justify-between">
                  <span className="text-sm font-medium">Please connect your wallet first</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Use the SAME wallet address you used for KYC verification
              </p>
            </div>

            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Agent Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                placeholder="BookingBot"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Agent Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Agent Type
              </label>
              <select
                value={formData.agentType}
                onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="AI agent">AI agent</option>
                <option value="Chatbot">Chatbot</option>
                <option value="Automation">Automation</option>
                <option value="Analytics">Analytics</option>
              </select>
            </div>

            {/* Capabilities */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Capabilities
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={capabilityInput}
                  onChange={(e) => setCapabilityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                  placeholder="e.g., book_tickets"
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addCapability}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {cap}
                      <button
                        type="button"
                        onClick={() => removeCapability(cap)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your agent does..."
                rows={4}
                maxLength={240}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/240 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !formData.agentName}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Registering...' : 'Register Agent'}
              </button>
              <Link
                href="/agents"
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> You can publish state on-chain later for ecosystem discovery.
          </p>
        </div>
      </div>
    </div>
  )
}
