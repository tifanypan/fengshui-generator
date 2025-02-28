import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../../state/store';

const ElementsPanel = () => {
  const { addElement } = useStore();
  
  const elementTypes = [
    { type: 'door', label: 'Door', icon: '🚪' },
    { type: 'window', label: 'Window', icon: '🪟' },
    { type: 'closet', label: 'Closet', icon: '🏠' },
    { type: 'column', label: 'Column', icon: '🔲' },
    { type: 'fireplace', label: 'Fireplace', icon: '🔥' },
    { type: 'radiator', label: 'Radiator', icon: '♨️' },
  ];
  
  const handleAddElement = (type) => {
    const newElement = {
      id: uuidv4(),
      type,
      x: 400, // Center of the grid
      y: 300, // Center of the grid
      width: type === 'door' || type === 'window' ? 36 : 40,
      height: type === 'door' || type === 'window' ? 6 : 40,
      rotation: 0,
      isOpen: false, // for doors
    };
    
    addElement(newElement);
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Fixed Elements</h3>
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