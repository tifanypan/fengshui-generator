// src/components/steps/FurnitureSelection/FurnitureItem.jsx
import React, { useState, useEffect } from 'react';
import useStore from '../../../state/store';

const FurnitureItem = ({ item }) => {
  const { furniture, addFurnitureItem, updateFurnitureQuantity, updateFurnitureDimensions } = useStore();
  
  // Get current quantity and dimensions for this item
  const currentItem = furniture.items[item.id];
  const quantity = currentItem ? currentItem.quantity : 0;
  
  // Track if dimensions form is expanded
  const [showDimensions, setShowDimensions] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState({
    width: item.dimensions.width,
    height: item.dimensions.height
  });
  
  // Ensure the item is in the store
  useEffect(() => {
    if (!currentItem) {
      addFurnitureItem(
        item.type || 'furniture',
        item.id,
        item.defaultQuantity || 0,
        item.dimensions,
        item.fengShuiRole,
        item.isResizable,
        item.dimensionLimits
      );
    } else {
      setCurrentDimensions({
        width: currentItem.dimensions.width,
        height: currentItem.dimensions.height
      });
    }
  }, [item, addFurnitureItem, currentItem]);
  
  // Handle quantity changes
  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    updateFurnitureQuantity(item.id, newQuantity);
    
    // Show dimensions form for first item
    if (quantity === 0 && item.isResizable) {
      setShowDimensions(true);
    }
    
    // Show warning for high quantities
    if (newQuantity > 5) {
      alert(`You've selected ${newQuantity} ${item.name}s. Are you sure this many will fit in your room?`);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 0) {
      updateFurnitureQuantity(item.id, quantity - 1);
      
      // Hide dimensions if quantity becomes 0
      if (quantity === 1) {
        setShowDimensions(false);
      }
    }
  };
  
  // Handle dimension changes
  const handleDimensionChange = (dimension, value) => {
    const numValue = parseInt(value, 10);
    
    // Validate within min/max limits
    if (item.dimensionLimits) {
      const { minWidth, maxWidth, minDepth, maxDepth } = item.dimensionLimits;
      
      if (dimension === 'width' && (numValue < minWidth || numValue > maxWidth)) {
        alert(`Width must be between ${minWidth}" and ${maxWidth}"`);
        return;
      }
      
      if (dimension === 'height' && (numValue < minDepth || numValue > maxDepth)) {
        alert(`Depth must be between ${minDepth}" and ${maxDepth}"`);
        return;
      }
    }
    
    // Update local state
    setCurrentDimensions(prev => ({
      ...prev,
      [dimension]: numValue
    }));
    
    // Update store
    const newDimensions = {
      ...currentDimensions,
      [dimension]: numValue
    };
    
    updateFurnitureDimensions(item.id, newDimensions);
  };
  
  // Toggle dimensions form
  const toggleDimensions = () => {
    if (quantity > 0 && item.isResizable) {
      setShowDimensions(!showDimensions);
    }
  };
  
  return (
    <div className="flex flex-col p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="cursor-pointer" onClick={toggleDimensions}>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-gray-500">
            {currentDimensions.width}" × {currentDimensions.height}"
            {item.isResizable && quantity > 0 && (
              <span className="ml-1 text-blue-500">(Adjustable)</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              quantity === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={decreaseQuantity}
            disabled={quantity === 0}
          >
            -
          </button>
          <span className="mx-3 w-6 text-center">{quantity}</span>
          <button
            className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
            onClick={increaseQuantity}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Dimension adjustment form */}
      {showDimensions && item.isResizable && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-600 mb-2">Adjust dimensions:</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1">Width (inches)</label>
              <input
                type="number"
                min={item.dimensionLimits?.minWidth || 12}
                max={item.dimensionLimits?.maxWidth || 96}
                value={currentDimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Depth (inches)</label>
              <input
                type="number"
                min={item.dimensionLimits?.minDepth || 12}
                max={item.dimensionLimits?.maxDepth || 96}
                value={currentDimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="w-full p-1 border rounded text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FurnitureItem;