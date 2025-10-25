class PrivadoIDService {
  constructor() {
    this.isInitialized = false;
    this.issuerUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.14:4000';
  }

  async initialize() {
    try {
      console.log('🔄 Checking Privado ID Issuer...');
      
      const response = await fetch(`${this.issuerUrl}/api/health`);
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
      console.log('🔄 Generating proof with backend...');
      console.log('Input credentials:', credentials);

      // Map frontend credentials to backend format
      // Form uses 'dob' but backend expects 'dateOfBirth'
      const backendPayload = {
        name: credentials.name,
        dateOfBirth: credentials.dateOfBirth || credentials.dob, // ✅ Handle both!
        email: credentials.email,
        walletAddress: credentials.address || credentials.walletAddress
      };

      console.log('📤 Sending to backend:', backendPayload);

      // Validate all required fields
      if (!backendPayload.name || !backendPayload.dateOfBirth || !backendPayload.email || !backendPayload.walletAddress) {
        console.error('❌ Missing fields:', {
          name: !!backendPayload.name,
          dateOfBirth: !!backendPayload.dateOfBirth,
          email: !!backendPayload.email,
          walletAddress: !!backendPayload.walletAddress
        });
        throw new Error('Missing required fields in form');
      }

      // STEP 1: Issue credential
      const issueResponse = await fetch(`${this.issuerUrl}/api/issue-credential`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      if (!issueResponse.ok) {
        const errorText = await issueResponse.text();
        throw new Error(`Failed to issue credential: ${errorText}`);
      }

      const issueResult = await issueResponse.json();

      if (!issueResult.success) {
        throw new Error(issueResult.error || 'Failed to issue credential');
      }

      console.log('✅ Credential issued:', issueResult.credential.credentialId);

      // STEP 2: Generate ZK proof
      console.log('🔄 Generating ZK proof...');

      const proofPayload = {
        dateOfBirth: credentials.dateOfBirth || credentials.dob, // ✅ Handle both!
        walletAddress: credentials.address || credentials.walletAddress
      };

      const proofResponse = await fetch(`${this.issuerUrl}/api/generate-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proofPayload),
      });

      if (!proofResponse.ok) {
        const errorText = await proofResponse.text();
        throw new Error(`Failed to generate proof: ${errorText}`);
      }

      const proofResult = await proofResponse.json();

      if (!proofResult.success) {
        throw new Error(proofResult.error || 'Failed to generate proof');
      }

      console.log('✅ ZK Proof generated successfully');

      // Return complete proof object
      const completeProof = {
        id: proofResult.proof.id,
        proofId: proofResult.proofId,
        proof: proofResult.proof,
        age: proofResult.age,
        walletAddress: credentials.address || credentials.walletAddress,
        timestamp: Date.now(),
        credential: issueResult.credential,
        metadata: {
          credentialId: issueResult.credential.credentialId,
          issuer: issueResult.credential.credential.issuer,
          network: issueResult.credential.credential.metadata.network,
        },
      };

      console.log('✅ Complete proof ready:', completeProof.proofId);
      return completeProof;

    } catch (error) {
      console.error('❌ Error generating proof:', error);
      throw error;
    }
  }

  async verifyProof(proofData) {
    try {
      console.log('🔄 Verifying proof with backend...');

      const response = await fetch(`${this.issuerUrl}/api/verify-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: proofData.proof
        }),
      });

      if (!response.ok) {
        throw new Error(`Verification request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 Verification result:', result);

      const isValid = result.success && result.valid && result.valid.valid === true;
      
      console.log(isValid ? '✅ Proof verified' : '❌ Proof invalid');
      
      return {
        verified: isValid,
        result: result,
        details: result.valid?.details,
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
