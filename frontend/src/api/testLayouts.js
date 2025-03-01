import api from './index';

// Get test API key from environment variable or use default for development
const TEST_API_KEY = process.env.REACT_APP_TEST_API_KEY || 'dev_test_key_2025';

/**
 * Generate test layouts without requiring payment
 * 
 * @param {number} floorPlanId - The ID of the floor plan
 * @param {object} furnitureSelections - Selected furniture items with quantities
 * @param {string} primaryLifeGoal - Optional life goal to prioritize
 * @returns {Promise} - API response with generated layouts
 */
export const generateTestLayouts = async (floorPlanId, furnitureSelections, primaryLifeGoal = null) => {
  const queryParams = primaryLifeGoal ? `?primary_life_goal=${primaryLifeGoal}` : '';
  
  return api.post(`/api/test/layouts/${floorPlanId}${queryParams}`, furnitureSelections, {
    headers: {
      'X-API-Key': TEST_API_KEY
    }
  });
};

/**
 * Get preset test scenarios for the feng shui engine
 * 
 * @returns {Promise} - API response with test scenarios
 */
export const getTestScenarios = async () => {
  return api.get('/api/test/layouts/preset-scenarios', {
    headers: {
      'X-API-Key': TEST_API_KEY
    }
  });
};