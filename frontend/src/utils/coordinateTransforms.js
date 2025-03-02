/**
 * Perform bilinear interpolation between four points
 * 
 * @param {number} q00 - Value at (0,0)
 * @param {number} q10 - Value at (1,0)
 * @param {number} q01 - Value at (0,1)
 * @param {number} q11 - Value at (1,1)
 * @param {number} x - X coordinate (0-1)
 * @param {number} y - Y coordinate (0-1)
 * @returns {number} Interpolated value
 */
export const bilinearInterpolate = (q00, q10, q01, q11, x, y) => {
  // Ensure x and y are bounded between 0 and 1
  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));
  
  // Interpolate
  const r1 = (1 - x) * q00 + x * q10;
  const r2 = (1 - x) * q01 + x * q11;
  return (1 - y) * r1 + y * r2;
};

/**
 * Transform room coordinates to image coordinates using calibration points
 * 
 * @param {number} x - X coordinate in room space
 * @param {number} y - Y coordinate in room space
 * @param {number} width - Width in room space
 * @param {number} height - Height in room space
 * @param {boolean} isCalibrated - Whether calibration points are available
 * @param {Object} calibration - Calibration data with points
 * @param {number} roomWidth - Room width in real measurements
 * @param {number} roomLength - Room length in real measurements
 * @param {Object} imageSize - Image dimensions including width and height
 * @returns {Object} Transformed coordinates with x, y, width, and height
 */
export const transformWithCalibration = (
  x, y, width, height, 
  isCalibrated, 
  calibration, 
  roomWidth, 
  roomLength, 
  imageSize
) => {
  // If not calibrated, use simple scaling (centered on image)
  if (!isCalibrated || !calibration) {
    const scaleX = imageSize.width / roomWidth;
    const scaleY = imageSize.height / roomLength;
    
    return {
      x: x * scaleX,
      y: y * scaleY,
      width: width * scaleX,
      height: height * scaleY
    };
  }
  
  // With calibration, use the calibration points to create a transformation
  const points = calibration.points;
  
  // Calculate room coordinates as percentages of room dimensions
  const roomX = x / roomWidth;
  const roomY = y / roomLength;
  const roomW = width / roomWidth;
  const roomH = height / roomLength;
  
  // Use bilinear interpolation to map room coordinates to image coordinates
  // For the top-left corner of the furniture
  const topLeftX = bilinearInterpolate(
    points[0].x, points[1].x, points[3].x, points[2].x,
    roomX, roomY
  );
  
  const topLeftY = bilinearInterpolate(
    points[0].y, points[1].y, points[3].y, points[2].y,
    roomX, roomY
  );
  
  // For the bottom-right corner of the furniture
  const bottomRightX = bilinearInterpolate(
    points[0].x, points[1].x, points[3].x, points[2].x,
    roomX + roomW, roomY + roomH
  );
  
  const bottomRightY = bilinearInterpolate(
    points[0].y, points[1].y, points[3].y, points[2].y,
    roomX + roomW, roomY + roomH
  );
  
  // Calculate width and height in image coordinates
  const imageWidth = bottomRightX - topLeftX;
  const imageHeight = bottomRightY - topLeftY;
  
  return {
    x: topLeftX,
    y: topLeftY,
    width: imageWidth,
    height: imageHeight
  };
};
