import React, { useState, useEffect } from 'react';
import useStore from '../../state/store';
import Button from '../shared/Button';

const LayoutViewer = ({ layouts, activeLayout = 'optimal_layout', onChangeLayout }) => {
  const { floorPlan } = useStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const layoutData = layouts ? layouts[activeLayout] : null;
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Debug output to console
  useEffect(() => {
    if (layouts && layoutData) {
      console.log('Current layout data:', layoutData);
      console.log('Furniture placements:', layoutData.furniture_placements);
    }
  }, [layouts, layoutData]);
  
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
  
  // Calculate scale factor to fit room in viewer
  const maxViewerWidth = 800; // Maximum width of the viewer
  const maxViewerHeight = 600; // Maximum height of the viewer
  const widthScale = maxViewerWidth / roomWidth;
  const heightScale = maxViewerHeight / roomLength;
  const scale = Math.min(widthScale, heightScale) * 0.9; // 90% to leave some margin
  
  const furniturePlacements = layoutData.furniture_placements || [];
  const bagua = layouts.room_analysis?.bagua_map || {};
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {activeLayout === 'optimal_layout' && 'Optimal Feng Shui Layout'}
          {activeLayout === 'space_conscious_layout' && 'Space-Conscious Layout'}
          {activeLayout === 'life_goal_layout' && 'Life Goal Optimized Layout'}
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handleZoomOut}>-</Button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <Button variant="secondary" onClick={handleZoomIn}>+</Button>
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <div 
          className="relative border border-gray-400 bg-gray-50"
          style={{
            width: roomWidth * scale * zoomLevel,
            height: roomLength * scale * zoomLevel,
            overflow: 'hidden'
          }}
        >
          {/* Bagua Areas */}
          {Object.entries(bagua).map(([area, data]) => (
            <div
              key={area}
              className="absolute opacity-20"
              style={{
                left: data.x * scale * zoomLevel,
                top: data.y * scale * zoomLevel,
                width: data.width * scale * zoomLevel,
                height: data.height * scale * zoomLevel,
                backgroundColor: data.colors ? data.colors[0] : '#ccc',
                border: '1px dashed #666'
              }}
            >
              <div className="text-xs text-center mt-2 font-medium">{data.life_area}</div>
            </div>
          ))}
          
          {/* Room Elements */}
          {layouts.room_analysis?.elements?.map((element, index) => (
            <div
              key={`element-${index}`}
              className="absolute"
              style={{
                left: element.x * scale * zoomLevel,
                top: element.y * scale * zoomLevel,
                width: element.width * scale * zoomLevel,
                height: element.height * scale * zoomLevel,
                backgroundColor: getElementColor(element.element_type),
                border: '1px solid #333',
                transform: `rotate(${element.rotation || 0}deg)`
              }}
            />
          ))}
          
          {/* Furniture Placements */}
          {furniturePlacements && furniturePlacements.length > 0 ? (
            furniturePlacements.map((furniture, idx) => (
              <div
                key={furniture.item_id || `furniture-${idx}`}
                className="absolute flex justify-center items-center"
                style={{
                  left: furniture.x * scale * zoomLevel,
                  top: furniture.y * scale * zoomLevel,
                  width: furniture.width * scale * zoomLevel,
                  height: furniture.height * scale * zoomLevel,
                  backgroundColor: getFurnitureColor(furniture),
                  border: '2px solid #333',
                  borderRadius: '2px',
                  transform: `rotate(${furniture.rotation || 0}deg)`,
                  fontSize: 10 * zoomLevel,
                  color: '#fff',
                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {furniture.name || getFurnitureNameById(furniture.base_id)}
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              No furniture placements available
            </div>
          )}
        </div>
      </div>
      
      {/* Layout Statistics */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Feng Shui Score:</span>
          <div className="bg-gray-200 h-4 w-40 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{
                width: `${layoutData.feng_shui_score}%`,
                backgroundColor: getScoreColor(layoutData.feng_shui_score)
              }}
            />
          </div>
          <span className="ml-2 font-bold">{layoutData.feng_shui_score}/100</span>
        </div>
        
        <div className="text-sm">
          <p><span className="font-medium">Items in command position:</span> {countItemsInCommandPosition(furniturePlacements)}</p>
          <p><span className="font-medium">Items against wall:</span> {countItemsAgainstWall(furniturePlacements)}</p>
        </div>
      </div>
      
      {/* Tradeoffs */}
      {layoutData.tradeoffs && layoutData.tradeoffs.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Feng Shui Tradeoffs:</h4>
          <ul className="text-sm list-disc pl-5">
            {layoutData.tradeoffs.map((tradeoff, index) => (
              <li key={index} className="mb-1">
                <span className="font-medium">{getFurnitureName(tradeoff.item_id, furniturePlacements)}:</span> {tradeoff.description}
                {tradeoff.mitigation && (
                  <span className="text-blue-600"> {tradeoff.mitigation}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getElementColor = (elementType) => {
  const colors = {
    'wall': 'rgba(128, 128, 128, 0.8)',
    'door': 'rgba(165, 42, 42, 0.7)',
    'window': 'rgba(135, 206, 235, 0.7)',
    'closet': 'rgba(160, 82, 45, 0.7)',
    'column': 'rgba(169, 169, 169, 0.8)',
    'fireplace': 'rgba(255, 140, 0, 0.7)',
    'radiator': 'rgba(255, 160, 122, 0.7)',
    'nofurniture': 'rgba(255, 0, 0, 0.3)'
  };
  
  return colors[elementType] || 'rgba(200, 200, 200, 0.5)';
};

const getFurnitureColor = (furniture) => {
  // Base colors by furniture type
  const baseColors = {
    'bed': 'rgba(70, 130, 180, 0.8)',      // Steel Blue
    'desk': 'rgba(60, 179, 113, 0.8)',     // Medium Sea Green
    'table': 'rgba(210, 105, 30, 0.8)',    // Chocolate
    'sofa': 'rgba(147, 112, 219, 0.8)',    // Medium Purple
    'chair': 'rgba(244, 164, 96, 0.8)',    // Sandy Brown
    'storage': 'rgba(85, 107, 47, 0.8)',   // Dark Olive Green
    'bookshelf': 'rgba(139, 69, 19, 0.8)', // Saddle Brown
  };
  
  // Get furniture type from ID
  const furnitureType = getFurnitureTypeFromId(furniture.base_id);
  
  // Color based on feng shui quality
  const qualityColors = {
    'excellent': 'rgba(46, 139, 87, 0.8)',   // Green
    'good': 'rgba(60, 179, 113, 0.8)',       // Medium Green
    'fair': 'rgba(255, 165, 0, 0.8)',        // Orange
    'poor': 'rgba(255, 99, 71, 0.8)'         // Red
  };
  
  // Return color based on quality, or base color if no quality specified
  return qualityColors[furniture.feng_shui_quality] || baseColors[furnitureType] || 'rgba(128, 128, 128, 0.8)';
};

const getFurnitureTypeFromId = (id) => {
  if (!id) return 'unknown';
  
  if (id.includes('bed')) return 'bed';
  if (id.includes('desk')) return 'desk';
  if (id.includes('table')) return 'table';
  if (id.includes('sofa')) return 'sofa';
  if (id.includes('chair')) return 'chair';
  if (id.includes('shelf') || id.includes('case')) return 'bookshelf';
  if (id.includes('dresser') || id.includes('cabinet') || id.includes('drawer')) return 'storage';
  
  return 'unknown';
};

const getFurnitureNameById = (id) => {
  if (!id) return 'Unknown Item';
  
  // Convert snake_case or camelCase to Title Case with spaces
  return id
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
};

const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';  // Green
  if (score >= 60) return '#8BC34A';  // Light Green
  if (score >= 40) return '#FFC107';  // Amber
  if (score >= 20) return '#FF9800';  // Orange
  return '#F44336';                   // Red
};

const countItemsInCommandPosition = (furniturePlacements) => {
  if (!furniturePlacements) return 0;
  return furniturePlacements.filter(item => item.in_command_position).length;
};

const countItemsAgainstWall = (furniturePlacements) => {
  if (!furniturePlacements) return 0;
  return furniturePlacements.filter(item => item.against_wall).length;
};

const getFurnitureName = (itemId, furniturePlacements) => {
  if (!furniturePlacements) return itemId;
  const furniture = furniturePlacements.find(item => item.item_id === itemId);
  return furniture ? furniture.name || getFurnitureNameById(furniture.base_id) : itemId;
};

export default LayoutViewer;