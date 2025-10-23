'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const testMetaMask = async () => {
    addLog('🔍 Starting test...');
    
    // Test 1: Check if window.ethereum exists
    if (typeof window === 'undefined') {
      addLog('❌ window is undefined');
      return;
    }
    addLog('✅ window exists');
    
    if (!window.ethereum) {
      addLog('❌ window.ethereum is undefined - MetaMask NOT installed');
      return;
    }
    addLog('✅ window.ethereum exists');
    
    // Test 2: Try to request accounts
    try {
      addLog('🔵 Calling eth_requestAccounts...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      addLog('✅ Success! Accounts: ' + JSON.stringify(accounts));
    } catch (error) {
      addLog('❌ Error: ' + error.message);
      addLog('❌ Error code: ' + error.code);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">MetaMask Test Page</h1>
        
        <Button onClick={testMetaMask} size="lg">
          🧪 Test MetaMask Connection
        </Button>
        
        <div className="bg-white p-6 rounded-lg border space-y-2">
          <h2 className="font-bold text-lg">Test Logs:</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click the button above.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-sm font-mono">
                {log}
              </div>
            ))
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-bold mb-2">Quick Checks:</h3>
          <ul className="text-sm space-y-1">
            <li>✅ MetaMask installed in browser?</li>
            <li>✅ MetaMask extension enabled?</li>
            <li>✅ Using Chrome, Brave, or Firefox?</li>
            <li>✅ No popup blockers active?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}