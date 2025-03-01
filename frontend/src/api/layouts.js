// import api from './index';

// /**
//  * Generate feng shui-optimized layouts for a floor plan
//  * 
//  * @param {number} floorPlanId - The ID of the floor plan
//  * @param {object} furnitureSelections - Selected furniture items with quantities
//  * @param {string} primaryLifeGoal - Optional life goal to prioritize (premium feature)
//  * @returns {Promise} - API response with generated layouts
//  */
// export const generateLayouts = async (floorPlanId, furnitureSelections, primaryLifeGoal = null) => {
//   const payload = { 
//     ...furnitureSelections,
//     primary_life_goal: primaryLifeGoal
//   };
  
//   return api.post(`/api/layouts/${floorPlanId}`, payload);
// };

// /**
//  * Get feng shui recommendations for a floor plan without generating full layouts
//  * 
//  * @param {number} floorPlanId - The ID of the floor plan
//  * @returns {Promise} - API response with feng shui recommendations
//  */
// export const getFengShuiRecommendations = async (floorPlanId) => {
//   return api.get(`/api/layouts/${floorPlanId}/recommendations`);
// };

// src/api/layouts.js - Updated with logging
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
  
  // Log the payload to see what's being sent
  console.log('Layout payload being sent to API:', JSON.stringify(payload, null, 2));
  
try {
  const response = await api.post(`/api/layouts/${floorPlanId}`, payload);
  return response;
} catch (error) {
  console.error('API Error Response Details:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message
  });
  
    
    // Mock data fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock layout data as fallback');
      return {
        data: {
          layouts: mockLayoutData(floorPlanId, furnitureSelections, primaryLifeGoal)
        }
      };
    }
    throw error;
  }
};

// Mock data function for fallback
const mockLayoutData = (floorPlanId, furnitureSelections, primaryLifeGoal) => {
  // Create basic layout with furniture items from the selections
  const furniturePlacements = [];
  let index = 0;
  
  // Extract furniture items from selections
  Object.entries(furnitureSelections.items || {}).forEach(([itemId, item]) => {
    if (item.quantity > 0) {
      for (let i = 0; i < item.quantity; i++) {
        furniturePlacements.push({
          item_id: `${itemId}_${i}`,
          base_id: itemId,
          name: item.customName || itemId,
          x: 100 + (index * 50) % 300,  // Simple layout algorithm
          y: 100 + Math.floor((index * 50) / 300) * 50,
          width: item.dimensions?.width || 30,
          height: item.dimensions?.height || 30,
          rotation: 0,
          in_command_position: index === 0,  // First item in command position
          against_wall: index % 3 === 0,     // Every third item against wall
          feng_shui_quality: ["excellent", "good", "fair"][index % 3]
        });
        index++;
      }
    }
  });
  
  return {
    optimal_layout: {
      id: "mock_optimal",
      strategy: "optimal",
      furniture_placements: furniturePlacements,
      tradeoffs: [],
      feng_shui_score: 85
    },
    space_conscious_layout: {
      id: "mock_space",
      strategy: "space_conscious",
      furniture_placements: furniturePlacements.map(item => ({
        ...item,
        x: item.x * 0.9,
        y: item.y * 0.9,
        feng_shui_quality: "good"
      })),
      tradeoffs: [],
      feng_shui_score: 75
    },
    life_goal_layout: primaryLifeGoal ? {
      id: "mock_life_goal",
      strategy: "life_goal",
      furniture_placements: furniturePlacements.map(item => ({
        ...item,
        x: item.x * 1.1,
        y: item.y * 1.1,
        feng_shui_quality: "excellent"
      })),
      tradeoffs: [],
      feng_shui_score: 90,
      life_goal: primaryLifeGoal
    } : null,
    room_analysis: {
      dimensions: {
        width: 400,
        length: 300,
        area: 120000,
        units: "meters"
      },
      bagua_map: {
        "wealth": { x: 0, y: 0, width: 133, height: 100, element: "wood", life_area: "prosperity", colors: ["purple", "green"] },
        "fame": { x: 133, y: 0, width: 134, height: 100, element: "fire", life_area: "reputation", colors: ["red"] },
        "relationships": { x: 267, y: 0, width: 133, height: 100, element: "earth", life_area: "love", colors: ["pink", "red", "white"] },
        "family": { x: 0, y: 100, width: 133, height: 100, element: "wood", life_area: "family", colors: ["green"] },
        "center": { x: 133, y: 100, width: 134, height: 100, element: "earth", life_area: "health", colors: ["yellow", "brown"] },
        "children": { x: 267, y: 100, width: 133, height: 100, element: "metal", life_area: "creativity", colors: ["white", "grey"] },
        "knowledge": { x: 0, y: 200, width: 133, height: 100, element: "earth", life_area: "wisdom", colors: ["blue", "green"] },
        "career": { x: 133, y: 200, width: 134, height: 100, element: "water", life_area: "career", colors: ["black", "blue"] },
        "helpful_people": { x: 267, y: 200, width: 133, height: 100, element: "metal", life_area: "travel", colors: ["grey", "white"] }
      }
    },
    recommendations: [
      {
        "type": "general",
        "category": "sleep",
        "title": "Optimize sleeping environment",
        "description": "Position your bed in the command position with a solid wall behind it. Avoid electronic devices near the bed.",
        "importance": "high"
      },
      {
        "type": "placement",
        "category": "workspace",
        "title": "Workspace positioning",
        "description": "Place your desk in a position where you can see the door but are not directly in line with it.",
        "importance": "high"
      },
      {
        "type": "enhancement",
        "category": "decluttering",
        "title": "Clear clutter for energy flow",
        "description": "Regularly declutter to maintain good energy flow throughout your space.",
        "importance": "medium"
      }
    ]
  };
};

// Rest of the file unchanged
export const getFengShuiRecommendations = async (floorPlanId) => {
  try {
    const response = await api.get(`/api/layouts/${floorPlanId}/recommendations`);
    return response;
  } catch (error) {
    console.error('API Error Response:', error.response?.data);
    
    // Mock data fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock recommendations as fallback');
      return {
        data: {
          recommendations: [
            {
              "type": "general",
              "category": "balance",
              "title": "Create a balanced environment",
              "description": "Balance the five elements (wood, fire, earth, metal, water) in your space for optimal feng shui energy.",
              "importance": "high"
            },
            {
              "type": "enhancement",
              "category": "decluttering",
              "title": "Clear clutter for better energy flow",
              "description": "Regularly declutter to allow chi to flow freely throughout your space. Organize storage areas and keep pathways clear.",
              "importance": "high"
            },
            {
              "type": "placement",
              "category": "furniture_placement",
              "title": "Position furniture with intention",
              "description": "Place major furniture pieces in command positions with solid support behind them. Avoid blocking doorways or windows.",
              "importance": "medium"
            }
          ]
        }
      };
    }
    throw error;
  }
};