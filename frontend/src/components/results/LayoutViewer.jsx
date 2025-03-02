import React, { useState, useEffect, useRef } from 'react';
import useStore from '../../state/store';
import Button from '../shared/Button';

const LayoutViewer = ({ layouts, activeLayout = 'optimal_layout', onChangeLayout }) => {
  const { floorPlan } = useStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBagua, setShowBagua] = useState(false);
  const [showEnergy, setShowEnergy] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [isCalibrated, setIsCalibrated] = useState(false);
  
  // Refs for the container and original floor plan image
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  const layoutData = layouts ? layouts[activeLayout] : null;
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Reset selected item when layout changes
  useEffect(() => {
    setSelectedItem(null);
  }, [activeLayout]);
  
  // Check if calibration data exists
  useEffect(() => {
    if (floorPlan.calibration?.points && floorPlan.calibration.points.length === 4) {
      setIsCalibrated(true);
    } else {
      setIsCalibrated(false);
    }
  }, [floorPlan.calibration]);
  
  // Initialize image dimensions when the image loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { width, height, naturalWidth, naturalHeight } = imageRef.current;
      setImageSize({
        width,
        height,
        naturalWidth,
        naturalHeight
      });
      setImageLoaded(true);
    }
  };
  
  // Adjust container dimensions based on image size
  useEffect(() => {
    if (containerRef.current && imageLoaded && imageSize.width > 0) {
      containerRef.current.style.width = `${imageSize.width * zoomLevel}px`;
      containerRef.current.style.height = `${imageSize.height * zoomLevel}px`;
    }
  }, [imageSize, zoomLevel, imageLoaded]);
  
  if (!layoutData) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 text-center">
        <p className="text-gray-500">No layout data available</p>
      </div>
    );
  }
  
  // Get room dimensions from the layout data or fallback to floorPlan
  const roomWidth = layouts.room_analysis?.dimensions?.width || floorPlan.dimensions.width || 3;
  const roomLength = layouts.room_analysis?.dimensions?.length || floorPlan.dimensions.length || 4;
  
  const furniturePlacements = layoutData.furniture_placements || [];
  const bagua = layouts.room_analysis?.bagua_map || {};
  const energyFlows = layouts.room_analysis?.energy_flow || {};
  
  // Find any tradeoffs for the selected item
  const selectedItemTradeoffs = selectedItem 
    ? layoutData.tradeoffs.filter(t => t.item_id === selectedItem.item_id)
    : [];
  
  // Function to transform room coordinates to image coordinates using calibration
  const transformWithCalibration = (x, y, width, height) => {
    // If not calibrated, use simple scaling (centered on image)
    if (!isCalibrated || !floorPlan.calibration) {
      const scaleX = imageSize.width / roomWidth;
      const scaleY = imageSize.height / roomLength;
      
      return {
        x: x * scaleX,
        y: y * scaleY,
        width: width * scaleX,
        height: height * scaleY
      };
    }
    
    // With calibration, use the calibration points to create a transformation
    const calibration = floorPlan.calibration;
    const points = calibration.points;
    
    // Calculate room coordinates as percentages of room dimensions
    const roomX = x / roomWidth;
    const roomY = y / roomLength;
    const roomW = width / roomWidth;
    const roomH = height / roomLength;
    
    // Use bilinear interpolation to map room coordinates to image coordinates
    // For the top-left corner of the furniture
    const topLeftX = bilinearInterpolate(
      points[0].x, points[1].x, points[3].x, points[2].x,
      roomX, roomY
    );
    
    const topLeftY = bilinearInterpolate(
      points[0].y, points[1].y, points[3].y, points[2].y,
      roomX, roomY
    );
    
    // For the bottom-right corner of the furniture
    const bottomRightX = bilinearInterpolate(
      points[0].x, points[1].x, points[3].x, points[2].x,
      roomX + roomW, roomY + roomH
    );
    
    const bottomRightY = bilinearInterpolate(
      points[0].y, points[1].y, points[3].y, points[2].y,
      roomX + roomW, roomY + roomH
    );
    
    // Calculate width and height in image coordinates
    const imageWidth = bottomRightX - topLeftX;
    const imageHeight = bottomRightY - topLeftY;
    
    return {
      x: topLeftX,
      y: topLeftY,
      width: imageWidth,
      height: imageHeight
    };
  };
  
  // Bilinear interpolation function
  const bilinearInterpolate = (q00, q10, q01, q11, x, y) => {
    // Ensure x and y are bounded between 0 and 1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    
    // Interpolate
    const r1 = (1 - x) * q00 + x * q10;
    const r2 = (1 - x) * q01 + x * q11;
    return (1 - y) * r1 + y * r2;
  };
  
  // Calculate direction labels based on compass orientation
  const getDirectionLabels = () => {
    const orientation = floorPlan.compass?.orientation || 'N';
    const directions = {
      N: { top: 'N', right: 'E', bottom: 'S', left: 'W' },
      E: { top: 'E', right: 'S', bottom: 'W', left: 'N' },
      S: { top: 'S', right: 'W', bottom: 'N', left: 'E' },
      W: { top: 'W', right: 'N', bottom: 'E', left: 'S' }
    };
    return directions[orientation] || directions.N;
  };
  
  const directionLabels = getDirectionLabels();
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {activeLayout === 'optimal_layout' && 'Optimal Feng Shui Layout'}
          {activeLayout === 'space_conscious_layout' && 'Space-Conscious Layout'}
          {activeLayout === 'life_goal_layout' && 'Life Goal Optimized Layout'}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={handleZoomOut} className="px-2 py-1 text-sm">-</Button>
            <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="secondary" onClick={handleZoomIn} className="px-2 py-1 text-sm">+</Button>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showBagua}
                onChange={() => setShowBagua(!showBagua)}
                className="mr-1"
              />
              Bagua
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showEnergy}
                onChange={() => setShowEnergy(!showEnergy)}
                className="mr-1"
              />
              Energy Flow
            </label>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showDimensions}
                onChange={() => setShowDimensions(!showDimensions)}
                className="mr-1"
              />
              Dimensions
            </label>
          </div>
        </div>
      </div>
      
      {!isCalibrated && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> For best results, please calibrate your room by marking its corners.
            This ensures furniture is positioned correctly on your floor plan.
          </p>
        </div>
      )}
      
      <div className="flex justify-center mb-4 overflow-auto">
        <div className="relative" style={{ maxWidth: '100%', maxHeight: '70vh', overflow: 'auto' }}>
          {/* Container for floor plan and overlays with zoom applied */}
          <div 
            ref={containerRef}
            className="relative"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left'
            }}
          >
            {/* Original floor plan image */}
            {floorPlan.fileUrl ? (
              <img
                ref={imageRef}
                src={floorPlan.fileUrl}
                alt="Floor Plan"
                className="max-w-full"
                style={{ display: imageLoaded ? 'block' : 'none' }}
                onLoad={handleImageLoad}
              />
            ) : (
              <div 
                className="bg-gray-100 flex items-center justify-center text-gray-400"
                style={{ width: '800px', height: '600px' }}
              >
                No floor plan image available
              </div>
            )}
            
            {/* Loading indicator */}
            {floorPlan.fileUrl && !imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <p>Loading floor plan...</p>
              </div>
            )}
            
            {/* Calibration points overlay (for debugging) */}
            {isCalibrated && (
              <div className="absolute top-0 left-0 pointer-events-none">
                <svg width={imageSize.width} height={imageSize.height}>
                  {/* Draw the calibration area */}
                  <polygon 
                    points={floorPlan.calibration.points.map(p => `${p.x},${p.y}`).join(' ')} 
                    fill="none" 
                    stroke="rgba(0, 255, 0, 0.3)" 
                    strokeWidth="2"
                  />
                  
                  {/* Draw the calibration points */}
                  {floorPlan.calibration.points.map((point, index) => (
                    <circle 
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="rgba(0, 255, 0, 0.5)"
                    />
                  ))}
                </svg>
              </div>
            )}
            
            {/* Overlay layers - only show when image is loaded */}
            {imageLoaded && (
              <div 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ 
                  width: imageSize.width,
                  height: imageSize.height
                }}
              >
                {/* Display bagua map if enabled */}
                {showBagua && isCalibrated && Object.entries(bagua).map(([area, data]) => {
                  // Calculate bagua position based on percentages within the calibrated room
                  const roomX = data.x / roomWidth;
                  const roomY = data.y / roomLength;
                  const roomW = data.width / roomWidth;
                  const roomH = data.height / roomLength;
                  
                  // Transform to image coordinates
                  const bagua1 = bilinearInterpolate(
                    floorPlan.calibration.points[0].x, floorPlan.calibration.points[1].x, 
                    floorPlan.calibration.points[3].x, floorPlan.calibration.points[2].x,
                    roomX, roomY
                  );
                  
                  const bagua2 = bilinearInterpolate(
                    floorPlan.calibration.points[0].y, floorPlan.calibration.points[1].y, 
                    floorPlan.calibration.points[3].y, floorPlan.calibration.points[2].y,
                    roomX, roomY
                  );
                  
                  const bagua3 = bilinearInterpolate(
                    floorPlan.calibration.points[0].x, floorPlan.calibration.points[1].x, 
                    floorPlan.calibration.points[3].x, floorPlan.calibration.points[2].x,
                    roomX + roomW, roomY + roomH
                  );
                  
                  const bagua4 = bilinearInterpolate(
                    floorPlan.calibration.points[0].y, floorPlan.calibration.points[1].y, 
                    floorPlan.calibration.points[3].y, floorPlan.calibration.points[2].y,
                    roomX + roomW, roomY + roomH
                  );
                  
                  const coords = {
                    x: bagua1,
                    y: bagua2,
                    width: bagua3 - bagua1,
                    height: bagua4 - bagua2
                  };
                  
                  return (
                    <div
                      key={area}
                      className="absolute opacity-20"
                      style={{
                        left: coords.x,
                        top: coords.y,
                        width: coords.width,
                        height: coords.height,
                        backgroundColor: data.colors ? data.colors[0] : '#ccc',
                        border: '1px dashed #666'
                      }}
                    >
                      <div className="text-xs opacity-70 text-center mt-2 font-medium">
                        {data.life_area}
                      </div>
                    </div>
                  );
                })}
                
                {/* Display energy flow if enabled */}
                {showEnergy && energyFlows.flow_paths && energyFlows.flow_paths.map((path, index) => {
                  // Transform energy flow coordinates using calibration
                  const start = transformWithCalibration(path.start_x, path.start_y, 0, 0);
                  const end = transformWithCalibration(path.end_x, path.end_y, 0, 0);
                  
                  return (
                    <svg
                      key={`flow-${index}`}
                      className="absolute top-0 left-0"
                      style={{
                        width: imageSize.width,
                        height: imageSize.height,
                        zIndex: 5
                      }}
                    >
                      <defs>
                        <marker
                          id={`arrow-${index}`}
                          viewBox="0 0 10 10"
                          refX="5"
                          refY="5"
                          markerWidth="4"
                          markerHeight="4"
                          orient="auto-start-reverse"
                        >
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(0, 100, 255, 0.5)" />
                        </marker>
                      </defs>
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(0, 100, 255, 0.5)"
                        strokeWidth="4"
                        markerEnd={`url(#arrow-${index})`}
                        strokeDasharray="5,5"
                      />
                    </svg>
                  );
                })}
                
                {/* Furniture Placements */}
                {furniturePlacements && furniturePlacements.length > 0 && (
                  <div className="absolute top-0 left-0 w-full h-full">
                    {furniturePlacements.map((furniture) => {
                      // Transform furniture coordinates to image scale
                      const coords = transformWithCalibration(
                        furniture.x, 
                        furniture.y, 
                        furniture.width, 
                        furniture.height
                      );
                      
                      // Determine if this furniture has issues (from tradeoffs)
                      const hasIssues = layoutData.tradeoffs.some(t => t.item_id === furniture.item_id);
                      const isSelected = selectedItem && selectedItem.item_id === furniture.item_id;
                      
                      // Determine rotation center
                      const centerX = coords.x + coords.width / 2;
                      const centerY = coords.y + coords.height / 2;
                      
                      return (
                        <div
                          key={furniture.item_id}
                          className="absolute flex justify-center items-center cursor-pointer transition-all duration-200"
                          style={{
                            left: coords.x,
                            top: coords.y,
                            width: coords.width,
                            height: coords.height,
                            backgroundColor: getFurnitureColor(furniture),
                            border: isSelected 
                              ? '3px solid #3b82f6' 
                              : hasIssues 
                                ? '2px dashed #f43f5e' 
                                : '2px solid #333',
                            borderRadius: '2px',
                            transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px) rotate(${furniture.rotation || 0}deg) translate(-50%, -50%)`,
                            fontSize: Math.max(10, Math.min(coords.width / 8, 16)),
                            color: '#fff',
                            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            boxShadow: isSelected 
                              ? '0 0 10px rgba(59, 130, 246, 0.5)' 
                              : '0 2px 4px rgba(0,0,0,0.2)',
                            zIndex: isSelected ? 20 : 10,
                            pointerEvents: 'auto'  // Make furniture clickable
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(furniture);
                          }}
                        >
                          {furniture.name || getFurnitureNameById(furniture.base_id)}
                          
                          {/* Command position indicator */}
                          {furniture.in_command_position && (
                            <div 
                              className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full border border-white"
                              title="In command position"
                            />
                          )}
                          
                          {/* Wall support indicator */}
                          {furniture.against_wall && (
                            <div 
                              className="absolute top-0 left-0 bg-blue-500 w-3 h-3 rounded-full border border-white"
                              title="Solid wall support"
                            />
                          )}
                          
                          {/* Issue indicator */}
                          {hasIssues && !isSelected && (
                            <div 
                              className="absolute bottom-0 right-0 bg-red-500 w-3 h-3 rounded-full border border-white"
                              title="Has feng shui issues"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Direction indicators if dimensions are enabled */}
                {showDimensions && (
                  <>
                    <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
                      top: 5, 
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}>
                      {directionLabels.top}
                    </div>
                    <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
                      bottom: 5, 
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}>
                      {directionLabels.bottom}
                    </div>
                    <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
                      left: 5, 
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      {directionLabels.left}
                    </div>
                    <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
                      right: 5, 
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}>
                      {directionLabels.right}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Layout Statistics & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Selected item details */}
        <div className="md:col-span-1 border rounded-md p-3">
          {selectedItem ? (
            <div>
              <h4 className="font-medium text-lg mb-2">{selectedItem.name || getFurnitureNameById(selectedItem.base_id)}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Dimensions:</span>
                  <div>{selectedItem.width}" × {selectedItem.height}"</div>
                </div>
                <div>
                  <span className="text-gray-500">Rotation:</span>
                  <div>{selectedItem.rotation || 0}°</div>
                </div>
                <div>
                  <span className="text-gray-500">Position:</span>
                  <div>x: {selectedItem.x.toFixed(1)}, y: {selectedItem.y.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Feng Shui:</span>
                  <div className={`font-medium ${getFengShuiQualityColor(selectedItem.feng_shui_quality)}`}>
                    {selectedItem.feng_shui_quality || 'Not rated'}
                  </div>
                </div>
              </div>
              
              {/* Feng Shui attributes */}
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedItem.in_command_position && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Command Position
                  </span>
                )}
                {selectedItem.against_wall && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Wall Support
                  </span>
                )}
                {selectedItem.bagua_area && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {selectedItem.bagua_area.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Area
                  </span>
                )}
              </div>
              
              {/* Issues/Tradeoffs for this item */}
              {selectedItemTradeoffs.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-1 text-red-600">Issues</h5>
                  <ul className="text-xs space-y-2">
                    {selectedItemTradeoffs.map((tradeoff, index) => (
                      <li key={index} className="border-l-2 border-red-400 pl-2">
                        <p className="font-medium">{tradeoff.description}</p>
                        {tradeoff.mitigation && (
                          <p className="text-gray-600 italic mt-0.5">{tradeoff.mitigation}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button
                className="mt-3 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedItem(null)}
              >
                Clear selection
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Click on a furniture item to see details
            </div>
          )}
        </div>
        
        {/* Center: Layout statistics */}
        <div className="md:col-span-1 border rounded-md p-3">
          <h4 className="font-medium mb-2">Feng Shui Score</h4>
          <div className="flex justify-between items-center mb-3">
            <div className="bg-gray-200 h-4 w-full rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{
                  width: `${layoutData.feng_shui_score}%`,
                  backgroundColor: getScoreColor(layoutData.feng_shui_score)
                }}
              />
            </div>
            <span className="ml-3 font-bold">{layoutData.feng_shui_score}/100</span>
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Items in command position:</span>
              <span className="font-medium">{countItemsInCommandPosition(furniturePlacements)}</span>
            </div>
            <div className="flex justify-between">
              <span>Items against wall:</span>
              <span className="font-medium">{countItemsAgainstWall(furniturePlacements)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total furniture pieces:</span>
              <span className="font-medium">{furniturePlacements.length}</span>
            </div>
          </div>
          
          {/* If life goal layout, show goal details */}
          {activeLayout === 'life_goal_layout' && layoutData.life_goal && (
            <div className="mt-3 bg-indigo-50 p-2 rounded border border-indigo-100">
              <h5 className="font-medium text-sm text-indigo-800">Life Goal Focus</h5>
              <p className="text-xs text-indigo-700">
                This layout is optimized for {layoutData.life_goal.charAt(0).toUpperCase() + layoutData.life_goal.slice(1)}
              </p>
            </div>
          )}
          
          {/* If kua number available, show it */}
          {layouts.kua_number && (
            <div className="mt-3 bg-teal-50 p-2 rounded border border-teal-100">
              <h5 className="font-medium text-sm text-teal-800">Personal Feng Shui</h5>
              <div className="text-xs text-teal-700">
                <div>Kua Number: <span className="font-medium">{layouts.kua_number}</span></div>
                <div>Group: <span className="font-medium">{layouts.kua_group}</span></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right: Tradeoffs/Warnings */}
        <div className="md:col-span-1 border rounded-md p-3">
          <h4 className="font-medium mb-2">Feng Shui Considerations</h4>
          
          {layoutData.tradeoffs && layoutData.tradeoffs.length > 0 ? (
            <div className="max-h-40 overflow-y-auto pr-1">
              <ul className="text-xs space-y-2">
                {layoutData.tradeoffs.map((tradeoff, index) => (
                  <li key={index} className={`p-1.5 rounded ${getSeverityBackground(tradeoff.severity)}`}>
                    <p className="font-medium">
                      {getFurnitureName(tradeoff.item_id, furniturePlacements)}: {tradeoff.description}
                    </p>
                    {tradeoff.mitigation && (
                      <p className="text-gray-700 mt-0.5 text-xs">{tradeoff.mitigation}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-green-600">
              No feng shui issues detected in this layout!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions

// Get color based on feng shui quality
const getFengShuiQualityColor = (quality) => {
  switch (quality) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-emerald-600';
    case 'fair': return 'text-amber-600';
    case 'poor': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

// Get background color based on issue severity
const getSeverityBackground = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-50';
    case 'medium': return 'bg-amber-50';
    case 'low': return 'bg-blue-50';
    default: return 'bg-gray-50';
  }
};

// Determine furniture color based on various factors
const getFurnitureColor = (furniture) => {
  // Base color from furniture type
  const baseColor = getFurnitureBaseColor(furniture.base_id);
  
  // Apply quality tint with semi-transparency for overlay
  if (furniture.feng_shui_quality) {
    const qualityColors = {
      'excellent': 'rgba(46, 139, 87, 0.65)',   // Green
      'good': 'rgba(60, 179, 113, 0.65)',       // Medium Green
      'fair': 'rgba(255, 165, 0, 0.65)',        // Orange
      'poor': 'rgba(255, 99, 71, 0.65)'         // Red
    };
    
    // Use quality color
    return qualityColors[furniture.feng_shui_quality] || baseColor;
  }
  
  return baseColor;
};

// Get base color for furniture type
const getFurnitureBaseColor = (id) => {
  if (!id) return 'rgba(128, 128, 128, 0.65)';
  
  // Color by furniture type with higher transparency for overlay
  if (id.includes('bed')) return 'rgba(70, 130, 180, 0.65)';      // Steel Blue for beds
  if (id.includes('desk')) return 'rgba(60, 179, 113, 0.65)';     // Medium Sea Green for desks
  if (id.includes('table')) return 'rgba(210, 105, 30, 0.65)';    // Chocolate for tables
  if (id.includes('sofa')) return 'rgba(147, 112, 219, 0.65)';    // Medium Purple for sofas
  if (id.includes('chair')) return 'rgba(244, 164, 96, 0.65)';    // Sandy Brown for chairs
  if (id.includes('shelf') || id.includes('case')) return 'rgba(139, 69, 19, 0.65)'; // Saddle Brown for shelves
  if (id.includes('dresser') || id.includes('cabinet')) return 'rgba(85, 107, 47, 0.65)'; // Dark Olive Green for storage
  if (id.includes('plant')) return 'rgba(34, 139, 34, 0.65)';     // Forest Green for plants
  if (id.includes('lamp')) return 'rgba(218, 165, 32, 0.65)';     // Goldenrod for lamps
  if (id.includes('mirror')) return 'rgba(70, 130, 180, 0.65)';   // Light blue for mirrors

  return 'rgba(128, 128, 128, 0.65)'; // Default gray
};

// Format a furniture ID into a readable name
const getFurnitureNameById = (id) => {
  if (!id) return 'Unknown Item';
  
  // Convert snake_case or camelCase to Title Case with spaces
  return id
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
};

// Get color based on feng shui score
const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';  // Green
  if (score >= 60) return '#8BC34A';  // Light Green
  if (score >= 40) return '#FFC107';  // Amber
  if (score >= 20) return '#FF9800';  // Orange
  return '#F44336';                   // Red
};

// Count items in command position
const countItemsInCommandPosition = (furniturePlacements) => {
  if (!furniturePlacements) return 0;
  return furniturePlacements.filter(item => item.in_command_position).length;
};

// Count items against wall
const countItemsAgainstWall = (furniturePlacements) => {
  if (!furniturePlacements) return 0;
  return furniturePlacements.filter(item => item.against_wall).length;
};

// Get furniture name from item ID
const getFurnitureName = (itemId, furniturePlacements) => {
  if (!furniturePlacements) return itemId;
  const furniture = furniturePlacements.find(item => item.item_id === itemId);
  return furniture ? furniture.name || getFurnitureNameById(furniture.base_id) : itemId;
};

export default LayoutViewer;