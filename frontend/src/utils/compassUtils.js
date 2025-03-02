/**
 * Calculate direction labels based on compass orientation
 * 
 * @param {string} orientation - Compass orientation ('N', 'E', 'S', 'W')
 * @returns {Object} Direction labels for top, right, bottom, and left
 */
export const getDirectionLabels = (orientation) => {
    const directions = {
      N: { top: 'N', right: 'E', bottom: 'S', left: 'W' },
      E: { top: 'E', right: 'S', bottom: 'W', left: 'N' },
      S: { top: 'S', right: 'W', bottom: 'N', left: 'E' },
      W: { top: 'W', right: 'N', bottom: 'E', left: 'S' }
    };
    
    return directions[orientation] || directions.N;
  };