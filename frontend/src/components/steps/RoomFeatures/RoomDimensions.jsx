import React, { useState, useEffect } from 'react';
import useStore from '../../../state/store';

const RoomDimensions = () => {
  const { floorPlan, setFloorPlanDimensions } = useStore();
  const [unit, setUnit] = useState('feet-inches'); // 'feet-inches', 'feet', 'meters'
  const [lengthFeet, setLengthFeet] = useState('');
  const [lengthInches, setLengthInches] = useState('');
  const [widthFeet, setWidthFeet] = useState('');
  const [widthInches, setWidthInches] = useState('');
  const [lengthMeters, setLengthMeters] = useState('');
  const [widthMeters, setWidthMeters] = useState('');
  
  // Convert and save dimensions when values change
  useEffect(() => {
    let lengthInMeters, widthInMeters;
    
    if (unit === 'feet-inches') {
      const lengthTotalFeet = Number(lengthFeet) + (Number(lengthInches) / 12);
      const widthTotalFeet = Number(widthFeet) + (Number(widthInches) / 12);
      lengthInMeters = lengthTotalFeet * 0.3048;
      widthInMeters = widthTotalFeet * 0.3048;
    } else if (unit === 'feet') {
      lengthInMeters = Number(lengthFeet) * 0.3048;
      widthInMeters = Number(widthFeet) * 0.3048;
    } else if (unit === 'meters') {
      lengthInMeters = Number(lengthMeters);
      widthInMeters = Number(widthMeters);
    }
    
    // Only update if we have valid numbers
    if (!isNaN(lengthInMeters) && !isNaN(widthInMeters) && 
        lengthInMeters > 0 && widthInMeters > 0) {
      setFloorPlanDimensions({
        length: lengthInMeters,
        width: widthInMeters,
        unit: 'meters'
      });
    }
  }, [lengthFeet, lengthInches, widthFeet, widthInches, lengthMeters, widthMeters, unit, setFloorPlanDimensions]);
  
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white">
      <h3 className="text-lg font-medium mb-3">Room Dimensions <span className="text-red-500">*</span></h3>
      <p className="text-sm text-gray-600 mb-3">
        Please provide the dimensions of your room. If you don't know the exact measurements, please provide your best estimate.
      </p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Measurement Unit</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="unit"
              value="feet-inches"
              checked={unit === 'feet-inches'}
              onChange={() => setUnit('feet-inches')}
              className="mr-2"
            />
            Feet & Inches
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="unit"
              value="feet"
              checked={unit === 'feet'}
              onChange={() => setUnit('feet')}
              className="mr-2"
            />
            Feet
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="unit"
              value="meters"
              checked={unit === 'meters'}
              onChange={() => setUnit('meters')}
              className="mr-2"
            />
            Meters
          </label>
        </div>
      </div>
      
      {unit === 'feet-inches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={lengthFeet}
                  onChange={(e) => setLengthFeet(e.target.value)}
                  placeholder="Feet"
                  className="w-full p-2 border rounded"
                  required
                />
                <span className="text-xs text-gray-500">ft</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={lengthInches}
                  onChange={(e) => setLengthInches(e.target.value)}
                  placeholder="Inches"
                  className="w-full p-2 border rounded"
                />
                <span className="text-xs text-gray-500">in</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={widthFeet}
                  onChange={(e) => setWidthFeet(e.target.value)}
                  placeholder="Feet"
                  className="w-full p-2 border rounded"
                  required
                />
                <span className="text-xs text-gray-500">ft</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={widthInches}
                  onChange={(e) => setWidthInches(e.target.value)}
                  placeholder="Inches"
                  className="w-full p-2 border rounded"
                />
                <span className="text-xs text-gray-500">in</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {unit === 'feet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (feet)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={lengthFeet}
              onChange={(e) => setLengthFeet(e.target.value)}
              placeholder="Length in feet"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width (feet)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={widthFeet}
              onChange={(e) => setWidthFeet(e.target.value)}
              placeholder="Width in feet"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
      )}
      
      {unit === 'meters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (meters)</label>
            <input
              type="number"
              min="0.5"
              step="0.01"
              value={lengthMeters}
              onChange={(e) => setLengthMeters(e.target.value)}
              placeholder="Length in meters"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width (meters)</label>
            <input
              type="number"
              min="0.5"
              step="0.01"
              value={widthMeters}
              onChange={(e) => setWidthMeters(e.target.value)}
              placeholder="Width in meters"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
          <p className="text-sm">
            <strong>Note:</strong> These dimensions will be used to scale your floor plan correctly. Please enter them as accurately as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomDimensions;