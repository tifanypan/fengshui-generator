import React, { useState } from 'react';

const FixedElement = ({ 
  id, 
  x, 
  y, 
  width = 36, 
  height = 36, 
  rotation = 0, 
  type = 'closet', 
  isSelected = false, 
  onSelect, 
  onUpdate, 
  snapToGrid = true, 
  gridSize = 20 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ width, height, x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  
  const typeColors = {
    closet: '#d1d5db',
    column: '#9ca3af',
    fireplace: '#fca5a5',
    radiator: '#fca5a5'
  };
  
  const typeLabels = {
    closet: 'Closet',
    column: 'Column',
    fireplace: 'Fireplace',
    radiator: 'Radiator'
  };
  
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
      const dy = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeHandle === 'e' || resizeHandle === 'ne' || resizeHandle === 'se') {
        newWidth = resizeStart.width + dx;
      }
      if (resizeHandle === 'w' || resizeHandle === 'nw' || resizeHandle === 'sw') {
        newWidth = resizeStart.width - dx;
      }
      if (resizeHandle === 'n' || resizeHandle === 'ne' || resizeHandle === 'nw') {
        newHeight = resizeStart.height - dy;
      }
      if (resizeHandle === 's' || resizeHandle === 'se' || resizeHandle === 'sw') {
        newHeight = resizeStart.height + dy;
      }
      
      // Snap sizes to grid if enabled
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
      }
      
      // Minimum size
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);
      
      onUpdate({ width: newWidth, height: newHeight });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };
  
  const startResize = (handle) => (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ width, height, x: e.clientX, y: e.clientY });
    setResizeHandle(handle);
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
      {/* Fixed element shape */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={typeColors[type] || '#d1d5db'}
        stroke={isSelected ? '#3b82f6' : '#000'}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Label */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="#000"
      >
        {typeLabels[type] || 'Element'}
      </text>
      
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
  cx={-width / 2}
  cy={0}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('w')}
  style={{ cursor: 'ew-resize' }}
/>
<circle
  cx={0}
  cy={height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('s')}
  style={{ cursor: 'ns-resize' }}
/>
<circle
  cx={0}
  cy={-height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('n')}
  style={{ cursor: 'ns-resize' }}
/>
<circle
  cx={width / 2}
  cy={height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('se')}
  style={{ cursor: 'nwse-resize' }}
/>
<circle
  cx={-width / 2}
  cy={height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('sw')}
  style={{ cursor: 'nesw-resize' }}
/>
<circle
  cx={width / 2}
  cy={-height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('ne')}
  style={{ cursor: 'nesw-resize' }}
/>
<circle
  cx={-width / 2}
  cy={-height / 2}
  r={6}
  fill="#3b82f6"
  onMouseDown={startResize('nw')}
  style={{ cursor: 'nwse-resize' }}
/>
        </g>
      )}
    </g>
  );
};

export default FixedElement;