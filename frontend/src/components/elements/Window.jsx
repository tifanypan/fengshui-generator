import React, { useState } from 'react';

const Window = ({ 
  id, 
  x, 
  y, 
  width = 36, 
  height = 6, 
  rotation = 0, 
  isSelected = false, 
  onSelect, 
  onUpdate, 
  snapToGrid = true, 
  gridSize = 20 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width, x: 0 });
  
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      let newX = x + dx;
      let newY = y + dy;
      
      // Snap to grid if enabled
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      onUpdate({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const dx = e.clientX - resizeStart.x;
      
      let newWidth = resizeStart.width + dx;
      
      // Snap width to grid if enabled
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
      }
      
      // Minimum width
      newWidth = Math.max(24, newWidth);
      
      onUpdate({ width: newWidth });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  const startResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ width, x: e.clientX });
  };
  
  const rotate = (e) => {
    e.stopPropagation();
    onUpdate({ rotation: (rotation + 90) % 360 });
  };
  
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Window frame */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill="#e6f7ff"
        stroke={isSelected ? '#3b82f6' : '#000'}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Window panes */}
      <line
        x1={-width / 2}
        y1={0}
        x2={width / 2}
        y2={0}
        stroke="#999"
        strokeWidth={1}
      />
      
      {/* Controls when selected */}
      {isSelected && (
        <g>
          {/* Rotate control */}
          <circle
            cx={0}
            cy={-height / 2 - 20}
            r={10}
            fill="#3b82f6"
            onClick={rotate}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={0}
            y={-height / 2 - 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            style={{ pointerEvents: 'none' }}
          >
            ↻
          </text>
          
          {/* Resize handles */}
          <circle
            cx={width / 2 + 10}
            cy={0}
            r={8}
            fill="#3b82f6"
            onMouseDown={startResize}
            style={{ cursor: 'ew-resize' }}
          />
          <circle
            cx={-width / 2 - 10}
            cy={0}
            r={8}
            fill="#3b82f6"
            onMouseDown={startResize}
            style={{ cursor: 'ew-resize' }}
          />
        </g>
      )}
    </g>
  );
};

export default Window;