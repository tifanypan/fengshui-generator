// import React from 'react';
// import useStore from '../../state/store';

// const Controls = ({ 
//   onToggleSnap = () => {}, 
//   isSnapEnabled = true,
//   backgroundOpacity = 50,
//   onOpacityChange = () => {},
// }) => {
//   return (
//     <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
//       <div className="flex flex-wrap items-center gap-4">
//         <div>
//           <label className="text-sm font-medium mb-1 block">Grid Snap</label>
//           <div className="flex items-center">
//             <button
//               className={`px-3 py-1 text-sm rounded-md ${isSnapEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
//               onClick={onToggleSnap}
//             >
//               {isSnapEnabled ? 'On' : 'Off'}
//             </button>
//           </div>
//         </div>
        
//         <div>
//           <label className="text-sm font-medium mb-1 block">Grid Scale</label>
//           <div className="flex items-center">
//             <select 
//               className="border border-gray-300 rounded-md px-2 py-1 text-sm"
//             >
//               <option value="1">1 square = 1 foot</option>
//               <option value="0.5">1 square = 6 inches</option>
//               <option value="0.3048">1 square = 1 meter</option>
//               <option value="0.1">1 square = 10 cm</option>
//             </select>
//           </div>
//         </div>
        
//         <div>
//           <label className="text-sm font-medium mb-1 block">Background Opacity</label>
//           <div className="flex items-center space-x-2">
//             <input 
//               type="range" 
//               min="0" 
//               max="100" 
//               value={backgroundOpacity}
//               onChange={(e) => onOpacityChange(parseInt(e.target.value))}
//               className="w-24"
//             />
//             <span className="text-sm">{backgroundOpacity}%</span>
//           </div>
//         </div>
//       </div>
    
//       <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
//       <p><strong>Tip:</strong> Use the R key to rotate selected elements by 90°. Drag the rotation handle for precise angles.</p>
//       <p><strong>Navigation:</strong> Click and drag to move around. Use the mouse wheel to zoom.</p>
//     </div>
//   </div>
// );
// };

// export default Controls;