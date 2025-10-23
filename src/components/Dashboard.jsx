'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trash2, Send, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const [proofs, setProofs] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);
  const [sendingProof, setSendingProof] = useState(false);

  useEffect(() => {
    loadProofs();
  }, []);

  const loadProofs = () => {
    const savedProofs = JSON.parse(localStorage.getItem('kycProofs') || '[]');
    setProofs(savedProofs);
  };

  const deleteProof = (id) => {
    const updatedProofs = proofs.filter(proof => proof.id !== id);
    setProofs(updatedProofs);
    localStorage.setItem('kycProofs', JSON.stringify(updatedProofs));
  };

  const sendProofToVerifier = async (proof) => {
    setSelectedProof(proof);
    setSendingProof(true);
    
    try {
      // Call our verification API
      const response = await fetch('http://172.20.10.14:4000/api/verify-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: proof.proofData,
          walletAddress: proof.proofData?.walletAddress,
        }),
      });

      const result = await response.json();
      
      // Update proof status based on API response
      const newStatus = result.decision === 'approved' ? 'approved' : 'rejected';
      const updatedProofs = proofs.map(p => 
        p.id === proof.id ? { ...p, status: newStatus, verificationResult: result } : p
      );
      
      setProofs(updatedProofs);
      localStorage.setItem('kycProofs', JSON.stringify(updatedProofs));
      
      alert(result.decision === 'approved' 
        ? '✅ Proof verified and approved!' 
        : '❌ Proof verification failed: ' + result.reason
      );
    } catch (error) {
      console.error('Error sending proof:', error);
      alert('❌ Failed to send proof: ' + error.message);
    } finally {
      setSendingProof(false);
      setSelectedProof(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✅ Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">❌ Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (proofs.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">📊 Proof Dashboard</CardTitle>
          <CardDescription>View and manage your ZK proofs</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No proofs generated yet. Generate your first age verification proof using the KYC form!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">📊 Proof Dashboard</CardTitle>
        <CardDescription>
          You have {proofs.length} proof{proofs.length !== 1 ? 's' : ''} generated
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proofs.map((proof) => (
            <Card key={proof.id} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{proof.name}</h3>
                      {getStatusBadge(proof.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📧 {proof.email}</p>
                      <p>🔐 Proof Type: <strong>Age ≥ 18 Verification</strong></p>
                      <p>📅 Generated: {formatDate(new Date(proof.timestamp).getTime())}</p>
                      {proof.ageVerified && (
                        <p className="text-green-600 font-medium">
                          <CheckCircle2 className="inline h-4 w-4 mr-1" />
                          Age Verified (18+)
                        </p>
                      )}
                    </div>

                    {/* Proof Details */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                        View Proof Data
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-40">
                        <pre>{JSON.stringify(proof.proofData, null, 2)}</pre>
                      </div>
                    </details>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendProofToVerifier(proof)}
                      disabled={proof.status === 'approved' || sendingProof}
                    >
                      {sendingProof && selectedProof?.id === proof.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteProof(proof.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}