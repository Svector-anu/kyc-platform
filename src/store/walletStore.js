import { create } from 'zustand';

export const useWalletStore = create((set) => ({
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
}));