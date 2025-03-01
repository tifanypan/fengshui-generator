// src/components/steps/ResultsDisplay/index.jsx
import React, { useState, useEffect } from 'react';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import LayoutViewer from '../../results/LayoutViewer';
import FengShuiRecommendations from '../../results/FengShuiRecommendations';
import { generateLayouts } from '../../../api/layouts';

const ResultsDisplay = ({ onBack }) => {
  const { floorPlan, furniture, payment } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [layouts, setLayouts] = useState(null);
  const [activeLayout, setActiveLayout] = useState('optimal_layout');
  const [error, setError] = useState(null);
  
  // Debug panel state for development
  const [showDebug, setShowDebug] = useState(true);
  const [manualId, setManualId] = useState(floorPlan.id || 1);
  
  // Generate layouts when component mounts
  useEffect(() => {
    console.log("ResultsDisplay mounted with floorPlan:", floorPlan);
    
    const fetchLayouts = async () => {
      try {
        // Check if we have a valid floor plan ID
        if (!floorPlan.id) {
          console.warn("No floor plan ID available in state, using ID=1 for development");
          // Continue without throwing error - will use ID=1 for testing
        }
        
        // Use ID from state or fallback to 1 for development
        const floorPlanIdToUse = floorPlan.id || 1;
        console.log("Generating layouts for floor plan ID:", floorPlanIdToUse);
        
        const lifeGoal = payment.lifeGoalOptimization ? payment.lifeGoal : null;
        
        // Prepare payload carefully
        const payload = {
          items: Object.entries(furniture.items)
            .filter(([_, item]) => item.quantity > 0)
            .reduce((acc, [id, item]) => {
              // Convert to the format expected by backend
              acc[id] = {
                quantity: item.quantity,
                dimensions: item.dimensions,
                customName: item.customName,
                type: item.type,
                fengShuiRole: item.fengShuiRole
              };
              return acc;
            }, {}),
          specialConsiderations: furniture.specialConsiderations,
          hasOutdoorSpace: furniture.hasOutdoorSpace,
          studioConfig: furniture.studioConfig,
        };
        
        // Log the payload to debug
        console.log("Payload for layouts API:", JSON.stringify(payload, null, 2));
        
        try {
          const response = await generateLayouts(
            floorPlanIdToUse,
            payload,
            lifeGoal
          );
          
          console.log("API response:", response);
          
          // API or mock data will be in response.data.layouts
          setLayouts(response.data.layouts);
          setError(null);
        } catch (err) {
          console.error('Error from API call:', err);
          setError(`API Error: ${err.message}. Using fallback data.`);
          
          // Create mock data for demonstration
          const mockLayouts = generateMockLayouts();
          setLayouts(mockLayouts);
        }
      } catch (err) {
        console.error('General error in fetchLayouts:', err);
        setError(`Error: ${err.message}. Using fallback data.`);
        
        // Create mock data for demonstration
        const mockLayouts = generateMockLayouts();
        setLayouts(mockLayouts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLayouts();
  }, [floorPlan, furniture, payment]);
  
  // Function to manually retry with a specific ID
  const retryWithId = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Manually retrying with ID=${id}`);
      
      const lifeGoal = payment.lifeGoalOptimization ? payment.lifeGoal : null;
      
      // Simple payload for testing
      const payload = {
        items: Object.entries(furniture.items)
          .filter(([_, item]) => item.quantity > 0)
          .reduce((acc, [id, item]) => {
            acc[id] = {
              quantity: item.quantity,
              dimensions: item.dimensions
            };
            return acc;
          }, {}),
        specialConsiderations: {}
      };
      
      const response = await generateLayouts(id, payload, lifeGoal);
      
      console.log("Manual retry response:", response);
      setLayouts(response.data.layouts);
      setError(null);
    } catch (err) {
      console.error('Error in manual retry:', err);
      setError(`Manual retry failed: ${err.message}`);
      
      // Fallback to mock data
      const mockLayouts = generateMockLayouts();
      setLayouts(mockLayouts);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock layouts for testing when API is not available
  const generateMockLayouts = () => {
    const mockData = {
      optimal_layout: {
        id: "mock_optimal",
        strategy: "optimal",
        furniture_placements: createMockFurniturePlacements(),
        tradeoffs: [],
        feng_shui_score: 92
      },
      space_conscious_layout: {
        id: "mock_space",
        strategy: "space_conscious",
        furniture_placements: createMockFurniturePlacements(0.9),
        tradeoffs: [
          {
            item_id: "dresser_1",
            issue: "non_ideal_bagua_area",
            description: "Dresser is not in its ideal bagua area",
            severity: "low",
            mitigation: "Consider adding wood elements nearby to enhance energy"
          }
        ],
        feng_shui_score: 78
      },
      life_goal_layout: payment.lifeGoalOptimization ? {
        id: "mock_life_goal",
        strategy: "life_goal",
        furniture_placements: createMockFurniturePlacements(1.1),
        tradeoffs: [],
        feng_shui_score: 90,
        life_goal: payment.lifeGoal
      } : null,
      room_analysis: {
        dimensions: {
          width: floorPlan.dimensions.width || 4.2,
          length: floorPlan.dimensions.length || 3.6,
          area: (floorPlan.dimensions.width || 4.2) * (floorPlan.dimensions.length || 3.6),
          units: "meters"
        },
        bagua_map: {
          "wealth": { x: 0, y: 0, width: 140, height: 120, element: "wood", life_area: "prosperity", colors: ["purple", "green"] },
          "fame": { x: 140, y: 0, width: 140, height: 120, element: "fire", life_area: "reputation", colors: ["red"] },
          "relationships": { x: 280, y: 0, width: 140, height: 120, element: "earth", life_area: "love", colors: ["pink", "red", "white"] },
          "family": { x: 0, y: 120, width: 140, height: 120, element: "wood", life_area: "family", colors: ["green"] },
          "center": { x: 140, y: 120, width: 140, height: 120, element: "earth", life_area: "health", colors: ["yellow", "brown"] },
          "children": { x: 280, y: 120, width: 140, height: 120, element: "metal", life_area: "creativity", colors: ["white", "grey"] },
          "knowledge": { x: 0, y: 240, width: 140, height: 120, element: "earth", life_area: "wisdom", colors: ["blue", "green"] },
          "career": { x: 140, y: 240, width: 140, height: 120, element: "water", life_area: "career", colors: ["black", "blue"] },
          "helpful_people": { x: 280, y: 240, width: 140, height: 120, element: "metal", life_area: "travel", colors: ["grey", "white"] }
        }
      },
      recommendations: [
        {
          "type": "general",
          "category": "sleep",
          "title": "Optimal sleep environment",
          "description": "For better sleep quality, consider using soft, calming colors like blue, green, or lavender. Avoid electronics near the bed and use blackout curtains.",
          "importance": "high"
        },
        {
          "type": "placement",
          "category": "bed_placement",
          "title": "Ideal bed placement",
          "description": "Place your bed in the command position (diagonally across from the door, but not directly in line with it) with a solid wall behind it for stability and support.",
          "importance": "high"
        },
        {
          "type": "enhancement",
          "category": "decluttering",
          "title": "Maintain clear energy with decluttering",
          "description": "Regularly clear clutter to maintain positive energy flow. Keep pathways open and organize storage to prevent energy stagnation.",
          "importance": "high"
        },
        {
          "type": "enhancement",
          "category": "lighting",
          "title": "Optimize lighting for energy balance",
          "description": "Use layered lighting with a mix of overhead, task, and accent lights. Natural light is best during the day, with warm lighting in the evening for better rest.",
          "importance": "medium"
        }
      ]
    };
    
    return mockData;
  };
  
  // Helper function to create mock furniture placements
  const createMockFurniturePlacements = (scaleFactor = 1.0) => {
    const placements = [];
    let index = 0;
    
    // Get selected furniture from store
    Object.entries(furniture.items).forEach(([itemId, item]) => {
      if (item.quantity > 0) {
        for (let i = 0; i < item.quantity; i++) {
          placements.push({
            item_id: `${itemId}_${i}`,
            base_id: itemId,
            name: item.customName || formatItemName(itemId),
            x: (100 + (index * 60) % 300) * scaleFactor,
            y: (100 + Math.floor((index * 60) / 300) * 60) * scaleFactor,
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
    
    // If no furniture selected, add sample furniture
    if (placements.length === 0) {
      placements.push(
        {
          item_id: "bed_1",
          base_id: "queen_bed",
          name: "Queen Bed",
          x: 120 * scaleFactor,
          y: 80 * scaleFactor,
          width: 60,
          height: 80,
          rotation: 0,
          in_command_position: true,
          against_wall: true,
          feng_shui_quality: "excellent"
        },
        {
          item_id: "dresser_1",
          base_id: "dresser",
          name: "Dresser",
          x: 220 * scaleFactor,
          y: 50 * scaleFactor,
          width: 60,
          height: 18,
          rotation: 0,
          in_command_position: false,
          against_wall: true,
          feng_shui_quality: "good"
        },
        {
          item_id: "nightstand_1",
          base_id: "nightstand",
          name: "Nightstand",
          x: 190 * scaleFactor,
          y: 80 * scaleFactor,
          width: 18,
          height: 18,
          rotation: 0,
          in_command_position: false,
          against_wall: false,
          feng_shui_quality: "good"
        }
      );
    }
    
    return placements;
  };
  
  // Format item ID to readable name
  const formatItemName = (itemId) => {
    return itemId
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const handleDownloadPDF = () => {
    // For now, just show an alert - in a real implementation, this would generate a PDF
    alert('PDF Generation: In a production environment, this would generate and download a PDF with your feng shui layout plans.');
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Step 6: Your Feng Shui Results</h2>
        <div className="bg-white border border-gray-300 rounded-md p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Generating your personalized feng shui layouts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Step 6: Your Feng Shui Results</h2>
        <div>
          <Button onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </div>
      
      {/* Debug Panel for Development - REMOVE FOR PRODUCTION */}
      {showDebug && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 mb-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Panel</h3>
            <button onClick={() => setShowDebug(false)} className="text-yellow-700">×</button>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-yellow-700">
              <strong>Current Floor Plan ID:</strong> {floorPlan.id || 'Not set'}
            </p>
            <p className="text-sm text-yellow-700">
              <strong>Room Type:</strong> {floorPlan.roomType || 'Not set'}
            </p>
            <p className="text-sm text-yellow-700">
              <strong>Furniture Count:</strong> {Object.values(furniture.items).reduce((count, item) => count + (item.quantity || 0), 0)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-yellow-700">Test with ID:</label>
            <input
              type="number"
              min="1"
              value={manualId}
              onChange={(e) => setManualId(parseInt(e.target.value) || 1)}
              className="w-16 border rounded px-2 py-1"
            />
            <button
              onClick={() => retryWithId(manualId)}
              className="px-3 py-1 bg-yellow-200 rounded text-yellow-800"
            >
              Retry API
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <h3 className="text-lg font-medium text-green-800 mb-2">Payment Successful</h3>
        <p className="text-green-700">
          Thank you for your purchase! Your feng shui layouts have been generated successfully.
        </p>
        {error && (
          <p className="text-yellow-600 mt-2 text-sm">
            Note: {error}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Left Column - Layout Display */}
        <div className="md:col-span-8">
          {/* Layout Selection Tabs */}
          <div className="flex mb-4 border-b">
            <button
              className={`py-2 px-4 ${activeLayout === 'optimal_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveLayout('optimal_layout')}
            >
              Best Feng Shui
            </button>
            <button
              className={`py-2 px-4 ${activeLayout === 'space_conscious_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveLayout('space_conscious_layout')}
            >
              Space Efficient
            </button>
            {layouts?.life_goal_layout && payment.lifeGoalOptimization && (
              <button
                className={`py-2 px-4 ${activeLayout === 'life_goal_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveLayout('life_goal_layout')}
              >
                {payment.lifeGoal ? `${payment.lifeGoal.charAt(0).toUpperCase() + payment.lifeGoal.slice(1)} Focus` : 'Life Goal Focus'}
              </button>
            )}
          </div>
          
          {/* Layout Viewer */}
          {layouts && (
            <LayoutViewer 
              layouts={layouts}
              activeLayout={activeLayout}
              onChangeLayout={setActiveLayout}
            />
          )}
        </div>
        
        {/* Right Column - Purchase Info & Recommendations */}
        <div className="md:col-span-4">
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-2">Your Purchase</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex justify-between">
                <span>Basic Layout</span>
                <span className="font-medium">✓</span>
              </li>
              {payment.lifeGoalOptimization && (
                <li className="flex justify-between">
                  <span>Life Goal Optimization</span>
                  <span className="font-medium text-blue-600">✓ Premium</span>
                </li>
              )}
              {payment.editProtection && (
                <li className="flex justify-between">
                  <span>Edit Protection</span>
                  <span className="font-medium text-blue-600">✓ Premium</span>
                </li>
              )}
            </ul>
            
            {payment.editProtection && (
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                <p><strong>Edit Protection:</strong> You can request one-time adjustments to your layout within 48 hours.</p>
              </div>
            )}
          </div>
          
          {/* Room Info */}
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
            <h3 className="text-lg font-medium mb-2">Room Information</h3>
            <ul className="space-y-1 text-sm mb-4">
              <li><span className="font-medium">Type:</span> {floorPlan.roomType?.replace(/_/g, ' ') || 'Bedroom'}</li>
              <li><span className="font-medium">Dimensions:</span> {(floorPlan.dimensions.width || 4.2).toFixed(1)}m × {(floorPlan.dimensions.length || 3.6).toFixed(1)}m</li>
              <li><span className="font-medium">Orientation:</span> {floorPlan.compass.orientation || 'North'}</li>
              <li>
                <span className="font-medium">Furniture:</span> {' '}
                {Object.values(furniture.items).reduce((total, item) => total + (item.quantity || 0), 0)} items
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Feng Shui Recommendations */}
      {layouts && (
        <FengShuiRecommendations recommendations={layouts.recommendations || []} />
      )}
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Payment
        </Button>
        
        <Button onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;