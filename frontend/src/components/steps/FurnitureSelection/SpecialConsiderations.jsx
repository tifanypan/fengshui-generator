// src/components/steps/FurnitureSelection/SpecialConsiderations.jsx (continued)
import React from 'react';
import useStore from '../../../state/store';

const SpecialConsiderations = () => {
  const { furniture, updateSpecialConsideration } = useStore();
  const { specialConsiderations } = furniture;
  
  const considerations = [
    { 
      id: 'wheelchair', 
      label: 'I use a wheelchair / need accessible layouts',
      description: 'Ensures wider pathways and appropriate furniture heights'
    },
    { 
      id: 'smallSpace', 
      label: 'I live in a small space / shared room',
      description: 'Optimizes layout for limited square footage'
    },
    { 
      id: 'rental', 
      label: 'I rent and cannot modify my space',
      description: 'Avoids recommendations that require permanent changes'
    },
    { 
      id: 'pets', 
      label: 'I have pets that affect furniture placement',
      description: 'Considers pet traffic and furniture protection'
    },
    { 
      id: 'sensory', 
      label: 'I need a quiet / sensory-friendly layout',
      description: 'Prioritizes calm spaces and reduces stimulation'
    }
  ];
  
  const handleChange = (considerationId) => {
    updateSpecialConsideration(
      considerationId, 
      !specialConsiderations[considerationId]
    );
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Special Considerations</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select any special needs that apply to your space. These will be taken into account when generating your feng shui layout.
      </p>
      
      <div className="space-y-3">
        {considerations.map((consideration) => (
          <div key={consideration.id} className="flex items-start">
            <input
              type="checkbox"
              id={consideration.id}
              checked={specialConsiderations[consideration.id] || false}
              onChange={() => handleChange(consideration.id)}
              className="mt-1 mr-3"
            />
            <div>
              <label htmlFor={consideration.id} className="font-medium cursor-pointer">
                {consideration.label}
              </label>
              <p className="text-xs text-gray-500">{consideration.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialConsiderations;