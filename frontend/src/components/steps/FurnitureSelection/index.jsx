// src/components/steps/FurnitureSelection/index.jsx
import React, { useEffect } from 'react';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import { 
  getFurnitureByRoomType, 
  getPetFurniture, 
  getOutdoorFurniture 
} from '../../../utils/furnitureData';
import FurnitureCategory from './FurnitureCategory';
import SpecialConsiderations from './SpecialConsiderations';
import CustomFurniture from './CustomFurniture';
import StudioConfig from './StudioConfig';
// import RoomTypeChanger from './RoomTypeChanger';

const FurnitureSelection = ({ onNext, onBack }) => {
  const { 
    floorPlan, 
    furniture, 
    populateRoomFurniture, 
    setHasOutdoorSpace,
    updateSpecialConsideration
  } = useStore();
  
  const hasOutdoorSpace = furniture.hasOutdoorSpace;
  const hasPets = furniture.specialConsiderations.pets;
  
  // Get furniture options based on room type
  const furnitureOptions = getFurnitureByRoomType(floorPlan.roomType);
  const petFurniture = getPetFurniture();
  const outdoorFurniture = getOutdoorFurniture();
  
  // Populate default furniture on component mount or room type change
  useEffect(() => {
    if (floorPlan.roomType) {
      populateRoomFurniture(floorPlan.roomType);
    }
  }, [floorPlan.roomType, populateRoomFurniture]);
  
  // Count total selected furniture items
  const totalItems = Object.values(furniture.items).reduce(
    (sum, item) => sum + item.quantity, 0
  );
  
  // Handle outdoor space toggle
  const handleOutdoorSpaceToggle = (e) => {
    setHasOutdoorSpace(e.target.checked);
  };
  
  // Handle pet option toggle
  const handlePetToggle = (e) => {
    updateSpecialConsideration('pets', e.target.checked);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 3: Furniture Selection</h2>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Select furniture for your {floorPlan.roomType?.replace(/_/g, ' ')}
            </h3>
            <p className="text-blue-700">
              Choose the furniture you want in your room. Adjust quantities using the + and - buttons.
              Selected items will be arranged according to feng shui principles in the final layout.
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            {/* <RoomTypeChanger /> */}
          </div>
        </div>
      </div>
      
      {/* Studio Configuration (if Studio room type) */}
      {floorPlan.roomType === 'studio' && (
        <StudioConfig />
      )}
      
      {/* Outdoor Space Option */}
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={hasOutdoorSpace}
            onChange={handleOutdoorSpaceToggle}
            className="mr-2"
          />
          <span className="font-medium">I have a patio or balcony</span>
        </label>
      </div>
  
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">Furniture Items</h3>
            
            {furnitureOptions.map((category, index) => (
              <FurnitureCategory 
                key={index} 
                category={category.category} 
                items={category.items} 
              />
            ))}
            
            {/* Conditionally show pet furniture */}
            {hasPets && petFurniture.map((category, index) => (
              <FurnitureCategory 
                key={`pet-${index}`} 
                category={category.category} 
                items={category.items} 
              />
            ))}
            
            {/* Conditionally show outdoor furniture */}
            {hasOutdoorSpace && outdoorFurniture.map((category, index) => (
              <FurnitureCategory 
                key={`outdoor-${index}`} 
                category={category.category} 
                items={category.items} 
              />
            ))}
            
            <CustomFurniture />
          </div>
        </div>
        
        <div className="md:col-span-1">
          <SpecialConsiderations />
          
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-2">Selected Furniture</h3>
            <p className="text-xl font-semibold text-blue-600 mb-4">
              {totalItems} items selected
            </p>
            
            {totalItems > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(furniture.items)
                  .filter(([id, item]) => item.quantity > 0)
                  .map(([id, item]) => {
                    // Find the item from the furniture options or custom name
                    const foundItem = furnitureOptions.flatMap(c => c.items).find(i => i.id === id);
                    const petItem = petFurniture.flatMap(c => c.items).find(i => i.id === id);
                    const outdoorItem = outdoorFurniture.flatMap(c => c.items).find(i => i.id === id);
                    
                    const itemName = item.customName || 
                      (foundItem?.name || petItem?.name || outdoorItem?.name || id);
                    
                    return (
                      <div key={id} className="flex justify-between items-center py-2 border-b">
                        <span>
                          {itemName}
                          <span className="text-xs text-gray-500 ml-1">
                            ({item.dimensions.width}" × {item.dimensions.height}")
                          </span>
                        </span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 italic">No furniture selected yet</p>
            )}
            
            {totalItems > 15 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                <p><strong>Note:</strong> You've selected many furniture items. Make sure they will fit in your space.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Step 2
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={totalItems === 0}
        >
          Continue to Step 4
        </Button>
      </div>
      
      {totalItems === 0 && (
        <p className="text-sm text-red-600 mt-2 text-right">
          Please select at least one furniture item before continuing.
        </p>
      )}
    </div>
  );
};

export default FurnitureSelection;