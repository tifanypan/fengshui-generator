// import React, { useState, useEffect } from 'react';
// import useStore from '../../state/store';
// import LayoutViewer from '../results/LayoutViewer';
// import FengShuiRecommendations from '../results/FengShuiRecommendations';
// import Button from '../shared/Button';
// import { generateTestLayouts, getTestScenarios } from '../../api/testLayouts';

// const FengShuiTestingHarness = () => {
//   const { floorPlan, furniture, setRoomType, setDimensions, populateRoomFurniture } = useStore();
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [layouts, setLayouts] = useState(null);
//   const [activeLayout, setActiveLayout] = useState('optimal_layout');
//   const [error, setError] = useState(null);
//   const [showSideBySide, setShowSideBySide] = useState(false);
//   const [showDebugInfo, setShowDebugInfo] = useState(false);
//   const [testScenarios, setTestScenarios] = useState([]);
//   const [selectedScenario, setSelectedScenario] = useState(null);
//   const [lifeGoal, setLifeGoal] = useState(null);
  
//   // Fetch test scenarios
//   useEffect(() => {
//     const fetchScenarios = async () => {
//       try {
//         const response = await getTestScenarios();
//         setTestScenarios(response.data.scenarios);
//       } catch (err) {
//         console.error('Error fetching test scenarios:', err);
//         setError('Failed to load test scenarios');
//       }
//     };
    
//     fetchScenarios();
//   }, []);
  
//   const handleApplyScenario = (scenario) => {
//     setSelectedScenario(scenario);
    
//     // Apply room type and dimensions
//     setRoomType(scenario.room_type);
//     setDimensions({
//       width: scenario.dimensions.width,
//       length: scenario.dimensions.length,
//       unit: 'meters'
//     });
    
//     // Apply furniture
//     populateRoomFurniture(scenario.room_type);
    
//     // Set life goal if present
//     setLifeGoal(scenario.primary_life_goal || null);
    
//     // TODO: Apply furniture quantities
//     // Would need to update store to allow direct setting of furniture quantities
//   };
  
//   const handleRunTest = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Prepare furniture selections
//       const furnitureSelections = {
//         items: furniture.items,
//         specialConsiderations: furniture.specialConsiderations,
//         hasOutdoorSpace: furniture.hasOutdoorSpace,
//         studioConfig: furniture.studioConfig
//       };
      
//       const response = await generateTestLayouts(
//         floorPlan.id,
//         furnitureSelections,
//         lifeGoal
//       );
      
//       setLayouts(response.data.layouts);
//     } catch (err) {
//       console.error('Error generating test layouts:', err);
//       setError('Failed to generate layouts. Please check the console for details.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleExportResults = () => {
//     if (!layouts) return;
    
//     // Create a JSON file with the layout data
//     const data = JSON.stringify(layouts, null, 2);
//     const blob = new Blob([data], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
    
//     // Create a download link and trigger it
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `feng-shui-test-${new Date().toISOString()}.json`;
//     document.body.appendChild(a);
//     a.click();
    
//     // Clean up
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };
  
//   return (
//     <div className="max-w-7xl mx-auto p-4">
//       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <div className="ml-3">
//             <h3 className="text-sm font-medium text-yellow-800">Testing Environment</h3>
//             <div className="mt-2 text-sm text-yellow-700">
//               <p>This testing harness allows you to validate the feng shui engine without payment integration.</p>
//               <p>Use preset scenarios or your own data to generate and compare layouts.</p>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Left Column - Test Controls */}
//         <div className="lg:col-span-1">
//           <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
//             <h3 className="text-lg font-medium mb-4">Test Controls</h3>
            
//             {/* Preset Scenarios */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Preset Test Scenarios</label>
//               <select
//                 className="w-full p-2 border rounded-md"
//                 onChange={(e) => {
//                   const scenario = testScenarios.find(s => s.name === e.target.value);
//                   if (scenario) handleApplyScenario(scenario);
//                 }}
//                 value={selectedScenario?.name || ''}
//               >
//                 <option value="">Select a scenario...</option>
//                 {testScenarios.map((scenario) => (
//                   <option key={scenario.name} value={scenario.name}>
//                     {scenario.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             {/* Life Goal Selection */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Life Goal Optimization</label>
//               <select
//                 className="w-full p-2 border rounded-md"
//                 value={lifeGoal || ''}
//                 onChange={(e) => setLifeGoal(e.target.value || null)}
//               >
//                 <option value="">None (Standard Layout)</option>
//                 <option value="career">Career</option>
//                 <option value="wealth">Wealth</option>
//                 <option value="health">Health</option>
//                 <option value="relationships">Relationships</option>
//               </select>
//             </div>
            
//             {/* Display Options */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Display Options</label>
//               <div className="space-y-2">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={showSideBySide}
//                     onChange={() => setShowSideBySide(!showSideBySide)}
//                     className="mr-2"
//                   />
//                   <span>Show layouts side by side</span>
//                 </label>
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={showDebugInfo}
//                     onChange={() => setShowDebugInfo(!showDebugInfo)}
//                     className="mr-2"
//                   />
//                   <span>Show debug information</span>
//                 </label>
//               </div>
//             </div>
            
//             {/* Action Buttons */}
//             <div className="space-y-2">
//               <Button
//                 onClick={handleRunTest}
//                 disabled={isLoading}
//                 className="w-full"
//               >
//                 {isLoading ? 'Generating...' : 'Generate Test Layouts'}
//               </Button>
              
//               {layouts && (
//                 <Button
//                   variant="secondary"
//                   onClick={handleExportResults}
//                   className="w-full"
//                 >
//                   Export Results
//                 </Button>
//               )}
//             </div>
            
//             {error && (
//               <div className="mt-4 text-red-600 text-sm">
//                 {error}
//               </div>
//             )}
//           </div>
          
//           {/* Current Room & Furniture Info */}
//           <div className="bg-white border border-gray-300 rounded-md p-4">
//             <h3 className="text-lg font-medium mb-4">Current Test Configuration</h3>
//             <div className="space-y-2 text-sm">
//               <p><span className="font-medium">Room Type:</span> {floorPlan.roomType || 'Not set'}</p>
//               <p><span className="font-medium">Dimensions:</span> {floorPlan.dimensions.width}m × {floorPlan.dimensions.length}m</p>
//               <p><span className="font-medium">Area:</span> {(floorPlan.dimensions.width * floorPlan.dimensions.length).toFixed(2)}m²</p>
//               <p><span className="font-medium">Compass:</span> {floorPlan.compass.orientation || 'Not set'}</p>
//               <p>
//                 <span className="font-medium">Furniture Items:</span> {Object.values(furniture.items).reduce((total, item) => total + (item.quantity || 0), 0)}
//               </p>
//               <p>
//                 <span className="font-medium">Special Considerations:</span> {Object.entries(furniture.specialConsiderations)
//                   .filter(([_, value]) => value)
//                   .map(([key]) => key)
//                   .join(', ') || 'None'}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Right Column - Layout Results */}
//         <div className={`${showSideBySide ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
//           {layouts ? (
//             <>
//               {showSideBySide ? (
//                 // Side-by-side layout view
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <h3 className="text-center font-medium mb-2">Optimal Layout</h3>
//                     <LayoutViewer
//                       layouts={layouts}
//                       activeLayout="optimal_layout"
//                     />
//                   </div>
                  
//                   <div>
//                     <h3 className="text-center font-medium mb-2">Space-Conscious</h3>
//                     <LayoutViewer
//                       layouts={layouts}
//                       activeLayout="space_conscious_layout"
//                     />
//                   </div>
                  
//                   {layouts.life_goal_layout && (
//                     <div>
//                       <h3 className="text-center font-medium mb-2">
//                         {lifeGoal ? `${lifeGoal.charAt(0).toUpperCase() + lifeGoal.slice(1)} Focus` : 'Life Goal Focus'}
//                       </h3>
//                       <LayoutViewer
//                         layouts={layouts}
//                         activeLayout="life_goal_layout"
//                       />
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 // Tabbed layout view
//                 <>
//                   <div className="flex mb-4 border-b">
//                     <button
//                       className={`py-2 px-4 ${activeLayout === 'optimal_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
//                       onClick={() => setActiveLayout('optimal_layout')}
//                     >
//                       Optimal Layout
//                     </button>
//                     <button
//                       className={`py-2 px-4 ${activeLayout === 'space_conscious_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
//                       onClick={() => setActiveLayout('space_conscious_layout')}
//                     >
//                       Space-Conscious
//                     </button>
//                     {layouts.life_goal_layout && (
//                       <button
//                         className={`py-2 px-4 ${activeLayout === 'life_goal_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
//                         onClick={() => setActiveLayout('life_goal_layout')}
//                       >
//                         {lifeGoal ? `${lifeGoal.charAt(0).toUpperCase() + lifeGoal.slice(1)} Focus` : 'Life Goal Focus'}
//                       </button>
//                     )}
//                   </div>
                  
//                   <LayoutViewer
//                     layouts={layouts}
//                     activeLayout={activeLayout}
//                     onChangeLayout={setActiveLayout}
//                   />
//                 </>
//               )}
              
//               {/* Debug Information */}
//               {showDebugInfo && (
//                 <div className="bg-gray-100 border border-gray-300 rounded-md p-4 mt-4 overflow-auto max-h-80">
//                   <h3 className="text-lg font-medium mb-2">Debug Information</h3>
//                   <pre className="text-xs">{JSON.stringify(layouts, null, 2)}</pre>
//                 </div>
//               )}
              
//               {/* Feng Shui Recommendations */}
//               <div className="mt-4">
//                 <FengShuiRecommendations recommendations={layouts.recommendations || []} />
//               </div>
//             </>
//           ) : (
//             <div className="bg-white border border-gray-300 rounded-md p-6 text-center">
//               <p className="text-gray-500 mb-4">
//                 Generate layouts to view results
//               </p>
//               <img 
//                 src="/placeholder-layout.svg" 
//                 alt="Layout Placeholder" 
//                 className="max-w-md mx-auto opacity-30"
//                 onError={(e) => {
//                   e.target.style.display = 'none';
//                 }}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FengShuiTestingHarness;