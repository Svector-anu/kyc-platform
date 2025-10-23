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
      console.log('🔄 Requesting credential from issuer...');

      // Request credential from backend issuer
      const response = await fetch(`${this.issuerUrl}/api/issue-credential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to issue credential');
      }

      console.log('✅ Credential received from issuer');

      // Convert to proof format
      const proof = {
        proof: JSON.stringify({
          credential: result.credential,
          type: 'BackendIssued',
        }),
        publicSignals: ['1', credentials.isOver18 ? '1' : '0'],
        timestamp: Date.now(),
        proofType: 'age_verification',
        claim: {
          type: 'KYCAgeCredential',
          ageOver: 18,
          verified: credentials.isOver18,
        },
        metadata: {
          verifier: 'KYC Platform (Issuer Backend)',
          algorithm: 'Privado ID',
          version: '1.0.0',
          issuer: result.credential.issuer,
        },
      };

      console.log('✅ Proof generated successfully');
      return proof;

    } catch (error) {
      console.error('❌ Error generating proof:', error);
      throw error;
    }
  }

  async verifyProof(proofData) {
    try {
      console.log('🔄 Verifying proof...');
      
      // Simple verification
      const isValid = proofData && proofData.publicSignals && proofData.publicSignals[0] === '1';
      
      console.log(isValid ? '✅ Proof verified' : '❌ Proof invalid');
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying proof:', error);
      return false;
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

export const privadoID = new PrivadoIDService();