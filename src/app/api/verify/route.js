import { NextResponse } from 'next/server';

// Mock verification function (will be replaced with real Privado ID)
async function verifyZKProof(proof) {
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if proof has required fields
  if (!proof || !proof.publicSignals || !proof.proof) {
    return {
      isValid: false,
      reason: 'Invalid proof format'
    };
  }
  
  // Check if age verification claim is true (publicSignals[0] should be '1')
  const ageVerified = proof.publicSignals[0] === '1';
  
  return {
    isValid: ageVerified,
    reason: ageVerified ? 'Age verification successful' : 'Age verification failed'
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, walletAddress } = body;

    console.log('🔍 Verification request received');
    console.log('Wallet:', walletAddress);
    console.log('Proof:', proof);

    // Verify the proof
    const verificationResult = await verifyZKProof(proof);

    if (verificationResult.isValid) {
      console.log('✅ Proof verified successfully');
      
      return NextResponse.json({
        decision: 'approved',
        reason: verificationResult.reason,
        timestamp: new Date().toISOString(),
        verifiedBy: 'KYC Platform Verifier',
      });
    } else {
      console.log('❌ Proof verification failed:', verificationResult.reason);
      
      return NextResponse.json({
        decision: 'rejected',
        reason: verificationResult.reason,
        timestamp: new Date().toISOString(),
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