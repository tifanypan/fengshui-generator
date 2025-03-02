// src/components/steps/RoomFeatures/index.jsx
import React, { useState } from 'react';
import HighlightCanvas from '../../editor/HighlightCanvas';
import HighlightToolbar from '../../editor/HighlightToolbar';
import CompassSelector from './CompassSelector';
import RoomDimensions from './RoomDimensions';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import { detectWalls } from '../../../utils/wallDetection';

const RoomFeatures = ({ onNext, onBack }) => {
  const { 
    floorPlan, 
    highlights,
    removeHighlight,
    addHighlight,
    initHighlightHistory
  } = useStore();
  
  const [isDetectingWalls, setIsDetectingWalls] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState(null);
  
  // Initialize when component mounts
  React.useEffect(() => {
    initHighlightHistory();
  }, [initHighlightHistory]);
  
  // Improved wall detection function
  const handleAutoDetectWalls = async () => {
    if (!floorPlan.fileUrl) return;
    
    setIsDetectingWalls(true);
    setDetectionStatus('Detecting walls...');
    
    try {
      // Load image first
      const img = new Image();
      img.onload = async () => {
        try {
          const detectedWalls = await detectWalls(img);
          
          if (detectedWalls.length === 0) {
            setDetectionStatus('No walls detected. Please highlight walls manually.');
            setIsDetectingWalls(false);
            return;
          }
          
          // Clear existing walls
          highlights.items
            .filter(item => item.type === 'wall')
            .forEach(wall => removeHighlight(wall.id));
          
          // Add detected walls
          detectedWalls.forEach(wall => {
            addHighlight(wall);
          });
          
          setDetectionStatus(
            `Successfully detected ${detectedWalls.length} major wall sections.`
          );
        } catch (error) {
          console.error('Wall detection error:', error);
          setDetectionStatus('Wall detection failed. Please highlight walls manually.');
        } finally {
          setIsDetectingWalls(false);
        }
      };
      
      img.onerror = () => {
        setDetectionStatus('Failed to load image for wall detection.');
        setIsDetectingWalls(false);
      };
      
      img.src = floorPlan.fileUrl;
      
    } catch (error) {
      setDetectionStatus('Wall detection failed. Please highlight walls manually.');
      setIsDetectingWalls(false);
    }
  };
  
  // Check if we have at least some wall highlights and dimensions
  const hasWalls = highlights.items.some(item => item.type === 'wall');
  const hasDimensions = floorPlan.dimensions && 
                       floorPlan.dimensions.length > 0 && 
                       floorPlan.dimensions.width > 0;
  
  // Selected highlight for info panel
  const selectedHighlight = highlights.selected 
    ? highlights.items.find(item => item.id === highlights.selected) 
    : null;
  
  // Define canvas dimensions - making sure they're consistent
  const canvasWidth = floorPlan.dimensions?.width || 800;
  const canvasHeight = floorPlan.dimensions?.height || 600;
  
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 2: Markup Key Room Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <RoomDimensions />
        </div>
        <div>
          <CompassSelector />
          <HighlightToolbar />
        </div>
      </div>
      
      {!hasWalls && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md mb-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Wall Detection</h3>
          <p className="mb-3">
            We don't see any walls highlighted yet. You can either auto-detect walls or highlight them manually.
          </p>
          <button 
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 mr-3"
            onClick={handleAutoDetectWalls}
            disabled={isDetectingWalls}
          >
            {isDetectingWalls ? 'Detecting...' : 'Auto-Detect Walls'}
          </button>
          <span className="text-sm text-yellow-700">
            {detectionStatus}
          </span>
        </div>
      )}
      
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        {/* Selected Highlight Info */}
        {selectedHighlight && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                Selected: {selectedHighlight.type.charAt(0).toUpperCase() + selectedHighlight.type.slice(1)}
              </h3>
              <button 
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                onClick={() => removeHighlight(selectedHighlight.id)}
              >
                Delete
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500">Position X</label>
                <span className="font-medium">{Math.round(selectedHighlight.left)}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Position Y</label>
                <span className="font-medium">{Math.round(selectedHighlight.top)}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Width</label>
                <span className="font-medium">{Math.round(selectedHighlight.width)}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Height</label>
                <span className="font-medium">{Math.round(selectedHighlight.height)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Container - Fixed size to match canvas dimensions */}
        <div 
          className="flex justify-center items-center mb-4" 
          style={{ 
            width: '100%',
            // height: canvasHeight,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa'
          }}
        >
          {/* <HighlightCanvas width={canvasWidth} height={canvasHeight} /> */}
          <HighlightCanvas width={canvasWidth} height={canvasHeight} />

        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Step 1
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!hasWalls || !hasDimensions}
        >
          Continue to Step 3
        </Button>
      </div>
      
      {(!hasWalls || !hasDimensions) && (
        <p className="text-sm text-red-600 mt-2 text-right">
          {!hasWalls && !hasDimensions ? 
            "Please highlight room walls and enter dimensions before continuing." :
            !hasWalls ? 
              "Please highlight at least the walls of your room before continuing." :
              "Please enter your room dimensions before continuing."
          }
        </p>
      )}
    </div>
  );
};

export default RoomFeatures;