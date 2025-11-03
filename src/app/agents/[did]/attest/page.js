'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Loader2 } from 'lucide-react'

export default function AttestAgentPage() {
  const params = useParams()
  const router = useRouter()
  const publicIdOrDID = decodeURIComponent(params.did)

  const [agent, setAgent] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAgent()
  }, [publicIdOrDID])

  async function fetchAgent() {
    try {
      const res = await fetch(`http://localhost:4000/api/agents/${encodeURIComponent(publicIdOrDID)}`)
      const data = await res.json()
      if (data.success) {
        setAgent(data.agent)
      }
    } catch (error) {
      console.error('Error fetching agent:', error)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Get wallet address from localStorage (stored during KYC)
      const attesterWallet = localStorage.getItem('walletAddress')

      if (!attesterWallet) {
        setError('Please complete KYC verification first')
        setLoading(false)
        return
      }

      const res = await fetch('http://localhost:4000/api/agents/attest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: publicIdOrDID, // Use publicId instead of agentDID
          attesterWallet,
          rating,
          comment,
        }),
      })

      const data = await res.json()

      if (data.success) {
        router.push(`/agents/${encodeURIComponent(publicIdOrDID)}`)
      } else {
        setError(data.error || 'Attestation failed')
      }
    } catch (err) {
      setError('Failed to submit attestation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href={`/agents/${encodeURIComponent(publicIdOrDID)}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agent
        </Link>

        <div className="border border-border rounded-lg bg-card p-8">
          <h1 className="text-3xl font-bold mb-2">Rate this Agent</h1>
          {agent && (
            <p className="text-muted-foreground mb-8">{agent.agentName}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Rating <span className="text-destructive">*</span>
              </label>
              <div 
                className="flex gap-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this agent..."
                rows={4}
                maxLength={240}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/240 characters
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
                disabled={loading || rating === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Submitting...' : 'Submit Attestation'}
              </button>
              <Link
                href={`/agents/${encodeURIComponent(publicIdOrDID)}`}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
