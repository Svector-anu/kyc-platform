'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Copy, Check } from 'lucide-react'

export default function AgentDetailPage() {
  const params = useParams()
  const did = decodeURIComponent(params.did)
  
  const [agent, setAgent] = useState(null)
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAgentDetails()
  }, [did])

  async function fetchAgentDetails() {
    try {
      const res = await fetch(`http://localhost:4000/api/agents/${encodeURIComponent(did)}/reputation`)
      const data = await res.json()
      
      if (data.success) {
        setReputation(data.reputation)
        setAgent({
          agentDID: data.reputation.agentDID,
          agentName: data.reputation.agentName,
          agentType: data.reputation.agentType,
          description: data.reputation.description,
          capabilities: data.reputation.capabilities,
          createdAt: data.reputation.createdAt,
        })
      }
    } catch (error) {
      console.error('Error fetching agent:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyDID() {
    navigator.clipboard.writeText(did)
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
              {did.split(':').pop().slice(0, 20)}...
            </code>
            <button
              onClick={copyDID}
              className="p-1 hover:text-foreground transition-colors"
              title="Copy DID"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
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
          <Link
            href={`/agents/${encodeURIComponent(did)}/attest`}
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
    </div>
  )
}
