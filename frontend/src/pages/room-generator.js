// src/pages/room-generator.js
import React, { useState, useEffect } from 'react';
import RoomTypeSelection from '../components/steps/RoomTypeSelection';
import RoomFeatures from '../components/steps/RoomFeatures';
import FurnitureSelection from '../components/steps/FurnitureSelection';
import ResultsPreview from '../components/steps/ResultsPreview';
import PaymentPage from '../components/steps/PaymentPage';
import ResultsDisplay from '../components/steps/ResultsDisplay';
import ProgressTracker from '../components/layout/ProgressTracker';

export default function RoomGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    // Scroll to top of page for better UX
    window.scrollTo(0, 0);
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    // Scroll to top of page for better UX
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md">
        <ProgressTracker currentStep={currentStep} totalSteps={6} />

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
          <PaymentPage onNext={handleNext} onBack={handleBack} />
        )}
        
        {currentStep === 6 && (
          <ResultsDisplay onBack={() => setCurrentStep(5)} />
        )}
      </div>
    </div>
  );
};