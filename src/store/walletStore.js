import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWalletStore = create(
  persist(
    (set) => ({
      address: null,
      chainId: null,
      isConnected: false,
      provider: null,

      connect: (address, chainId, provider) =>
        set({ address, chainId, isConnected: true, provider }),

      disconnect: () =>
        set({ address: null, chainId: null, isConnected: false, provider: null }),

      updateChainId: (chainId) =>
        set((state) => ({ ...state, chainId })),
    }),
    {
      name: 'wallet-storage', // localStorage key
      partialize: (state) => ({
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected,
        // Don't persist provider (can't serialize functions)
      }),
    }
  )
);
