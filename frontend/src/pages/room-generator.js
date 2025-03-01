// src/pages/room-generator.js
import React, { useState, useEffect } from 'react';
import RoomTypeSelection from '../components/steps/RoomTypeSelection';
import RoomFeatures from '../components/steps/RoomFeatures';
import FurnitureSelection from '../components/steps/FurnitureSelection';
import ResultsPreview from '../components/steps/ResultsPreview';
import ProgressTracker from '../components/layout/ProgressTracker';

export default function RoomGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDev, setIsDev] = useState(false);
  
  // Check if we're in development environment
  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {isDev && (
        <div className="max-w-6xl mx-auto mb-2 px-4 flex justify-end">
          <a 
            href="/feng-shui-test"
            className="text-sm text-blue-600 hover:underline"
          >
            Feng Shui Engine Testing
          </a>
        </div>
      )}
      
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
          <ResultsPreview onNext={handleNext} onBack={handleBack} />
        )}
        
        {currentStep === 5 && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">Step 5: Payment & Download</h2>
            <p className="mt-4">
              We'll implement payment processing and PDF download in the next phase.
            </p>
            <button 
              onClick={() => setCurrentStep(4)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Step 4
            </button>
          </div>
        )}
      </div>
    </div>
  );
};