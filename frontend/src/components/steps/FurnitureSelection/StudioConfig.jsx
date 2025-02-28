// src/components/steps/FurnitureSelection/StudioConfig.jsx
import React from 'react';
import useStore from '../../../state/store';

const StudioConfig = () => {
  const { furniture, updateStudioConfig } = useStore();
  const { studioConfig } = furniture;
  
  const handleChange = (key, value) => {
    updateStudioConfig(key, value);
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-md font-medium mb-3">Studio Configuration</h3>
      <p className="text-sm text-gray-600 mb-3">
        Tell us what areas your studio includes to help optimize furniture placement:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center p-2 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={studioConfig.hasSleeping}
            onChange={(e) => handleChange('hasSleeping', e.target.checked)}
            className="mr-2"
          />
          <span>Sleeping area</span>
        </label>
        
        <label className="flex items-center p-2 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={studioConfig.hasWorkspace}
            onChange={(e) => handleChange('hasWorkspace', e.target.checked)}
            className="mr-2"
          />
          <span>Workspace / Office area</span>
        </label>
        
        <label className="flex items-center p-2 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={studioConfig.hasKitchen}
            onChange={(e) => handleChange('hasKitchen', e.target.checked)}
            className="mr-2"
          />
          <span>Kitchen area</span>
        </label>
        
        <label className="flex items-center p-2 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={studioConfig.hasDining}
            onChange={(e) => handleChange('hasDining', e.target.checked)}
            className="mr-2"
          />
          <span>Dining area</span>
        </label>
      </div>
    </div>
  );
};

export default StudioConfig;