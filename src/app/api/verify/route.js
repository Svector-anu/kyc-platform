import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, walletAddress } = body;

    console.log('🔍 Verification request received');
    console.log('Wallet:', walletAddress);
    console.log('Proof:', JSON.stringify(proof, null, 2));

    // Forward to backend for real Polygon ID verification
    const response = await fetch(`${API_URL}/api/verify-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed');
    }

    if (data.success && data.valid) {
      console.log('✅ Proof verified successfully via backend');

      return NextResponse.json({
        decision: 'approved',
        reason: 'Age verification successful via zero-knowledge proof',
        timestamp: data.timestamp,
        verifiedBy: 'Polygon ID ZK Verifier',
      });
    } else {
      console.log('❌ Proof verification failed');

      return NextResponse.json({
        decision: 'rejected',
        reason: 'Proof verification failed',
        timestamp: data.timestamp,
      });
    }
  } catch (error) {
    console.error('❌ API Error:', error);

    return NextResponse.json(
      {
        decision: 'rejected',
        reason: 'Internal server error: ' + error.message,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Verification API is running',
    timestamp: new Date().toISOString(),
  });
}