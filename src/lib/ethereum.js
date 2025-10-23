import { ethers } from 'ethers';

class EthereumService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.accountsChangedHandler = null;
    this.chainChangedHandler = null;
  }

  async connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();

      // Check if on Sepolia
      const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');
      if (network.chainId !== expectedChainId) {
        await this.switchToSepolia();
      }

      return {
        address,
        chainId: network.chainId,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  async switchToSepolia() {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
    } catch (error) {
      // Chain not added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: {
              name: 'SepoliaETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw error;
      }
    }
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  async getBalance(address) {
    if (!this.provider) throw new Error('Provider not initialized');
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async disconnectWallet() {
    // Remove event listeners before disconnecting
    this.removeAllListeners();
    this.provider = null;
    this.signer = null;
  }

  // Listen to account changes (EIP-1193 compliant)
  onAccountsChanged(callback) {
    if (window.ethereum) {
      // Remove old handler if exists
      if (this.accountsChangedHandler) {
        window.ethereum.removeListener('accountsChanged', this.accountsChangedHandler);
      }
      // Store new handler
      this.accountsChangedHandler = callback;
      window.ethereum.on('accountsChanged', this.accountsChangedHandler);
    }
  }

  // Listen to chain changes (EIP-1193 compliant)
  onChainChanged(callback) {
    if (window.ethereum) {
      // Remove old handler if exists
      if (this.chainChangedHandler) {
        window.ethereum.removeListener('chainChanged', this.chainChangedHandler);
      }
      // Store new handler
      this.chainChangedHandler = callback;
      window.ethereum.on('chainChanged', this.chainChangedHandler);
    }
  }

  // Remove listeners (EIP-1193 compliant)
  removeAllListeners() {
    if (window.ethereum) {
      if (this.accountsChangedHandler) {
        window.ethereum.removeListener('accountsChanged', this.accountsChangedHandler);
        this.accountsChangedHandler = null;
      }
      if (this.chainChangedHandler) {
        window.ethereum.removeListener('chainChanged', this.chainChangedHandler);
        this.chainChangedHandler = null;
      }
    }
  }
}

export const ethereumService = new EthereumService();