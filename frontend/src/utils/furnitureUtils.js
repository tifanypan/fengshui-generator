/**
 * Get color based on feng shui quality
 * 
 * @param {string} quality - The feng shui quality ('excellent', 'good', 'fair', 'poor')
 * @returns {string} CSS class for the appropriate text color
 */
export const getFengShuiQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-emerald-600';
      case 'fair': return 'text-amber-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  /**
   * Get background color based on issue severity
   * 
   * @param {string} severity - The severity level ('high', 'medium', 'low')
   * @returns {string} CSS class for the appropriate background color
   */
  export const getSeverityBackground = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50';
      case 'medium': return 'bg-amber-50';
      case 'low': return 'bg-blue-50';
      default: return 'bg-gray-50';
    }
  };
  
  /**
   * Determine furniture color based on various factors
   * 
   * @param {Object} furniture - The furniture item data
   * @returns {string} CSS color string with RGBA values
   */
  export const getFurnitureColor = (furniture) => {
    // Base color from furniture type
    const baseColor = getFurnitureBaseColor(furniture.base_id);
    
    // Apply quality tint with semi-transparency for overlay
    if (furniture.feng_shui_quality) {
      const qualityColors = {
        'excellent': 'rgba(46, 139, 87, 0.65)',   // Green
        'good': 'rgba(60, 179, 113, 0.65)',       // Medium Green
        'fair': 'rgba(255, 165, 0, 0.65)',        // Orange
        'poor': 'rgba(255, 99, 71, 0.65)'         // Red
      };
      
      // Use quality color
      return qualityColors[furniture.feng_shui_quality] || baseColor;
    }
    
    return baseColor;
  };
  
  /**
   * Get base color for furniture type
   * 
   * @param {string} id - The base ID of the furniture
   * @returns {string} CSS color string with RGBA values
   */
  export const getFurnitureBaseColor = (id) => {
    if (!id) return 'rgba(128, 128, 128, 0.65)';
    
    // Color by furniture type with higher transparency for overlay
    if (id.includes('bed')) return 'rgba(70, 130, 180, 0.65)';      // Steel Blue for beds
    if (id.includes('desk')) return 'rgba(60, 179, 113, 0.65)';     // Medium Sea Green for desks
    if (id.includes('table')) return 'rgba(210, 105, 30, 0.65)';    // Chocolate for tables
    if (id.includes('sofa')) return 'rgba(147, 112, 219, 0.65)';    // Medium Purple for sofas
    if (id.includes('chair')) return 'rgba(244, 164, 96, 0.65)';    // Sandy Brown for chairs
    if (id.includes('shelf') || id.includes('case')) return 'rgba(139, 69, 19, 0.65)'; // Saddle Brown for shelves
    if (id.includes('dresser') || id.includes('cabinet')) return 'rgba(85, 107, 47, 0.65)'; // Dark Olive Green for storage
    if (id.includes('plant')) return 'rgba(34, 139, 34, 0.65)';     // Forest Green for plants
    if (id.includes('lamp')) return 'rgba(218, 165, 32, 0.65)';     // Goldenrod for lamps
    if (id.includes('mirror')) return 'rgba(70, 130, 180, 0.65)';   // Light blue for mirrors
    return 'rgba(128, 128, 128, 0.65)'; // Default gray
  };
  
  /**
   * Format a furniture ID into a readable name
   * 
   * @param {string} id - The furniture ID
   * @returns {string} Human-readable name
   */
  export const getFurnitureNameById = (id) => {
    if (!id) return 'Unknown Item';
    
    // Convert snake_case or camelCase to Title Case with spaces
    return id
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  };
  
  /**
   * Get color based on feng shui score
   * 
   * @param {number} score - The feng shui score (0-100)
   * @returns {string} CSS color hex code
   */
  export const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';  // Green
    if (score >= 60) return '#8BC34A';  // Light Green
    if (score >= 40) return '#FFC107';  // Amber
    if (score >= 20) return '#FF9800';  // Orange
    return '#F44336';                   // Red
  };
  
  /**
   * Count items in command position
   * 
   * @param {Array} furniturePlacements - Array of furniture items
   * @returns {number} Count of items in command position
   */
  export const countItemsInCommandPosition = (furniturePlacements) => {
    if (!furniturePlacements) return 0;
    return furniturePlacements.filter(item => item.in_command_position).length;
  };
  
  /**
   * Count items against wall
   * 
   * @param {Array} furniturePlacements - Array of furniture items
   * @returns {number} Count of items against wall
   */
  export const countItemsAgainstWall = (furniturePlacements) => {
    if (!furniturePlacements) return 0;
    return furniturePlacements.filter(item => item.against_wall).length;
  };
  
  /**
   * Get furniture name from item ID
   * 
   * @param {string} itemId - The ID of the furniture item
   * @param {Array} furniturePlacements - Array of furniture items
   * @returns {string} The name of the furniture item
   */
  export const getFurnitureName = (itemId, furniturePlacements) => {
    if (!furniturePlacements) return itemId;
    const furniture = furniturePlacements.find(item => item.item_id === itemId);
    return furniture ? furniture.name || getFurnitureNameById(furniture.base_id) : itemId;
  };