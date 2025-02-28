// src/pages/room-generator.js
import React, { useState } from 'react';
import RoomTypeSelection from '../components/steps/RoomTypeSelection';
import RoomFeatures from '../components/steps/RoomFeatures';
import FurnitureSelection from '../components/steps/FurnitureSelection';
import ProgressTracker from '../components/layout/ProgressTracker';

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

      <ProgressTracker currentStep={currentStep} totalSteps={5} />

        {currentStep === 1 && (
          <RoomTypeSelection onNext={handleNext} />
        )}
        
        {currentStep === 2 && (
          <RoomFeatures onNext={handleNext} onBack={handleBack} />
        )}
        
        {currentStep === 3 && (
          <FurnitureSelection onNext={handleNext} onBack={handleBack} />
        )}
        
        {currentStep === 4 && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Step 4: Coming Soon</h2>
            <p className="mt-4">
              We'll implement checkout and layout generation in the next phase.
            </p>
            <button 
              onClick={() => setCurrentStep(3)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Step 3
            </button>
          </div>
        )}


      </div>
    </div>
  );
};