// src/components/editor/HighlightToolbar.jsx
import React from 'react';
import useStore from '../../state/store';

const HighlightToolbar = () => {
  const { highlights, setActiveHighlightType, undo, redo, clearHighlights } = useStore();
  
  const tools = [
    { id: 'wall', name: 'Walls', icon: '🧱' },
    { id: 'door', name: 'Doors', icon: '🚪' },
    { id: 'window', name: 'Windows', icon: '🪟' },
    { id: 'closet', name: 'Closets', icon: '🏠' },
    { id: 'column', name: 'Columns', icon: '🔲' },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥' },
    { id: 'radiator', name: 'Radiator', icon: '♨️' },
    { id: 'nofurniture', name: 'No Furniture Zone', icon: '⛔' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
  ];
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <div className="mb-3">
        <h3 className="text-lg font-medium mb-1">Highlight Tools</h3>
        <p className="text-sm text-gray-600">
          1. Select a highlight type below
        </p>
        <p className="text-sm text-gray-600">
          2. Click and drag on your floor plan to highlight areas
        </p>
        <p className="text-sm text-gray-600">
          3. Click on a highlight to select it (then delete if needed)
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`flex items-center px-3 py-2 rounded ${
              highlights.activeType === tool.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setActiveHighlightType(tool.id)}
          >
            <span className="mr-2">{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
      
      <div className="flex space-x-3">
        <button
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={undo}
        >
          Undo
        </button>
        <button
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={redo}
        >
          Redo
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 rounded ml-auto"
          onClick={clearHighlights}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default HighlightToolbar;