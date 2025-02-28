// src/components/editor/HighlightCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../state/store';

const HighlightCanvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const { 
    floorPlan,
    highlights,
    addHighlight,
    removeHighlight,
    selectHighlight,
    deselectHighlight,
    initHighlightHistory
  } = useStore();
  
  // Tool type colors - Changed wall color to be more visible
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
  
  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Ensure canvas dimensions match what we specify
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      setCtx(context);
      
      // Set white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      
      initHighlightHistory();
      
      // Log canvas dimensions to verify
      console.log("Canvas dimensions set to:", width, "x", height);
    }
  }, [width, height, initHighlightHistory]);
  
  // Load floor plan image with better fit approach
  useEffect(() => {
    if (ctx && floorPlan.fileUrl) {
      console.log("Loading image from URL:", floorPlan.fileUrl);
      setImageLoaded(false);
      
      const img = new Image();
      img.onload = () => {
        console.log("Image loaded successfully:", img.width, "x", img.height);
        setImageObj(img);
        
        // Clear the canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate scale to fit image while maintaining aspect ratio
        // IMPORTANT: Using a lower scale (65%) to ensure the entire image fits with padding
        const scale = Math.min(
          (width * 0.65) / img.width,
          (height * 0.65) / img.height
        );
        
        // Calculate dimensions, ensuring whole pixels
        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);
        
        // Center on canvas
        const x = Math.floor((width - scaledWidth) / 2);
        const y = Math.floor((height - scaledHeight) / 2);
        
        console.log("Positioning image at:", x, y, "with size:", scaledWidth, "x", scaledHeight);
        console.log("Using scale:", scale);
        
        setImgDimensions({ x, y, width: scaledWidth, height: scaledHeight });
        
        // Draw the image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Draw highlights over the image
        drawHighlights();
        
        setImageLoaded(true);
      };
      
      img.onerror = (error) => {
        console.error("Error loading image:", error);
        setImageLoaded(false);
      };
      
      img.src = floorPlan.fileUrl;
    }
  }, [ctx, floorPlan.fileUrl, width, height]);
  
  // Render highlights when they change
  useEffect(() => {
    if (ctx && imageLoaded) {
      drawHighlights();
    }
  }, [highlights.items, highlights.selected, imageLoaded]);
  
  // Updated drawHighlights function
  const drawHighlights = () => {
    if (!ctx || !imageObj) return;
    
    // First redraw the background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw the image
    const { x, y, width: imgWidth, height: imgHeight } = imgDimensions;
    ctx.drawImage(imageObj, x, y, imgWidth, imgHeight);
    
    // Draw direction labels if orientation is selected
    if (floorPlan.compass && floorPlan.compass.orientation) {
      drawDirectionLabels(x, y, imgWidth, imgHeight, floorPlan.compass.orientation);
    }
    
    // Draw all highlights with improved styling
    highlights.items.forEach(highlight => {
      ctx.fillStyle = highlightColors[highlight.type] || 'rgba(0, 0, 0, 0.3)';
      
      // Change the selected highlight style
      if (highlight.id === highlights.selected) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
      } else {
        // For walls, make the stroke more visible against black lines
        if (highlight.type === 'wall') {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
        } else {
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 1;
        }
      }
      
      ctx.beginPath();
      ctx.rect(highlight.left, highlight.top, highlight.width, highlight.height);
      ctx.fill();
      ctx.stroke();
    });
  };
  
  // Updated drawDirectionLabels function
  const drawDirectionLabels = (x, y, imgWidth, imgHeight, orientation) => {
    if (!ctx) return;
    
    // Adjusted padding for direction labels - smaller to fit better
    const paddingHorizontal = 30;
    const paddingVertical = 30;
    
    const roomWidth = floorPlan.dimensions.width; // Width in meters
    const roomLength = floorPlan.dimensions.length; // Length in meters
    
    // Convert to feet and inches for display
    const widthInFeet = Math.floor(roomWidth * 3.28084);
    const widthInches = Math.round((roomWidth * 3.28084 - widthInFeet) * 12);
    const lengthInFeet = Math.floor(roomLength * 3.28084);
    const lengthInches = Math.round((roomLength * 3.28084 - lengthInFeet) * 12);
    
    const widthText = `${widthInFeet}' ${widthInches}"`;
    const lengthText = `${lengthInFeet}' ${lengthInches}"`;
    
    // Calculate directions based on orientation
    let directions = {
      top: '', right: '', bottom: '', left: ''
    };
    
    if (orientation === 'N') {
      directions = { top: 'N', right: 'E', bottom: 'S', left: 'W' };
    } else if (orientation === 'E') {
      directions = { top: 'E', right: 'S', bottom: 'W', left: 'N' };
    } else if (orientation === 'S') {
      directions = { top: 'S', right: 'W', bottom: 'N', left: 'E' };
    } else if (orientation === 'W') {
      directions = { top: 'W', right: 'N', bottom: 'E', left: 'S' };
    }
    
    // Set font styles
    ctx.font = 'bold 14px Arial'; // Smaller font size
    ctx.textBaseline = 'middle';
    
    // Draw dimension labels closer to the image
    // Left side
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c'; // Direction color
    ctx.fillText(directions.left, x - paddingHorizontal, y + imgHeight/2 - 15);
    ctx.fillStyle = '#333333'; // Dimension color
    ctx.fillText(lengthText, x - paddingHorizontal, y + imgHeight/2 + 15);
    
    // Right side
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText(directions.right, x + imgWidth + paddingHorizontal, y + imgHeight/2 - 15);
    ctx.fillStyle = '#333333';
    ctx.fillText(lengthText, x + imgWidth + paddingHorizontal, y + imgHeight/2 + 15);
    
    // Top
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText(directions.top, x + imgWidth/2, y - paddingVertical + 15);
    ctx.fillStyle = '#333333';
    ctx.fillText(widthText, x + imgWidth/2, y - paddingVertical + 35);
    
    // Bottom
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText(directions.bottom, x + imgWidth/2, y + imgHeight + paddingVertical - 35);
    ctx.fillStyle = '#333333';
    ctx.fillText(widthText, x + imgWidth/2, y + imgHeight + paddingVertical - 15);
  };
  
  // Handle canvas mouse events with adjusted coordinates for centering
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Important: Calculate the correct mouse position based on the displayed canvas size
    // This ensures coordinates match regardless of container scaling
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicking on an existing highlight
    let clickedHighlight = null;
    // Check in reverse order to get the top-most highlight
    for (let i = highlights.items.length - 1; i >= 0; i--) {
      const highlight = highlights.items[i];
      if (
        x >= highlight.left && 
        x <= highlight.left + highlight.width &&
        y >= highlight.top && 
        y <= highlight.top + highlight.height
      ) {
        clickedHighlight = highlight;
        break;
      }
    }
    
    if (clickedHighlight) {
      // Select this highlight
      selectHighlight(clickedHighlight.id);
    } else {
      // Start drawing a new highlight
      setIsDrawing(true);
      setStartPoint({ x, y });
      deselectHighlight();
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Use the same scaling factor for consistent coordinates
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Redraw the scene with temporary rectangle
    if (ctx && imageObj) {
      // First redraw everything
      drawHighlights();
      
      // Then draw temporary rectangle
      const left = Math.min(startPoint.x, x);
      const top = Math.min(startPoint.y, y);
      const width = Math.abs(startPoint.x - x);
      const height = Math.abs(startPoint.y - y);
      
      ctx.fillStyle = highlightColors[highlights.activeType];
      ctx.strokeStyle = highlights.activeType === 'wall' ? 'white' : 'black';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.rect(left, top, width, height);
      ctx.fill();
      ctx.stroke();
    }
  };
  
  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Use the same scaling factor for consistent coordinates
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Only create a highlight if it has a meaningful size
    if (Math.abs(startPoint.x - x) > 5 && Math.abs(startPoint.y - y) > 5) {
      // Calculate dimensions
      const left = Math.min(startPoint.x, x);
      const top = Math.min(startPoint.y, y);
      const width = Math.abs(startPoint.x - x);
      const height = Math.abs(startPoint.y - y);
      
      // Create a new highlight
      const newHighlight = {
        id: uuidv4(),
        type: highlights.activeType,
        left,
        top,
        width,
        height,
        angle: 0,
      };
      
      addHighlight(newHighlight);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };
  
  return (
    <div ref={containerRef} className="relative w-full h-full border border-gray-300 bg-white">
      {!imageLoaded && floorPlan.fileUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
          <p className="text-gray-700">Loading floor plan image...</p>
        </div>
      )}
      
      {!floorPlan.fileUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">No floor plan image uploaded. Please return to Step 1 to upload an image.</p>
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default HighlightCanvas;