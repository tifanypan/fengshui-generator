import React, { useState, useEffect } from 'react';
import { testBackendConnection, initializeRoomTypes } from '../utils/apiTest';

export default function ApiTest() {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [initStatus, setInitStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const checkConnection = async () => {
    setLoading(true);
    const result = await testBackendConnection();
    setConnectionStatus(result);
    setLoading(false);
  };
  
  const initRoomTypes = async () => {
    setLoading(true);
    const result = await initializeRoomTypes();
    setInitStatus(result);
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
        
        <div className="space-y-6">
          <div>
            <button 
              onClick={checkConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              Test Backend Connection
            </button>
            
            {connectionStatus && (
              <div className={`mt-3 p-3 rounded ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={connectionStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {connectionStatus.success ? 'Connected successfully!' : 'Connection failed.'}
                </p>
                <p className="text-gray-700 text-sm mt-1">{connectionStatus.message}</p>
              </div>
            )}
          </div>
          
          <div>
            <button 
              onClick={initRoomTypes}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
            >
              Initialize Room Types
            </button>
            
            {initStatus && (
              <div className={`mt-3 p-3 rounded ${initStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={initStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {initStatus.success ? 'Room types initialized!' : 'Initialization failed.'}
                </p>
                <p className="text-gray-700 text-sm mt-1">{initStatus.message}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <a 
            href="/room-generator"
            className="text-blue-600 hover:underline"
          >
            Go to Room Generator
          </a>
        </div>
      </div>
    </div>
  );
}