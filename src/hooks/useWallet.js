'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethereumService } from '@/lib/ethereum';
import { useWalletStore } from '@/store/walletStore';

export const useWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, disconnect: storeDisconnect, updateChainId, ...walletState } = useWalletStore();

  const connectWallet = useCallback(async () => {
    console.log('🔵 connectWallet function called');
    console.log('🔵 window.ethereum exists?', typeof window !== 'undefined' && !!window.ethereum);
    
    setIsConnecting(true);
    
    try {
      console.log('🔵 Calling ethereumService.connectWallet()...');
      const { address, chainId } = await ethereumService.connectWallet();
      console.log('✅ Connected! Address:', address, 'ChainId:', chainId);
      
      const provider = ethereumService.getProvider();
      connect(address, chainId, provider);

      return { address, chainId };
    } catch (error) {
      console.error('❌ Connection error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        data: error.data
      });
      alert('Error connecting: ' + error.message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const disconnect = useCallback(async () => {
    console.log('🔵 Disconnecting wallet...');
    await ethereumService.disconnectWallet();
    storeDisconnect();
  }, [storeDisconnect]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      ethereumService.onAccountsChanged((accounts) => {
        console.log('🔵 Accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnect();
        }
      });

      ethereumService.onChainChanged((chainId) => {
        console.log('🔵 Chain changed:', chainId);
        updateChainId(parseInt(chainId, 16));
      });

      return () => {
        ethereumService.removeAllListeners();
      };
    }
  }, [disconnect, updateChainId]);

  return {
    ...walletState,
    isConnecting,
    connectWallet,
    disconnect,
  };
};