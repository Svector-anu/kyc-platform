'use client';

import { useState, useCallback } from 'react';
import { privadoID } from '@/lib/privadoID';

export const useProof = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentProof, setCurrentProof] = useState(null);
  const [proofs, setProofs] = useState([]);

  const generateProof = useCallback(async (credentials) => {
    setIsGenerating(true);
    try {
      console.log('🔄 Generating ZK proof via backend...');
      console.log('Credentials:', credentials);
      
      // Call the backend via privadoID service
      const proof = await privadoID.generateProof(credentials);
      
      setCurrentProof(proof);
      setProofs(prev => [...prev, proof]);
      
      console.log('✅ Backend proof generation complete');
      return proof;
    } catch (error) {
      console.error('❌ Error generating proof:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const verifyProof = useCallback(async (proofData) => {
    setIsVerifying(true);
    try {
      console.log('🔄 Verifying proof...');
      const isValid = await privadoID.verifyProof(proofData);
      console.log(isValid ? '✅ Proof verified' : '❌ Proof invalid');
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying proof:', error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearProof = useCallback(() => {
    setCurrentProof(null);
  }, []);

  const clearAllProofs = useCallback(() => {
    setProofs([]);
    setCurrentProof(null);
  }, []);

  return {
    isGenerating,
    isVerifying,
    currentProof,
    proofs,
    generateProof,
    verifyProof,
    clearProof,
    clearAllProofs,
  };
};