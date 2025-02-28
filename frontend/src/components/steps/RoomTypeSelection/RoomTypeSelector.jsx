import React from 'react';
import useStore from '../../../state/store';

const RoomTypeSelector = () => {
  const { floorPlan, setRoomType } = useStore();
  
  const roomTypes = [
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'office', label: 'Office' },
    { id: 'bedroom_office', label: 'Bedroom + Office' },
    { id: 'studio', label: 'Studio' },
    { id: 'living_room', label: 'Living Room' },
    { id: 'dining_room', label: 'Dining Room' },
  ];
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Select Room Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {roomTypes.map((type) => (
          <button
            key={type.id}
            className={`p-4 border rounded-lg transition-colors ${
              floorPlan.roomType === type.id 
                ? 'bg-blue-100 border-blue-500' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setRoomType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomTypeSelector;