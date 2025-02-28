import React, { useState } from 'react';
import RoomTypeSelection from '../components/steps/RoomTypeSelection';
import RoomFeatures from '../components/steps/RoomFeatures';

export default function RoomGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        {currentStep === 1 && (
          <RoomTypeSelection onNext={handleNext} />
        )}
        
        {currentStep === 2 && (
          <RoomFeatures onNext={handleNext} onBack={handleBack} />
        )}
        
        {currentStep === 3 && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Step 3: Coming Soon</h2>
            <p className="mt-4">
              We'll implement furniture selection in the next phase.
            </p>
            <button 
              onClick={() => setCurrentStep(2)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Step 2
            </button>
          </div>
        )}
      </div>
    </div>
  );
}