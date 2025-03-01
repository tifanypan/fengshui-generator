// src/components/steps/RoomTypeSelection/index.jsx
import React from 'react';
import RoomTypeSelector from './RoomTypeSelector';
import OccupantDetails from './OccupantDetails';
import FloorPlanUploader from './FloorPlanUploader';
import Button from '../../shared/Button';
import useStore from '../../../state/store';

const RoomTypeSelection = ({ onNext }) => {
  const { floorPlan } = useStore();
  
  // Check if we have required fields - no dimensions check here
  const canProceed = floorPlan.roomType && floorPlan.file;
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 1: Room Type & Floor Plan</h2>
      
      <OccupantDetails />
      <FloorPlanUploader />
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
        >
          Continue to Step 2
        </Button>
      </div>
      
      {!canProceed && (
        <p className="text-sm text-gray-600 mt-2 text-right">
          Please select a room type and upload a floor plan to continue.
        </p>
      )}
    </div>
  );
};

export default RoomTypeSelection;