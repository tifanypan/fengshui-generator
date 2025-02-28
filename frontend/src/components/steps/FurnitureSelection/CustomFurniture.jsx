// src/components/steps/FurnitureSelection/CustomFurniture.jsx
import React, { useState } from 'react';
import useStore from '../../../state/store';
import { getPurposeOptions } from '../../../utils/furnitureData';

const CustomFurniture = () => {
  const { addCustomFurniture } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    width: '',
    depth: '',
    purpose: '',
    quantity: 1
  });
  
  const purposeOptions = getPurposeOptions();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!customItem.name || !customItem.width || !customItem.depth || !customItem.purpose) {
      alert('Please fill in all fields for your custom furniture item');
      return;
    }
    
    // Validate dimensions (basic sanity check)
    const width = parseInt(customItem.width, 10);
    const depth = parseInt(customItem.depth, 10);
    
    if (width < 6 || width > 120 || depth < 6 || depth > 120) {
      if (confirm('The dimensions you entered are unusual. Are you sure they are correct?')) {
        // Proceed if confirmed
      } else {
        return;
      }
    }
    
    // Add custom furniture with selected purpose
    const selectedPurpose = purposeOptions.find(p => p.value === customItem.purpose);
    
    addCustomFurniture(
      customItem.name,
      { 
        width: parseInt(customItem.width, 10), 
        height: parseInt(customItem.depth, 10) 
      },
      selectedPurpose?.fengShuiRole || 'custom',
      parseInt(customItem.quantity, 10)
    );
    
    // Reset form
    setCustomItem({
      name: '',
      width: '',
      depth: '',
      purpose: '',
      quantity: 1
    });
    
    // Close form
    setIsAdding(false);
  };
  
  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-md font-medium mb-3">Custom Furniture</h4>
      
      {!isAdding ? (
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={() => setIsAdding(true)}
        >
          + Add Custom Item
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4">
          <h5 className="font-medium mb-3">Add Custom Furniture</h5>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <input
              type="text"
              name="name"
              value={customItem.name}
              onChange={handleChange}
              placeholder="e.g., Piano, Trophy Case"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <select
              name="purpose"
              value={customItem.purpose}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select purpose...</option>
              {purposeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Width (inches)</label>
              <input
                type="number"
                name="width"
                value={customItem.width}
                onChange={handleChange}
                placeholder="Width"
                min="1"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Depth (inches)</label>
              <input
                type="number"
                name="depth"
                value={customItem.depth}
                onChange={handleChange}
                placeholder="Depth"
                min="1"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={customItem.quantity}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Item
            </button>
            
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomFurniture;