// src/components/layout/ProgressTracker.jsx
import React from 'react';

const ProgressTracker = ({ currentStep, totalSteps }) => {
  return (
    <div className="py-4 px-6 border-b">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step < currentStep
                  ? 'bg-green-500 text-white'
                  : step === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            
            <div className="ml-2 hidden sm:block">
              <div className="text-sm font-medium">
                {step === 1 && 'Room Type'}
                {step === 2 && 'Room Features'}
                {step === 3 && 'Furniture'}
                {step === 4 && 'Special Needs'}
                {step === 5 && 'Checkout'}
              </div>
              <div className="text-xs text-gray-500">
                {step === 1 && 'Select room type & upload plan'}
                {step === 2 && 'Mark room elements'}
                {step === 3 && 'Select furniture'}
                {step === 4 && 'Set special considerations'}
                {step === 5 && 'Review & payment'}
              </div>
            </div>
            
            {step < totalSteps && (
              <div className="w-10 h-1 bg-gray-200 mx-2 hidden sm:block">
                {step < currentStep && (
                  <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;