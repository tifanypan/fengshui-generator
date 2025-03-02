import React from 'react';
import { getFurnitureNameById, getFengShuiQualityColor } from '../../utils/furnitureUtils';

/**
 * Component to display details of the selected furniture item
 */
const SelectedItemDetails = ({ selectedItem, selectedItemTradeoffs, setSelectedItem }) => {
  if (!selectedItem) {
    return (
      <div className="md:col-span-1 border rounded-md p-3">
        <div className="text-center text-gray-500 py-4">
          Click on a furniture item to see details
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-1 border rounded-md p-3">
      <div>
        <h4 className="font-medium text-lg mb-2">{selectedItem.name || getFurnitureNameById(selectedItem.base_id)}</h4>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500">Dimensions:</span>
            <div>{selectedItem.width}" × {selectedItem.height}"</div>
          </div>
          <div>
            <span className="text-gray-500">Rotation:</span>
            <div>{selectedItem.rotation || 0}°</div>
          </div>
          <div>
            <span className="text-gray-500">Position:</span>
            <div>x: {selectedItem.x.toFixed(1)}, y: {selectedItem.y.toFixed(1)}</div>
          </div>
          <div>
            <span className="text-gray-500">Feng Shui:</span>
            <div className={`font-medium ${getFengShuiQualityColor(selectedItem.feng_shui_quality)}`}>
              {selectedItem.feng_shui_quality || 'Not rated'}
            </div>
          </div>
        </div>
        
        {/* Feng Shui attributes */}
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedItem.in_command_position && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Command Position
            </span>
          )}
          {selectedItem.against_wall && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Wall Support
            </span>
          )}
          {selectedItem.bagua_area && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {selectedItem.bagua_area.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Area
            </span>
          )}
        </div>
        
        {/* Issues/Tradeoffs for this item */}
        {selectedItemTradeoffs.length > 0 && (
          <div>
            <h5 className="font-medium text-sm mb-1 text-red-600">Issues</h5>
            <ul className="text-xs space-y-2">
              {selectedItemTradeoffs.map((tradeoff, index) => (
                <li key={index} className="border-l-2 border-red-400 pl-2">
                  <p className="font-medium">{tradeoff.description}</p>
                  {tradeoff.mitigation && (
                    <p className="text-gray-600 italic mt-0.5">{tradeoff.mitigation}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          onClick={() => setSelectedItem(null)}
        >
          Clear selection
        </button>
      </div>
    </div>
  );
};

export default SelectedItemDetails;