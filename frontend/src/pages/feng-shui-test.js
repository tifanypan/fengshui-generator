import React from 'react';
import FengShuiTestingHarness from '../components/testing/FengShuiTestingHarness';

const FengShuiTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Feng Shui Engine Testing</h1>
          <a 
            href="/room-generator"
            className="text-blue-600 hover:underline"
          >
            Back to Room Generator
          </a>
        </div>
      </div>
      
      <FengShuiTestingHarness />
      
      <div className="max-w-7xl mx-auto mt-8 px-4 text-sm text-gray-500">
        <p>This testing interface is for development purposes only and will not be available in production.</p>
      </div>
    </div>
  );
};

export default FengShuiTestPage;