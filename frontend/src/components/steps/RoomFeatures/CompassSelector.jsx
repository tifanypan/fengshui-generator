// src/components/steps/RoomFeatures/CompassSelector.jsx
import React from 'react';
import useStore from '../../../state/store';

const CompassSelector = () => {
  const { floorPlan, setCompassOrientation } = useStore();
  const selectedDirection = floorPlan.compass.orientation;
  
  const directionNames = {
    'N': 'North',
    'E': 'East',
    'S': 'South',
    'W': 'West'
  };
  
  const handleDirectionSelect = (direction) => {
    setCompassOrientation(direction);
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">Room Orientation</h3>
      <p className="text-sm text-gray-600 mb-3">
        Select which direction corresponds to the top of your floor plan.
      </p>
      
      <div className="flex space-x-2 mb-3">
        {['N', 'E', 'S', 'W'].map(direction => (
          <button
            key={direction}
            className={`px-4 py-2 rounded ${
              selectedDirection === direction 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => handleDirectionSelect(direction)}
          >
            {direction}
          </button>
        ))}
      </div>
      
      {selectedDirection && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
          <p className="font-medium">
            Selected: <span className="text-blue-600">{directionNames[selectedDirection]}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Room dimensions will be displayed on the floor plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompassSelector;