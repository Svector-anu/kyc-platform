'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Star } from 'lucide-react'

export default function AgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const filtered = agents.filter(a => 
    a.agentName.toLowerCase().includes(search.toLowerCase()) ||
    a.agentDID.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Agents</h1>
          <p className="text-muted-foreground">
            Discover verified AI agents with reputation scores
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link
            href="/agents/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-secondary transition-all"
          >
            Register Agent
          </Link>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">Loading agents...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No agents yet</p>
            <Link href="/agents/register" className="text-primary hover:underline">
              Register your first agent →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.agentDID} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }) {
  const shortDID = agent.agentDID.split(':').pop().slice(0, 8) + '...'
  
  return (
    <div className="border border-border rounded-lg p-6 bg-card hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">{agent.agentName}</h3>
        <p className="text-sm text-muted-foreground font-mono">{shortDID}</p>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(agent.trustScore)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{agent.trustScore}</span>
        <span className="text-sm text-muted-foreground">
          ({agent.attestationCount})
        </span>
      </div>
      
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          agent.trustLevel === 'Highly Trusted' ? 'bg-success/10 text-success' :
          agent.trustLevel === 'Trusted' ? 'bg-primary/10 text-primary' :
          agent.trustLevel === 'Verified' ? 'bg-accent/10 text-accent' :
          'bg-muted text-muted-foreground'
        }`}>
          {agent.trustLevel}
        </span>
      </div>
      
      <Link
        href={`/agents/${encodeURIComponent(agent.agentDID)}`}
        className="block text-center py-2 rounded-lg border border-border hover:bg-muted transition-colors"
      >
        View Details
      </Link>
    </div>
  )
}
