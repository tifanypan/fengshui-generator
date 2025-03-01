// // src/components/steps/FurnitureSelection/RoomTypeChanger.jsx
// import React, { useState } from 'react';
// import useStore from '../../../state/store';

// const RoomTypeChanger = () => {
//   const { floorPlan, setRoomType } = useStore();
//   const [isChanging, setIsChanging] = useState(false);
  
//   const roomTypes = [
//     { id: 'bedroom', label: 'Bedroom' },
//     { id: 'office', label: 'Office' },
//     { id: 'bedroom_office', label: 'Bedroom + Office' },
//     { id: 'living_room', label: 'Living Room' },
//     { id: 'dining_room', label: 'Dining Room' },
//     { id: 'kitchen_dining', label: 'Kitchen-Dining' },
//     { id: 'kitchen_dining_living', label: 'Kitchen-Dining-Living' },
//     { id: 'studio', label: 'Studio (Multi-purpose)' },
//   ];
  
//   const handleRoomTypeChange = (typeId) => {
//     if (typeId !== floorPlan.roomType) {
//       if (confirm("Changing room type will reset your furniture selection. Are you sure you want to continue?")) {
//         setRoomType(typeId);
//       }
//     }
//     setIsChanging(false);
//   };
  
//   const currentRoomType = roomTypes.find(type => type.id === floorPlan.roomType);
  
//   return (
//     <div className="relative">
//       {!isChanging ? (
//         <button
//           className="px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
//           onClick={() => setIsChanging(true)}
//         >
//           Change Room Type: {currentRoomType?.label || 'None'}
//         </button>
//       ) : (
//         <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-3 z-10 w-72">
//           <h4 className="font-medium mb-2">Select Room Type</h4>
//           <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
//             {roomTypes.map((type) => (
//               <button
//                 key={type.id}
//                 className={`text-left p-2 rounded ${
//                   floorPlan.roomType === type.id 
//                     ? 'bg-blue-500 text-white' 
//                     : 'hover:bg-gray-100'
//                 }`}
//                 onClick={() => handleRoomTypeChange(type.id)}
//               >
//                 {type.label}
//               </button>
//             ))}
//           </div>
//           <button
//             className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
//             onClick={() => setIsChanging(false)}
//           >
//             Cancel
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomTypeChanger;