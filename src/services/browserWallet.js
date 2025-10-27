/**
 * Browser-based Polygon ID Wallet Service
 * This implements the HOLDER side of the credential workflow
 *
 * Flow:
 * 1. User creates identity (DID) in browser
 * 2. Receives credentials from issuer
 * 3. Stores credentials in IndexedDB
 * 4. Generates ZK proofs CLIENT-SIDE (never exposes birthday to backend)
 * 5. Submits proofs to verifier
 */

import {
  core,
  CredentialWallet,
  IdentityWallet,
  ProofService,
  FSCircuitStorage,
  InMemoryDataSource,
  InMemoryMerkleTreeStorage,
  InMemoryPrivateKeyStore,
  KMS,
  BjjProvider,
  KmsKeyType,
  CredentialStorage,
  IdentityStorage,
  EthStateStorage,
  CredentialStatusType,
  IDataStorage,
  CircuitId
} from '@0xpolygonid/js-sdk';
import localforage from 'localforage';

class BrowserWallet {
  constructor() {
    this.initialized = false;
    this.identityWallet = null;
    this.credentialWallet = null;
    this.proofService = null;
    this.did = null;
    this.dataStorage = null;
    this.circuitStorage = null;
  }

  /**
   * Initialize the wallet with IndexedDB storage
   */
  async initialize() {
    try {
      console.log('🔧 Initializing Browser Wallet...');

      // Configure circuit storage to fetch from backend
      this.circuitStorage = new BrowserCircuitStorage({
        baseUrl: 'http://localhost:4000/circuits'
      });

      // Initialize data storage (in-memory for now, can be upgraded to IndexedDB)
      const merkleTreeStorage = new InMemoryMerkleTreeStorage(40);
      const credentialDataSource = new InMemoryDataSource();
      const credentialMerkleTreeStorage = new InMemoryMerkleTreeStorage(40);

      this.dataStorage = {
        credential: new CredentialStorage(credentialDataSource, credentialMerkleTreeStorage),
        identity: new IdentityStorage(
          new InMemoryDataSource(),
          new InMemoryDataSource()
        ),
        mt: merkleTreeStorage,
        states: new EthStateStorage({
          contractAddress: process.env.NEXT_PUBLIC_STATE_CONTRACT || '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
          provider: new ethers.providers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'
          )
        })
      };

      // Initialize Key Management System
      const memoryKeyStore = new InMemoryPrivateKeyStore();
      const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, memoryKeyStore);
      const kms = new KMS();
      kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);

      // Initialize Credential Wallet
      this.credentialWallet = new CredentialWallet(this.dataStorage, this.circuitStorage);

      // Initialize Identity Wallet
      this.identityWallet = new IdentityWallet(
        kms,
        this.dataStorage,
        this.credentialWallet
      );

      // Initialize Proof Service
      this.proofService = new ProofService(
        this.identityWallet,
        this.credentialWallet,
        this.circuitStorage,
        this.dataStorage.states,
        {
          ipfsGatewayURL: 'https://ipfs.io'
        }
      );

      // Check if user has existing identity
      const storedDID = await localforage.getItem('userDID');

      if (storedDID) {
        console.log('✅ Loaded existing identity from browser storage');
        this.did = core.DID.parse(storedDID);
      } else {
        console.log('🆔 Creating new user identity...');
        await this.createIdentity();
      }

      this.initialized = true;
      console.log(`✅ Browser Wallet initialized`);
      console.log(`   User DID: ${this.did.string()}`);

      return this.did.string();

    } catch (error) {
      console.error('❌ Error initializing browser wallet:', error);
      throw error;
    }
  }

  /**
   * Create a new identity for the user
   */
  async createIdentity() {
    try {
      // Generate random seed for user
      const seed = new Uint8Array(32);
      crypto.getRandomValues(seed);

      const { did } = await this.identityWallet.createIdentity({
        method: core.DidMethod.Iden3,
        blockchain: core.Blockchain.Polygon,
        networkId: core.NetworkId.Amoy,
        seed: seed,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: process.env.NEXT_PUBLIC_RHS_URL || 'https://rhs-staging.polygonid.me'
        }
      });

      this.did = did;

      // Store DID in browser
      await localforage.setItem('userDID', did.string());
      await localforage.setItem('userSeed', Array.from(seed));

      console.log('✅ New identity created:', did.string());

      return did;

    } catch (error) {
      console.error('❌ Error creating identity:', error);
      throw error;
    }
  }

  /**
   * Get user's DID
   */
  getUserDID() {
    if (!this.did) {
      throw new Error('Wallet not initialized. Call initialize() first.');
    }
    return this.did.string();
  }

  /**
   * Receive and save credential from issuer
   */
  async receiveCredential(credentialData) {
    try {
      console.log('📥 Receiving credential...');

      if (!this.initialized) {
        await this.initialize();
      }

      // Parse credential
      const credential = credentialData.credential || credentialData;

      // Save to wallet storage
      await this.dataStorage.credential.saveCredential(credential);

      console.log('✅ Credential saved to wallet');
      console.log('   ID:', credential.id);

      return credential.id;

    } catch (error) {
      console.error('❌ Error receiving credential:', error);
      throw error;
    }
  }

  /**
   * Generate ZK proof CLIENT-SIDE
   * This is the key security feature - birthday never leaves the browser!
   */
  async generateProof(proofRequest) {
    try {
      console.log('🔐 Generating ZK proof client-side...');

      if (!this.initialized) {
        await this.initialize();
      }

      // Generate proof using local circuits
      const zkProofResponse = await this.proofService.generateProof(
        proofRequest,
        this.did
      );

      console.log('✅ ZK proof generated!');
      console.log('   Circuit:', proofRequest.circuitId);

      return zkProofResponse;

    } catch (error) {
      console.error('❌ Error generating proof:', error);
      throw error;
    }
  }

  /**
   * List all credentials in wallet
   */
  async listCredentials() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const credentials = await this.dataStorage.credential.listCredentials();

      console.log(`📋 Found ${credentials.length} credential(s) in wallet`);

      return credentials;

    } catch (error) {
      console.error('❌ Error listing credentials:', error);
      throw error;
    }
  }
}

/**
 * Custom Circuit Storage that fetches from backend
 */
class BrowserCircuitStorage {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async loadCircuitData(circuitId) {
    try {
      // Check cache first
      if (this.cache.has(circuitId)) {
        console.log(`📦 Using cached circuit: ${circuitId}`);
        return this.cache.get(circuitId);
      }

      console.log(`📥 Downloading circuit: ${circuitId}...`);

      // Map circuit IDs to directory names
      const circuitDirMap = {
        'credentialAtomicQuerySigV2': 'credentialAtomicQuerySigV2OnChain',
        'credentialAtomicQuerySigV2OnChain': 'credentialAtomicQuerySigV2OnChain',
        'credentialAtomicQueryMTPV2': 'credentialAtomicQueryMTPV2OnChain',
        'credentialAtomicQueryMTPV2OnChain': 'credentialAtomicQueryMTPV2OnChain'
      };

      const circuitDir = circuitDirMap[circuitId] || circuitId;
      const circuitUrl = `${this.baseUrl}/${circuitDir}`;

      // Fetch circuit files
      const [wasmResponse, zkeyResponse, vkeyResponse] = await Promise.all([
        fetch(`${circuitUrl}/circuit.wasm`),
        fetch(`${circuitUrl}/circuit_final.zkey`),
        fetch(`${circuitUrl}/verification_key.json`)
      ]);

      if (!wasmResponse.ok || !zkeyResponse.ok || !vkeyResponse.ok) {
        throw new Error(`Failed to download circuit ${circuitId}`);
      }

      const [wasm, zkey, vkey] = await Promise.all([
        wasmResponse.arrayBuffer(),
        zkeyResponse.arrayBuffer(),
        vkeyResponse.json()
      ]);

      const circuitData = {
        wasm: new Uint8Array(wasm),
        zkey: new Uint8Array(zkey),
        vkey
      };

      // Cache for future use
      this.cache.set(circuitId, circuitData);

      console.log(`✅ Circuit downloaded: ${circuitId}`);

      return circuitData;

    } catch (error) {
      console.error(`❌ Error loading circuit ${circuitId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const browserWallet = new BrowserWallet();
