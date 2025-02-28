import React, { useState } from 'react';

const Door = ({ 
  id, 
  x, 
  y, 
  width = 36, 
  height = 6, 
  rotation = 0, 
  isOpen = false, 
  isSelected = false, 
  onSelect, 
  onUpdate, 
  snapToGrid = true, 
  gridSize = 20 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
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
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const toggleOpen = (e) => {
    e.stopPropagation();
    onUpdate({ isOpen: !isOpen });
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
      {/* Door frame */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill="white"
        stroke={isSelected ? '#3b82f6' : '#000'}
        strokeWidth={isSelected ? 2 : 1}
      />
      
      {/* Door swing */}
      <path
        d={isOpen 
          ? `M ${-width / 2} ${-height / 2} A ${width} ${width} 0 0 1 ${-width / 2} ${-height / 2 - width}`
          : `M ${-width / 2} ${-height / 2} A ${width} ${width} 0 0 0 ${-width / 2} ${-height / 2 + width}`
        }
        fill="none"
        stroke="#999"
        strokeDasharray="5,5"
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
          
          {/* Toggle open/close control */}
          <circle
            cx={0}
            cy={height / 2 + 20}
            r={10}
            fill="#3b82f6"
            onClick={toggleOpen}
            style={{ cursor: 'pointer' }}
          />
          <text
            x={0}
            y={height / 2 + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            style={{ pointerEvents: 'none' }}
          >
            {isOpen ? '↺' : '↻'}
          </text>
        </g>
      )}
    </g>
  );
};

export default Door;