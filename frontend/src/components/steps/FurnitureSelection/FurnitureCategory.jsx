// src/components/steps/FurnitureSelection/FurnitureCategory.jsx
import React from 'react';
import FurnitureItem from './FurnitureItem';

const FurnitureCategory = ({ category, items }) => {
  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3 pb-2 border-b border-gray-200">{category}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <FurnitureItem 
            key={item.id} 
            item={item} 
          />
        ))}
      </div>
    </div>
  );
};

export default FurnitureCategory;