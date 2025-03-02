import React from 'react';
import { getFurnitureColor, getFurnitureNameById } from '../../utils/furnitureUtils';
import { transformWithCalibration, bilinearInterpolate } from '../../utils/coordinateTransforms';

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
  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        width: imageSize.width,
        height: imageSize.height,
        zIndex: 10,
        pointerEvents: 'none'  // Allow clicks to pass through to furniture
      }}
    >
      {/* Calibration points overlay (for debugging) */}
      {isCalibrated && (
        <svg width={imageSize.width} height={imageSize.height} style={{ position: 'absolute', zIndex: 15 }}>
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
      )}
      
      {/* Display bagua map if enabled */}
      {showBagua && isCalibrated && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 16 }}>
          {Object.entries(bagua).map(([area, data]) => {
            // Calculate bagua position based on percentages within the calibrated room
            const roomX = data.x / roomWidth;
            const roomY = data.y / roomLength;
            const roomW = data.width / roomWidth;
            const roomH = data.height / roomLength;
            
            // Get the calibration points from the floor plan
            const points = floorPlan.calibration.points;
            
            // Transform to image coordinates
            const bagua1 = bilinearInterpolate(
              points[0].x, points[1].x, 
              points[3].x, points[2].x,
              roomX, roomY
            );
            
            const bagua2 = bilinearInterpolate(
              points[0].y, points[1].y, 
              points[3].y, points[2].y,
              roomX, roomY
            );
            
            const bagua3 = bilinearInterpolate(
              points[0].x, points[1].x, 
              points[3].x, points[2].x,
              roomX + roomW, roomY + roomH
            );
            
            const bagua4 = bilinearInterpolate(
              points[0].y, points[1].y, 
              points[3].y, points[2].y,
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
        </div>
      )}
      
      {/* Furniture Placements */}
      {furniturePlacements && furniturePlacements.length > 0 && (
        <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 30, pointerEvents: 'none' }}>
          {furniturePlacements.map((furniture) => {
            // Transform furniture coordinates to image scale
            const coords = transformWithCalibration(
              furniture.x,
              furniture.y, 
              furniture.width, 
              furniture.height,
              isCalibrated,
              floorPlan.calibration,
              roomWidth,
              roomLength,
              imageSize,
              bilinearInterpolate
            );
            
            // Determine if this furniture has issues (from tradeoffs)
            const hasIssues = layoutData.tradeoffs.some(t => t.item_id === furniture.item_id);
            const isSelected = selectedItem && selectedItem.item_id === furniture.item_id;
            
            return (
              <div
                key={furniture.item_id}
                className="absolute flex justify-center items-center cursor-pointer transition-all duration-200"
                style={{
                  position: 'absolute',
                  width: coords.width,
                  height: coords.height,
                  backgroundColor: getFurnitureColor(furniture),
                  border: isSelected 
                    ? '3px solid #3b82f6' 
                    : hasIssues 
                      ? '2px dashed #f43f5e' 
                      : '2px solid #333',
                  borderRadius: '2px',
                  transform: `translate(${coords.x}px, ${coords.y}px) rotate(${furniture.rotation || 0}deg)`,
                  transformOrigin: 'center',
                  fontSize: Math.max(10, Math.min(coords.width / 8, 16)),
                  color: '#fff',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected 
                    ? '0 0 10px rgba(59, 130, 246, 0.5)' 
                    : '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: isSelected ? 35 : 30,
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
    </div>
  );
};

export default FurnitureDisplay;