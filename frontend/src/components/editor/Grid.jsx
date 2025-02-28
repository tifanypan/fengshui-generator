import React, { useEffect, useRef, useState } from 'react';
import useStore from '../../state/store';

const Grid = ({ width, height, cellSize = 20, children }) => {
  const gridRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Calculate grid lines
  const horizontalLines = [];
  const verticalLines = [];
  
  const gridWidth = width;
  const gridHeight = height;
  
  // Create horizontal grid lines
  for (let i = 0; i <= gridHeight; i += cellSize) {
    horizontalLines.push(
      <line
        key={`h-${i}`}
        x1={0}
        y1={i}
        x2={gridWidth}
        y2={i}
        stroke="#ccc"
        strokeWidth="1"
      />
    );
  }
  
  // Create vertical grid lines
  for (let i = 0; i <= gridWidth; i += cellSize) {
    verticalLines.push(
      <line
        key={`v-${i}`}
        x1={i}
        y1={0}
        x2={i}
        y2={gridHeight}
        stroke="#ccc"
        strokeWidth="1"
      />
    );
  }
  
  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPan({ 
        x: pan.x + dx, 
        y: pan.y + dy 
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
    
    setZoom(newZoom);
  };
  
  // Add event listeners
  useEffect(() => {
    const grid = gridRef.current;
    
    grid.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      grid.removeEventListener('wheel', handleWheel);
    };
  }, [zoom]);
  
  return (
    <div 
      ref={gridRef}
      className="border border-gray-300 bg-white relative overflow-hidden"
      style={{ width: '100%', height: '600px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <g>
          {horizontalLines}
          {verticalLines}
        </g>
        
        {children}
      </svg>
      
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow flex space-x-2">
        <button 
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => setZoom(zoom * 1.2)}
        >
          +
        </button>
        <button 
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => setZoom(Math.max(0.1, zoom / 1.2))}
        >
          -
        </button>
        <button 
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
          }}
        >
          ↺
        </button>
      </div>
    </div>
  );
};

export default Grid;