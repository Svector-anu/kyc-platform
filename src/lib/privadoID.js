class PrivadoIDService {
  constructor() {
    this.isInitialized = false;
    this.issuerUrl = 'http://172.20.10.14:4000'; // Backend issuer URL
  }

  async initialize() {
    try {
      console.log('🔄 Checking Privado ID Issuer...');
      
      const response = await fetch(`${this.issuerUrl}/health`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        this.isInitialized = true;
        console.log('✅ Privado ID Issuer connected');
        return true;
      }
      
      throw new Error('Issuer not responding');
    } catch (error) {
      console.error('❌ Error connecting to issuer:', error);
      throw error;
    }
  }

  async generateProof(credentials) {
    try {
      console.log('🔄 Step 1: Requesting credential from issuer...');
      console.log('Credentials input:', credentials);

      // STEP 1: Issue credential
      const issueResponse = await fetch(`${this.issuerUrl}/api/issue-credential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!issueResponse.ok) {
        throw new Error(`Failed to issue credential: ${issueResponse.statusText}`);
      }

      const issueResult = await issueResponse.json();

      if (!issueResult.success) {
        throw new Error(issueResult.error || 'Failed to issue credential');
      }

      console.log('✅ Credential received from issuer');
      console.log('📄 Credential:', issueResult.credential);

      // STEP 2: Generate ZK proof using the credential
      console.log('🔄 Step 2: Generating ZK proof...');

      const proofResponse = await fetch(`${this.issuerUrl}/api/generate-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: issueResult.credential,
          userAddress: credentials.address // ✅ Pass wallet address
        }),
      });

      if (!proofResponse.ok) {
        throw new Error(`Failed to generate proof: ${proofResponse.statusText}`);
      }

      const proofResult = await proofResponse.json();

      if (!proofResult.success) {
        throw new Error(proofResult.error || 'Failed to generate proof');
      }

      console.log('✅ ZK Proof generated successfully');
      console.log('🔐 Proof data:', proofResult);

      // Return complete proof object
      const completeProof = {
        proof: proofResult.proof,
        publicSignals: proofResult.pub_signals || proofResult.publicSignals,
        pub_signals: proofResult.pub_signals || proofResult.publicSignals,
        walletAddress: credentials.address, // ✅ Include wallet address
        timestamp: Date.now(),
        proofType: 'age_verification',
        circuitId: proofResult.circuitId,
        method: proofResult.method || 'backend',
        claim: {
          type: 'KYCAgeCredential',
          ageOver: 18,
          verified: true,
        },
        credential: issueResult.credential,
        metadata: {
          verifier: 'KYC Platform',
          algorithm: 'Privado ID',
          version: '1.0.0',
          issuer: issueResult.credential.issuer,
          network: issueResult.network || 'Polygon Amoy',
        },
      };

      console.log('✅ Complete proof package ready:', completeProof);
      return completeProof;

    } catch (error) {
      console.error('❌ Error generating proof:', error);
      throw error;
    }
  }

  async verifyProof(proofData) {
    try {
      console.log('🔄 Verifying proof with backend...');
      console.log('📦 Proof data to verify:', proofData);

      // Call backend verification endpoint
      const response = await fetch(`${this.issuerUrl}/api/verify-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: proofData.proof,
          publicSignals: proofData.publicSignals || proofData.pub_signals,
          pub_signals: proofData.pub_signals || proofData.publicSignals,
          walletAddress: proofData.walletAddress, // ✅ Include wallet address
          circuitId: proofData.circuitId
        }),
      });

      if (!response.ok) {
        throw new Error(`Verification request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 Verification result:', result);

      const isValid = result.success && result.verified && result.decision === 'approved';
      
      console.log(isValid ? '✅ Proof verified successfully' : '❌ Proof verification failed');
      
      return {
        verified: isValid,
        result: result,
        decision: result.decision,
        reason: result.reason,
        timestamp: result.timestamp
      };

    } catch (error) {
      console.error('❌ Error verifying proof:', error);
      return {
        verified: false,
        error: error.message
      };
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

export const privadoID = new PrivadoIDService();