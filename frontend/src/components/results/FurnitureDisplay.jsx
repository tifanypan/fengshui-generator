import React, { useEffect } from 'react';
import { getFurnitureColor, getFurnitureNameById } from '../../utils/furnitureUtils';

/**
 * Component to display furniture and overlays on the floor plan
 */
const FurnitureDisplay = ({
  floorPlan,
  imageSize,
  isCalibrated,
  showBagua,
  showEnergy,
  showDimensions,
  furniturePlacements,
  bagua,
  energyFlows,
  layoutData,
  selectedItem,
  setSelectedItem,
  roomWidth,
  roomLength,
  directionLabels,
}) => {
  // Add a state variable to control showing the calibration boundary
  const showCalibrationBoundary = true; // You can make this a prop or toggle
  
  // Get wall highlights from the floorPlan state
  const wallHighlights = floorPlan.highlights?.items || [];

  // Log when component mounts to debug the wall data
  useEffect(() => {
    console.log("Wall highlights:", wallHighlights);
    console.log("Furniture placements:", furniturePlacements);
    console.log("Room dimensions:", roomWidth, "x", roomLength);
    console.log("Image size:", imageSize);
  }, []);

  // Calculate room boundaries from walls
  const calculateRoomBoundaries = () => {
    const walls = wallHighlights.filter(item => item.type === 'wall');
    
    let boundaries = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    };
    
    // Find the minimum/maximum coordinates to create a bounding box
    if (walls.length > 0) {
      walls.forEach(wall => {
        boundaries.minX = Math.min(boundaries.minX, wall.left);
        boundaries.minY = Math.min(boundaries.minY, wall.top);
        boundaries.maxX = Math.max(boundaries.maxX, wall.left + wall.width);
        boundaries.maxY = Math.max(boundaries.maxY, wall.top + wall.height);
      });
      
      // Add some padding inside the walls to ensure furniture isn't placed on walls
      const padding = 5;
      boundaries.minX += padding;
      boundaries.minY += padding;
      boundaries.maxX -= padding;
      boundaries.maxY -= padding;
    } else {
      // If no walls, use image dimensions
      boundaries = {
        minX: 0,
        minY: 0,
        maxX: imageSize.width,
        maxY: imageSize.height
      };
    }
    
    return {
      ...boundaries,
      width: boundaries.maxX - boundaries.minX,
      height: boundaries.maxY - boundaries.minY
    };
  };
  
  const roomBoundaries = calculateRoomBoundaries();
  
  // Convert furniture coordinates to screen coordinates within the wall boundaries
  const positionFurniture = (furniture, index, totalFurniture) => {
    // For the mock data, we need to distribute furniture within the actual wall boundaries
    // This approach divides the available space based on total furniture
    
    // Calculate rows and columns for a grid layout
    const itemsPerRow = Math.ceil(Math.sqrt(totalFurniture));
    const rows = Math.ceil(totalFurniture / itemsPerRow);
    
    // Calculate grid position
    const rowIndex = Math.floor(index / itemsPerRow);
    const colIndex = index % itemsPerRow;
    
    // Calculate cell size
    const cellWidth = roomBoundaries.width / itemsPerRow;
    const cellHeight = roomBoundaries.height / rows;
    
    // Calculate position within the cell (with some margin)
    const margin = 5;
    const posX = roomBoundaries.minX + (colIndex * cellWidth) + (cellWidth / 2);
    const posY = roomBoundaries.minY + (rowIndex * cellHeight) + (cellHeight / 2);
    
    // Scale furniture based on the available cell size and furniture dimensions
    // Use a percentage of the cell size to leave some spacing
    const maxWidth = cellWidth * 0.8;
    const maxHeight = cellHeight * 0.8;
    
    // Calculate aspect ratio of furniture
    const furnitureRatio = furniture.width / furniture.height;
    
    // Determine scaled dimensions based on aspect ratio
    let scaledWidth, scaledHeight;
    
    if (furnitureRatio > 1) {
      // Wider than tall
      scaledWidth = Math.min(maxWidth, furniture.width);
      scaledHeight = scaledWidth / furnitureRatio;
    } else {
      // Taller than wide
      scaledHeight = Math.min(maxHeight, furniture.height);
      scaledWidth = scaledHeight * furnitureRatio;
    }
    
    // Ensure minimum size
    scaledWidth = Math.max(scaledWidth, 20);
    scaledHeight = Math.max(scaledHeight, 20);
    
    return {
      x: posX,
      y: posY,
      width: scaledWidth,
      height: scaledHeight
    };
  };

  return (
    <>
      {/* Draw room boundaries for debugging */}
      <div style={{
        position: 'absolute',
        left: roomBoundaries.minX,
        top: roomBoundaries.minY,
        width: roomBoundaries.width,
        height: roomBoundaries.height,
        border: '1px dashed blue',
        zIndex: 11,
        pointerEvents: 'none'
      }} />
      
      {/* Wall Boundaries Layer - Show walls defined in step 2 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15 }}>
        {wallHighlights.filter(item => item.type === 'wall').map((wall, index) => (
          <div
            key={`wall-${index}`}
            style={{
              position: 'absolute',
              left: wall.left,
              top: wall.top,
              width: wall.width,
              height: wall.height,
              backgroundColor: 'rgba(76, 175, 80, 0.7)', // Green with higher opacity
              border: '1px solid white',
              zIndex: 15
            }}
          />
        ))}
        
        {/* Other room features like doors, windows, etc. */}
        {wallHighlights.filter(item => item.type !== 'wall').map((item, index) => (
          <div
            key={`room-feature-${index}`}
            style={{
              position: 'absolute',
              left: item.left,
              top: item.top,
              width: item.width,
              height: item.height,
              backgroundColor: getHighlightColor(item.type),
              border: '1px solid black',
              zIndex: 15
            }}
          />
        ))}
      </div>
      
      {/* Display bagua map if enabled */}
      {showBagua && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 16 }}>
          {Object.entries(bagua).map(([area, data], index) => {
            // Position bagua areas relative to room boundaries
            const baWidth = roomBoundaries.width / 3;
            const baHeight = roomBoundaries.height / 3;
            
            // Calculate grid position (3x3 grid)
            const row = Math.floor(index / 3);
            const col = index % 3;
            
            const baX = roomBoundaries.minX + (col * baWidth);
            const baY = roomBoundaries.minY + (row * baHeight);
            
            return (
              <div
                key={area}
                className="absolute opacity-20"
                style={{
                  left: baX,
                  top: baY,
                  width: baWidth,
                  height: baHeight,
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
        </div>
      )}
      
      {/* Furniture Placements - Give this the highest z-index */}
      {furniturePlacements && furniturePlacements.length > 0 && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 30 
          }}
        >
          {furniturePlacements.map((furniture, index) => {
            // Position and scale the furniture based on room boundaries
            const coords = positionFurniture(furniture, index, furniturePlacements.length);
            
            // Determine if this furniture has issues (from tradeoffs)
            const hasIssues = layoutData.tradeoffs && layoutData.tradeoffs.some(t => t.item_id === furniture.item_id);
            const isSelected = selectedItem && selectedItem.item_id === furniture.item_id;
            
            return (
              <div
                key={furniture.item_id}
                className="flex justify-center items-center cursor-pointer transition-all duration-200"
                style={{
                  position: 'absolute',
                  left: coords.x - (coords.width / 2), // Center the furniture
                  top: coords.y - (coords.height / 2), // Center the furniture
                  width: coords.width,
                  height: coords.height,
                  backgroundColor: getFurnitureColor(furniture),
                  border: isSelected 
                    ? '3px solid #3b82f6' 
                    : hasIssues 
                      ? '2px dashed #f43f5e' 
                      : '2px solid #333',
                  borderRadius: '2px',
                  transform: `rotate(${furniture.rotation || 0}deg)`,
                  transformOrigin: 'center',
                  fontSize: Math.max(8, Math.min(coords.width / 10, 14)),
                  color: '#fff',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected 
                    ? '0 0 10px rgba(59, 130, 246, 0.5)' 
                    : '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: isSelected ? 35 : 30,
                  pointerEvents: 'auto',  // Make furniture clickable
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
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
            transform: 'translateX(-50%)',
            zIndex: 40
          }}>
            {directionLabels.top}
          </div>
          <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
            bottom: 5, 
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40
          }}>
            {directionLabels.bottom}
          </div>
          <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
            left: 5, 
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 40
          }}>
            {directionLabels.left}
          </div>
          <div className="absolute text-xs font-medium text-blue-700 bg-white px-1 rounded" style={{ 
            right: 5, 
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 40
          }}>
            {directionLabels.right}
          </div>
        </>
      )}
    </>
  );
};

// Helper function to get the highlight color based on type
const getHighlightColor = (type) => {
  const highlightColors = {
    wall: 'rgba(76, 175, 80, 0.7)', // Green with higher opacity
    door: 'rgba(244, 67, 54, 0.5)',
    window: 'rgba(33, 150, 243, 0.5)',
    closet: 'rgba(156, 39, 176, 0.5)',
    column: 'rgba(255, 152, 0, 0.5)',
    fireplace: 'rgba(156, 39, 176, 0.5)',
    radiator: 'rgba(121, 85, 72, 0.5)',
    nofurniture: 'rgba(255, 235, 59, 0.3)'
  };
  
  return highlightColors[type] || 'rgba(0, 0, 0, 0.3)';
};

export default FurnitureDisplay;