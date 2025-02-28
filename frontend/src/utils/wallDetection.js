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
      
      // Find edges using a simple edge detection algorithm
      // We'll look for significant brightness transitions
      const edges = new Uint8Array(width * height);
      const threshold = 30; // Threshold for edge detection
      
      // Convert to grayscale and detect edges
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const pos = (y * width + x) * 4;
          
          // Convert RGB to grayscale
          const gray = Math.round(
            (data[pos] * 0.299 + data[pos + 1] * 0.587 + data[pos + 2] * 0.114)
          );
          
          // Check pixels around current pixel for edges
          const posTop = ((y - 1) * width + x) * 4;
          const posBottom = ((y + 1) * width + x) * 4;
          const posLeft = (y * width + (x - 1)) * 4;
          const posRight = (y * width + (x + 1)) * 4;
          
          const grayTop = Math.round(
            (data[posTop] * 0.299 + data[posTop + 1] * 0.587 + data[posTop + 2] * 0.114)
          );
          const grayBottom = Math.round(
            (data[posBottom] * 0.299 + data[posBottom + 1] * 0.587 + data[posBottom + 2] * 0.114)
          );
          const grayLeft = Math.round(
            (data[posLeft] * 0.299 + data[posLeft + 1] * 0.587 + data[posLeft + 2] * 0.114)
          );
          const grayRight = Math.round(
            (data[posRight] * 0.299 + data[posRight + 1] * 0.587 + data[posRight + 2] * 0.114)
          );
          
          // Calculate differences
          const diffX = Math.abs(grayRight - grayLeft);
          const diffY = Math.abs(grayBottom - grayTop);
          
          // If the difference is greater than the threshold, it's an edge
          edges[y * width + x] = (diffX > threshold || diffY > threshold) ? 255 : 0;
        }
      }
      
      // Group edges into potential walls using a simple segmentation approach
      const visited = new Uint8Array(width * height);
      const potential_walls = [];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          
          // If it's an edge and hasn't been visited
          if (edges[index] === 255 && visited[index] === 0) {
            // Start a new potential wall
            const wall = {
              left: x,
              top: y,
              right: x,
              bottom: y,
              points: []
            };
            
            // Simple flood fill to find connected edge pixels
            const stack = [{x, y}];
            visited[index] = 1;
            
            while (stack.length > 0) {
              const point = stack.pop();
              wall.points.push(point);
              
              // Update bounding box
              wall.left = Math.min(wall.left, point.x);
              wall.top = Math.min(wall.top, point.y);
              wall.right = Math.max(wall.right, point.x);
              wall.bottom = Math.max(wall.bottom, point.y);
              
              // Check adjacent pixels
              const neighbors = [
                {x: point.x + 1, y: point.y},
                {x: point.x - 1, y: point.y},
                {x: point.x, y: point.y + 1},
                {x: point.x, y: point.y - 1}
              ];
              
              for (const neighbor of neighbors) {
                if (
                  neighbor.x >= 0 && neighbor.x < width &&
                  neighbor.y >= 0 && neighbor.y < height
                ) {
                  const neighborIndex = neighbor.y * width + neighbor.x;
                  if (edges[neighborIndex] === 255 && visited[neighborIndex] === 0) {
                    stack.push(neighbor);
                    visited[neighborIndex] = 1;
                  }
                }
              }
            }
            
            // Only consider it a wall if it has enough points and a reasonable aspect ratio
            if (wall.points.length > 50) {
              const width = wall.right - wall.left + 1;
              const height = wall.bottom - wall.top + 1;
              
              // Determine if it's more likely a horizontal or vertical wall
              const isHorizontal = width > height;
              
              // Adjust dimensions based on orientation
              if (isHorizontal) {
                // For horizontal walls, we extend their width a bit and make them thinner
                potential_walls.push({
                  left: Math.max(0, wall.left - 10),
                  top: wall.top,
                  width: width + 20,
                  height: Math.max(10, height),
                  type: 'wall',
                  id: `wall-h-${potential_walls.length}`,
                });
              } else {
                // For vertical walls, we extend their height a bit and make them thinner
                potential_walls.push({
                  left: wall.left,
                  top: Math.max(0, wall.top - 10),
                  width: Math.max(10, width),
                  height: height + 20,
                  type: 'wall',
                  id: `wall-v-${potential_walls.length}`,
                });
              }
            }
          }
        }
      }
      
      // Merge overlapping or nearby walls of the same orientation
      const walls = [];
      const mergedIndices = new Set();
      
      for (let i = 0; i < potential_walls.length; i++) {
        if (mergedIndices.has(i)) continue;
        
        const wall1 = potential_walls[i];
        let merged = false;
        
        // Check if this wall is horizontal or vertical
        const isHorizontal1 = wall1.width > wall1.height;
        
        for (let j = i + 1; j < potential_walls.length; j++) {
          if (mergedIndices.has(j)) continue;
          
          const wall2 = potential_walls[j];
          
          // Check if wall2 has the same orientation
          const isHorizontal2 = wall2.width > wall2.height;
          
          if (isHorizontal1 === isHorizontal2) {
            // Check if walls are close or overlapping
            if (isHorizontal1) {
              // For horizontal walls, check if they're at similar heights
              const heightDiff = Math.abs((wall1.top + wall1.height/2) - (wall2.top + wall2.height/2));
              const overlapsX = (
                wall1.left <= wall2.left + wall2.width &&
                wall2.left <= wall1.left + wall1.width
              );
              
              if (heightDiff < 20 && overlapsX) {
                // Merge horizontal walls
                wall1.left = Math.min(wall1.left, wall2.left);
                wall1.width = Math.max(wall1.left + wall1.width, wall2.left + wall2.width) - wall1.left;
                wall1.top = Math.min(wall1.top, wall2.top);
                wall1.height = Math.max(wall1.top + wall1.height, wall2.top + wall2.height) - wall1.top;
                
                mergedIndices.add(j);
                merged = true;
              }
            } else {
              // For vertical walls, check if they're at similar x-positions
              const widthDiff = Math.abs((wall1.left + wall1.width/2) - (wall2.left + wall2.width/2));
              const overlapsY = (
                wall1.top <= wall2.top + wall2.height &&
                wall2.top <= wall1.top + wall1.height
              );
              
              if (widthDiff < 20 && overlapsY) {
                // Merge vertical walls
                wall1.top = Math.min(wall1.top, wall2.top);
                wall1.height = Math.max(wall1.top + wall1.height, wall2.top + wall2.height) - wall1.top;
                wall1.left = Math.min(wall1.left, wall2.left);
                wall1.width = Math.max(wall1.left + wall1.width, wall2.left + wall2.width) - wall1.left;
                
                mergedIndices.add(j);
                merged = true;
              }
            }
          }
        }
        
        if (merged) {
          // If this wall was merged with others, update its ID
          wall1.id = `wall-merged-${walls.length}`;
        }
        
        walls.push(wall1);
      }
      
      resolve(walls);
    });
  };