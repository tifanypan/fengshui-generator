import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../../state/store';

const ElementsPanel = () => {
  const { addElement, floorPlan } = useStore();
  
  const elementTypes = [
    { type: 'door', label: 'Door', icon: '🚪' },
    { type: 'window', label: 'Window', icon: '🪟' },
    { type: 'closet', label: 'Closet', icon: '🏠' },
    { type: 'column', label: 'Column', icon: '🔲' },
    { type: 'fireplace', label: 'Fireplace', icon: '🔥' },
    { type: 'radiator', label: 'Radiator', icon: '♨️' },
  ];
  
  const handleAddElement = (type) => {
    // Calculate center of room in pixels
    const pixelsPerMeter = 100;
    const centerX = (floorPlan.dimensions.width * pixelsPerMeter) / 2;
    const centerY = (floorPlan.dimensions.length * pixelsPerMeter) / 2;
    
    // Different default sizes based on element type
    let width, height;
    if (type === 'door') {
      width = 36;
      height = 6;
    } else if (type === 'window') {
      width = 48;
      height = 6;
    } else if (type === 'closet') {
      width = 60;
      height = 24;
    } else if (type === 'column') {
      width = 12;
      height = 12;
    } else if (type === 'fireplace') {
      width = 48;
      height = 16;
    } else if (type === 'radiator') {
      width = 24;
      height = 8;
    } else {
      width = 40;
      height = 40;
    }
    
    const newElement = {
      id: uuidv4(),
      type,
      x: centerX,
      y: centerY,
      width,
      height,
      rotation: 0,
      isOpen: false, // for doors
    };
    
    addElement(newElement);
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Fixed Elements</h3>
      <p className="text-sm text-gray-600 mb-3">
        Click to add elements to your floor plan. Then drag to position them.
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {elementTypes.map((element) => (
          <button
            key={element.type}
            className="flex flex-col items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            onClick={() => handleAddElement(element.type)}
          >
            <span className="text-2xl mb-1">{element.icon}</span>
            <span className="text-xs">{element.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElementsPanel;