import React, { useState, useEffect, useRef } from 'react';
import useStore from '../../state/store';
import Button from '../shared/Button';
import FurnitureDisplay from './FurnitureDisplay';
import LayoutStatistics from './LayoutStatistics';
import SelectedItemDetails from './SelectedItemDetails';
import FengShuiConsiderations from './FengShuiConsiderations';
import { transformWithCalibration } from '../../utils/coordinateTransforms';
import { getDirectionLabels } from '../../utils/compassUtils';

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
      const { naturalWidth, naturalHeight } = imageRef.current;
      const containerWidth = containerRef.current?.clientWidth || 800;
      const containerHeight = containerRef.current?.clientHeight || 600;
  
      // Scale while maintaining aspect ratio
      const scale = Math.min(
        containerWidth / naturalWidth,
        containerHeight / naturalHeight
      );
  
      setImageSize({
        width: naturalWidth * scale,
        height: naturalHeight * scale,
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
  
  const directionLabels = getDirectionLabels(floorPlan.compass?.orientation || 'N');
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
 // In LayoutViewer.jsx - Restructure the container completely

// Modify this entire section to ensure proper stacking
<div className="flex justify-center mb-4">
  <div className="relative" style={{ maxWidth: '100%', maxHeight: '70vh' }}>
    {/* Zoom container */}
    <div 
      ref={containerRef}
      className="relative"
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left'
      }}
    >
      {/* Base container with explicit stacking context */}
      <div className="relative" style={{ isolation: 'isolate' }}>
        {floorPlan.fileUrl ? (
          <img
            ref={imageRef}
            src={floorPlan.fileUrl}
            alt="Floor Plan"
            className="max-w-full"
            style={{
              width: imageSize.width > 0 ? `${imageSize.width}px` : 'auto',
              height: imageSize.height > 0 ? `${imageSize.height}px` : 'auto',
              display: imageLoaded ? 'block' : 'none',
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
              position: 'relative',
              zIndex: 1
            }}
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
        
        {/* Display furniture and overlays when image is loaded */}
        {imageLoaded && (
          <div className="absolute top-0 left-0" style={{ width: '100%', height: '100%', zIndex: 2 }}>
            <FurnitureDisplay
              floorPlan={floorPlan}
              imageSize={imageSize}
              isCalibrated={isCalibrated}
              showBagua={showBagua}
              showEnergy={showEnergy}
              showDimensions={showDimensions}
              furniturePlacements={furniturePlacements}
              bagua={bagua}
              energyFlows={energyFlows}
              layoutData={layoutData}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              roomWidth={roomWidth}
              roomLength={roomLength}
              directionLabels={directionLabels}
              transformWithCalibration={(x, y, width, height) => 
                transformWithCalibration(
                  x, y, width, height, 
                  isCalibrated, 
                  floorPlan.calibration, 
                  roomWidth, 
                  roomLength, 
                  imageSize, 
                  bilinearInterpolate
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  </div>
</div>
      
      {/* Layout Statistics & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Selected item details */}
        <SelectedItemDetails
          selectedItem={selectedItem}
          selectedItemTradeoffs={selectedItemTradeoffs}
          setSelectedItem={setSelectedItem}
        />
        
        {/* Center: Layout statistics */}
        <LayoutStatistics
          layoutData={layoutData}
          furniturePlacements={furniturePlacements}
          layouts={layouts}
          activeLayout={activeLayout}
        />
        
        {/* Right: Tradeoffs/Warnings */}
        <FengShuiConsiderations
          layoutData={layoutData}
          furniturePlacements={furniturePlacements}
        />
      </div>
    </div>
  );
};

export default LayoutViewer;