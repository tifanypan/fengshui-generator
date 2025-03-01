import api from './index';

/**
 * Generate feng shui-optimized layouts for a floor plan
 * 
 * @param {number} floorPlanId - The ID of the floor plan
 * @param {object} furnitureSelections - Selected furniture items with quantities
 * @param {string} primaryLifeGoal - Optional life goal to prioritize (premium feature)
 * @returns {Promise} - API response with generated layouts
 */
export const generateLayouts = async (floorPlanId, furnitureSelections, primaryLifeGoal = null) => {
  const payload = { 
    ...furnitureSelections,
    primary_life_goal: primaryLifeGoal
  };
  
  return api.post(`/api/layouts/${floorPlanId}`, payload);
};

/**
 * Get feng shui recommendations for a floor plan without generating full layouts
 * 
 * @param {number} floorPlanId - The ID of the floor plan
 * @returns {Promise} - API response with feng shui recommendations
 */
export const getFengShuiRecommendations = async (floorPlanId) => {
  return api.get(`/api/layouts/${floorPlanId}/recommendations`);
};