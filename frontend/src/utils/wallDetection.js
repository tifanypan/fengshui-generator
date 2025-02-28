// src/utils/wallDetection.js
export const detectWalls = async (imageElement) => {
  return new Promise((resolve) => {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const width = imageElement.width;
    const height = imageElement.height;
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw image on canvas
    context.drawImage(imageElement, 0, 0, width, height);
    
    // Get image data
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Pre-process: convert to grayscale and enhance contrast
    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to grayscale
      const gray = Math.round(
        (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
      );
      grayscale[i / 4] = gray;
    }
    
    // Improved edge detection targeting dark lines (walls)
    const threshold = 60; // Increased threshold to detect fewer edges
    const edgePixels = [];
    
    // Detect horizontal edges (top-bottom walls)
    for (let y = 1; y < height - 1; y += 2) { // Sample every other pixel to reduce detail
      for (let x = 1; x < width - 1; x += 2) { // Sample every other pixel to reduce detail
        const pos = y * width + x;
        
        // Check vertical gradient (for horizontal lines)
        const topPixel = grayscale[pos - width];
        const bottomPixel = grayscale[pos + width];
        const verticalDiff = Math.abs(topPixel - bottomPixel);
        
        // Check horizontal gradient (for vertical lines)
        const leftPixel = grayscale[pos - 1];
        const rightPixel = grayscale[pos + 1];
        const horizontalDiff = Math.abs(leftPixel - rightPixel);
        
        // If this is a dark pixel with significant edge difference
        if (grayscale[pos] < 80 && (verticalDiff > threshold || horizontalDiff > threshold)) {
          edgePixels.push({ x, y });
        }
      }
    }
    
    // Group edge pixels into line segments
    const lineSegments = groupIntoLines(edgePixels, width, height);
    
    // Convert line segments to wall highlights
    const walls = convertToWalls(lineSegments, width, height);
    
    resolve(walls);
  });
};

// Helper function to group edge pixels into line segments
function groupIntoLines(edgePixels, width, height) {
  // Sort edge pixels by position to help with grouping
  edgePixels.sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });
  
  const horizontalLines = [];
  const verticalLines = [];
  
  // Look for horizontal lines (identify sequences of pixels with same y)
  let currentLine = null;
  let lastX = -2;
  let lastY = -1;
  
  for (const pixel of edgePixels) {
    // If we're on a new row or there's a gap in the x sequence
    if (pixel.y !== lastY || pixel.x > lastX + 5) { // Increased gap tolerance to join fewer lines
      if (currentLine && currentLine.length > 20) { // Increased minimum length for a line
        horizontalLines.push(currentLine);
      }
      currentLine = [pixel];
    } else if (pixel.x > lastX + 1) { // Allow for small gaps
      currentLine.push({ x: lastX + 1, y: pixel.y }); // Fill gap
      currentLine.push(pixel);
    } else {
      currentLine.push(pixel);
    }
    
    lastX = pixel.x;
    lastY = pixel.y;
  }
  
  if (currentLine && currentLine.length > 20) { // Increased minimum length for a line
    horizontalLines.push(currentLine);
  }
  
  // Look for vertical lines (identify sequences of pixels with same x)
  edgePixels.sort((a, b) => {
    if (a.x === b.x) return a.y - b.y;
    return a.x - b.x;
  });
  
  currentLine = null;
  let lastX2 = -1;
  let lastY2 = -2;
  
  for (const pixel of edgePixels) {
    // If we're on a new column or there's a gap in the y sequence
    if (pixel.x !== lastX2 || pixel.y > lastY2 + 5) { // Increased gap tolerance
      if (currentLine && currentLine.length > 20) { // Increased minimum length for a line
        verticalLines.push(currentLine);
      }
      currentLine = [pixel];
    } else if (pixel.y > lastY2 + 1) { // Allow for small gaps
      currentLine.push({ x: pixel.x, y: lastY2 + 1 }); // Fill gap
      currentLine.push(pixel);
    } else {
      currentLine.push(pixel);
    }
    
    lastX2 = pixel.x;
    lastY2 = pixel.y;
  }
  
  if (currentLine && currentLine.length > 20) { // Increased minimum length for a line
    verticalLines.push(currentLine);
  }
  
  return { horizontalLines, verticalLines };
}

// Convert line segments to wall highlight objects
function convertToWalls(lineSegments, width, height) {
  const walls = [];
  const { horizontalLines, verticalLines } = lineSegments;
  
  // Process horizontal lines
  for (const line of horizontalLines) {
    if (line.length < width * 0.08) continue; // Increased minimum length requirement
    
    const minX = Math.min(...line.map(p => p.x));
    const maxX = Math.max(...line.map(p => p.x));
    const avgY = Math.round(line.reduce((sum, p) => sum + p.y, 0) / line.length);
    
    walls.push({
      id: `wall-h-${walls.length}`,
      type: 'wall',
      left: minX,
      top: avgY - 3, // Adjust to center wall thickness
      width: maxX - minX,
      height: 6, // Wall thickness
    });
  }
  
  // Process vertical lines
  for (const line of verticalLines) {
    if (line.length < height * 0.08) continue; // Increased minimum length requirement
    
    const minY = Math.min(...line.map(p => p.y));
    const maxY = Math.max(...line.map(p => p.y));
    const avgX = Math.round(line.reduce((sum, p) => sum + p.x, 0) / line.length);
    
    walls.push({
      id: `wall-v-${walls.length}`,
      type: 'wall',
      left: avgX - 3, // Adjust to center wall thickness
      top: minY,
      width: 6, // Wall thickness
      height: maxY - minY,
    });
  }
  
  // Filter out duplicate or overlapping walls more aggressively
  return filterOverlappingWalls(walls);
}

// Remove walls that significantly overlap
function filterOverlappingWalls(walls) {
  const filteredWalls = [];
  
  for (const wall of walls) {
    let shouldAdd = true;
    
    // Check for major overlaps with existing walls
    for (const existingWall of filteredWalls) {
      const overlap = calculateOverlap(wall, existingWall);
      
      // If walls overlap by more than 50% (reduced from 70%)
      if (overlap > 0.5) {
        shouldAdd = false;
        break;
      }
    }
    
    if (shouldAdd) {
      filteredWalls.push(wall);
    }
  }
  
  // Limit the number of walls to prevent excessive detection
  return filteredWalls.slice(0, 30); // Only return up to 30 detected wall segments
}

// Calculate how much two walls overlap (0-1)
function calculateOverlap(wall1, wall2) {
  // Check if no overlap
  if (
    wall1.left + wall1.width < wall2.left ||
    wall2.left + wall2.width < wall1.left ||
    wall1.top + wall1.height < wall2.top ||
    wall2.top + wall2.height < wall1.top
  ) {
    return 0;
  }
  
  // Calculate overlap area
  const xOverlap = Math.min(wall1.left + wall1.width, wall2.left + wall2.width) - 
                  Math.max(wall1.left, wall2.left);
  
  const yOverlap = Math.min(wall1.top + wall1.height, wall2.top + wall2.height) - 
                  Math.max(wall1.top, wall2.top);
  
  const overlapArea = xOverlap * yOverlap;
  
  // Calculate area of the smaller wall
  const area1 = wall1.width * wall1.height;
  const area2 = wall2.width * wall2.height;
  const smallerArea = Math.min(area1, area2);
  
  return overlapArea / smallerArea;
}