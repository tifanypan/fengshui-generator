import React, { useState } from 'react';
import useStore from '../../../state/store';

const CompassSelector = () => {
    const { floorPlan, setCompassOrientation } = useStore();
    const selectedDirection = floorPlan.compass.orientation;
    
    const handleDirectionSelect = (direction) => {
      setCompassOrientation(direction);
    };
    
    
//     // Automatically calculate the other directions
//     const directionMap = {
//       'North': { 'East': 'East', 'South': 'South', 'West': 'West' },
//       'East': { 'North': 'West', 'South': 'East', 'West': 'South' },
//       'South': { 'North': 'South', 'East': 'West', 'West': 'East' },
//       'West': { 'North': 'East', 'South': 'West', 'East': 'South' }
//     };
//   };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Room Orientation</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select which direction corresponds to the top of your floor plan.
      </p>
      
      <div className="flex justify-center mb-6">
        {/* Compass Visualization */}
        <div className="relative w-32 h-32">
          {/* North Arrow */}
          <div className="absolute inset-x-0 top-0 text-center">
            <button 
              className={`w-10 h-10 rounded-full ${selectedDirection === 'North' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handleDirectionSelect('North')}
            >
              N
            </button>
          </div>
          
          {/* East Arrow */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
            <button 
              className={`w-10 h-10 rounded-full ${selectedDirection === 'East' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handleDirectionSelect('East')}
            >
              E
            </button>
          </div>
          
          {/* South Arrow */}
          <div className="absolute inset-x-0 bottom-0 text-center">
            <button 
              className={`w-10 h-10 rounded-full ${selectedDirection === 'South' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handleDirectionSelect('South')}
            >
              S
            </button>
          </div>
          
          {/* West Arrow */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
            <button 
              className={`w-10 h-10 rounded-full ${selectedDirection === 'West' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handleDirectionSelect('West')}
            >
              W
            </button>
          </div>
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center">
              {selectedDirection ? (
                <span className="text-sm">
                  {selectedDirection} ↑
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  Select
                </span>
              )}
            </div>
          </div>
          
          {/* Connecting Lines */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 32 32" className="absolute inset-0">
              <line x1="16" y1="0" x2="16" y2="6" stroke="#CBD5E0" strokeWidth="1" />
              <line x1="16" y1="26" x2="16" y2="32" stroke="#CBD5E0" strokeWidth="1" />
              <line x1="0" y1="16" x2="6" y2="16" stroke="#CBD5E0" strokeWidth="1" />
              <line x1="26" y1="16" x2="32" y2="16" stroke="#CBD5E0" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
      
      {selectedDirection && (
        <div className="border rounded-md p-3 bg-gray-50">
          <h4 className="font-medium mb-2">Direction Settings:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm">
              <span className="font-medium">Top:</span> {selectedDirection}
            </div>
            <div className="text-sm">
              <span className="font-medium">Right:</span> {
                selectedDirection === 'North' ? 'East' :
                selectedDirection === 'East' ? 'South' :
                selectedDirection === 'South' ? 'West' : 'North'
              }
            </div>
            <div className="text-sm">
              <span className="font-medium">Bottom:</span> {
                selectedDirection === 'North' ? 'South' :
                selectedDirection === 'East' ? 'West' :
                selectedDirection === 'South' ? 'North' : 'East'
              }
            </div>
            <div className="text-sm">
              <span className="font-medium">Left:</span> {
                selectedDirection === 'North' ? 'West' :
                selectedDirection === 'East' ? 'North' :
                selectedDirection === 'South' ? 'East' : 'South'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompassSelector;