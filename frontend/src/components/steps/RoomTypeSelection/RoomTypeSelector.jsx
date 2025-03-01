import React from 'react';
import useStore from '../../../state/store';

const RoomTypeSelector = () => {
  const { floorPlan, setRoomType } = useStore();

  const roomTypes = [
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'office', label: 'Office' },
    { id: 'bedroom_office', label: 'Bedroom + Office' },
    { id: 'living_room', label: 'Living Room' },
    { id: 'dining_room', label: 'Dining Room' },
    { id: 'kitchen_dining', label: 'Kitchen-Dining' },
    { id: 'kitchen_dining_living', label: 'Kitchen-Dining-Living' },
    { id: 'studio', label: 'Studio (Multi-purpose)' },
  ];

  return (
    <div className="mb-4">
      <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
        Select Room Type
      </label>
      <select
        id="roomType"
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        value={floorPlan.roomType || ''}
        onChange={(e) => setRoomType(e.target.value)}
      >
        {roomTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoomTypeSelector;
