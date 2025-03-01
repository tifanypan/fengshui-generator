import React, { useState, useEffect } from 'react';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import LayoutViewer from '../../results/LayoutViewer';
import FengShuiRecommendations from '../../results/FengShuiRecommendations';
import { getFengShuiRecommendations } from '../../../api/layouts';

const ResultsPreview = ({ onNext, onBack }) => {
  const { floorPlan, furniture, payment, setPaymentOption, setLifeGoal } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [sampleLayouts, setSampleLayouts] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeLayout, setActiveLayout] = useState('optimal_layout');
  const [error, setError] = useState(null);
  
  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Only fetch if we have a valid ID
        if (!floorPlan.id) {
          console.log('No floor plan ID available, using mock recommendations');
          setRecommendations(getMockRecommendations());
          return;
        }
        
        console.log('Fetching recommendations for floor plan ID:', floorPlan.id);
        try {
          const response = await getFengShuiRecommendations(floorPlan.id);
          setRecommendations(response.data.recommendations || []);
        } catch (err) {
          console.error('Error fetching recommendations:', err);
          setRecommendations(getMockRecommendations());
        }
      } catch (err) {
        console.error('General error in fetchRecommendations:', err);
        setRecommendations(getMockRecommendations());
      }
    };
    
    fetchRecommendations();
  }, [floorPlan.id]);
  
  const getMockRecommendations = () => {
    return [
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
    ];
  };
  
  const handleGeneratePreview = async () => {
    // We're not generating actual layouts here, just sample/preview data
    setIsLoading(true);
    setError(null);
    
    // Mock data for preview only
    try {
      // In a real implementation, this would be a lightweight API call 
      // that returns simplified layout data for preview purposes
      setTimeout(() => {
        const previewLayouts = generateMockPreviewLayouts();
        setSampleLayouts(previewLayouts);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview. Please try again.');
      setIsLoading(false);
    }
  };
  
  const generateMockPreviewLayouts = () => {
    // Get room dimensions from floorPlan state
    const roomWidth = floorPlan.dimensions.width || 4.2;
    const roomLength = floorPlan.dimensions.length || 3.6;
    
    // Create sample furniture placements based on selected items
    const furniturePlacements = [];
    let index = 0;
    
    // Add placed furniture items
    Object.entries(furniture.items).forEach(([itemId, item]) => {
      if (item.quantity > 0) {
        for (let i = 0; i < Math.min(item.quantity, 1); i++) { // Limit to 1 of each for preview
          furniturePlacements.push({
            item_id: `${itemId}_${i}`,
            base_id: itemId,
            name: item.customName || formatItemName(itemId),
            x: 100 + (index * 60) % 300,
            y: 100 + Math.floor((index * 60) / 300) * 60,
            width: item.dimensions?.width || 30,
            height: item.dimensions?.height || 30,
            rotation: 0,
            in_command_position: index === 0,
            against_wall: index % 2 === 0,
            feng_shui_quality: "good"
          });
          index++;
        }
      }
    });
    
    // If no furniture selected, add sample furniture
    if (furniturePlacements.length === 0) {
      if (floorPlan.roomType === 'bedroom' || !floorPlan.roomType) {
        furniturePlacements.push(
          {
            item_id: "bed_1",
            base_id: "queen_bed",
            name: "Queen Bed",
            x: 120,
            y: 80,
            width: 60,
            height: 80,
            rotation: 0,
            in_command_position: true,
            against_wall: true,
            feng_shui_quality: "good"
          },
          {
            item_id: "dresser_1",
            base_id: "dresser",
            name: "Dresser",
            x: 220,
            y: 50,
            width: 60,
            height: 18,
            rotation: 0,
            in_command_position: false,
            against_wall: true,
            feng_shui_quality: "fair"
          }
        );
      } else if (floorPlan.roomType === 'office') {
        furniturePlacements.push(
          {
            item_id: "desk_1",
            base_id: "desk",
            name: "Desk",
            x: 120,
            y: 80,
            width: 48,
            height: 24,
            rotation: 0,
            in_command_position: true,
            against_wall: true,
            feng_shui_quality: "good"
          },
          {
            item_id: "office_chair_1",
            base_id: "office_chair",
            name: "Office Chair",
            x: 130,
            y: 110,
            width: 24,
            height: 24,
            rotation: 0,
            in_command_position: false,
            against_wall: false,
            feng_shui_quality: "good"
          }
        );
      }
    }
    
    return {
      optimal_layout: {
        id: "preview_optimal",
        strategy: "optimal",
        furniture_placements: furniturePlacements,
        tradeoffs: [],
        feng_shui_score: 85
      },
      space_conscious_layout: {
        id: "preview_space",
        strategy: "space_conscious",
        furniture_placements: furniturePlacements.map(item => ({
          ...item,
          x: item.x * 0.9,
          y: item.y * 0.9,
          feng_shui_quality: "fair"
        })),
        tradeoffs: [
          {
            item_id: furniturePlacements[0]?.item_id || "sample_item",
            issue: "non_ideal_bagua_area",
            description: "Item is not in its ideal bagua area",
            severity: "low",
            mitigation: "Consider adding complementary elements nearby to enhance energy"
          }
        ],
        feng_shui_score: 75
      },
      room_analysis: {
        dimensions: {
          width: roomWidth,
          length: roomLength,
          area: roomWidth * roomLength,
          units: "meters"
        },
        bagua_map: {
          "wealth": { x: 0, y: 0, width: roomWidth/3, height: roomLength/3, element: "wood", life_area: "prosperity", colors: ["purple", "green"] },
          "fame": { x: roomWidth/3, y: 0, width: roomWidth/3, height: roomLength/3, element: "fire", life_area: "reputation", colors: ["red"] },
          "relationships": { x: 2*roomWidth/3, y: 0, width: roomWidth/3, height: roomLength/3, element: "earth", life_area: "love", colors: ["pink", "red", "white"] },
          "family": { x: 0, y: roomLength/3, width: roomWidth/3, height: roomLength/3, element: "wood", life_area: "family", colors: ["green"] },
          "center": { x: roomWidth/3, y: roomLength/3, width: roomWidth/3, height: roomLength/3, element: "earth", life_area: "health", colors: ["yellow", "brown"] },
          "children": { x: 2*roomWidth/3, y: roomLength/3, width: roomWidth/3, height: roomLength/3, element: "metal", life_area: "creativity", colors: ["white", "grey"] },
          "knowledge": { x: 0, y: 2*roomLength/3, width: roomWidth/3, height: roomLength/3, element: "earth", life_area: "wisdom", colors: ["blue", "green"] },
          "career": { x: roomWidth/3, y: 2*roomLength/3, width: roomWidth/3, height: roomLength/3, element: "water", life_area: "career", colors: ["black", "blue"] },
          "helpful_people": { x: 2*roomWidth/3, y: 2*roomLength/3, width: roomWidth/3, height: roomLength/3, element: "metal", life_area: "travel", colors: ["grey", "white"] }
        }
      }
    };
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
  
  const calculateTotalPrice = () => {
    let total = 0;
    if (payment.baseLayout) total += 12;
    if (payment.lifeGoalOptimization) total += 5;
    if (payment.editProtection) total += 3;
    return total;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 4: Preview & Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Layout Preview */}
        <div className="md:col-span-2">
          {sampleLayouts ? (
            <>
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
              </div>
              
              {/* Layout Viewer */}
              <LayoutViewer 
                layouts={sampleLayouts}
                activeLayout={activeLayout}
                onChangeLayout={setActiveLayout}
              />
              
              {/* Preview Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 mb-4">
                <h3 className="text-md font-medium text-blue-800 mb-2">Preview Note</h3>
                <p className="text-sm text-blue-700">
                  This is a simplified preview to give you an idea of the layout. 
                  The final results will include more detailed furniture arrangements, 
                  recommendations, and feng shui analysis.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-300 rounded-md p-6 mb-4 text-center">
              <h3 className="text-lg font-medium mb-4">Preview Your Feng Shui Layout</h3>
              <p className="mb-6 text-gray-600">
                See a simplified preview of your feng shui furniture arrangement before purchase.
              </p>
              
              {isLoading ? (
                <div className="text-center p-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                  <p>Generating preview...</p>
                </div>
              ) : (
                <Button onClick={handleGeneratePreview}>
                  Generate Preview
                </Button>
              )}
              
              {error && (
                <p className="mt-4 text-red-600">{error}</p>
              )}
            </div>
          )}
          
          {/* Feng Shui Recommendations */}
          <FengShuiRecommendations recommendations={recommendations} />
        </div>
        
        {/* Right Column - Checkout Options */}
        <div>
          <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 sticky top-4">
            <h3 className="text-lg font-medium mb-4">Checkout Options</h3>
            
            {/* Base Layout Option */}
            <div className="mb-4 pb-4 border-b">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={payment.baseLayout}
                  onChange={() => setPaymentOption('baseLayout', !payment.baseLayout)}
                  className="mt-1 mr-3"
                  disabled
                />
                <div>
                  <span className="font-medium">Feng Shui Layout PDF</span>
                  <p className="text-sm text-gray-600">
                    Complete room layout with furniture placement and feng shui recommendations.
                  </p>
                  <span className="text-blue-600 font-medium">$12</span>
                </div>
              </label>
            </div>
            
            {/* Life Goal Optimization */}
            <div className="mb-4 pb-4 border-b">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={payment.lifeGoalOptimization}
                  onChange={() => setPaymentOption('lifeGoalOptimization', !payment.lifeGoalOptimization)}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium">Optimize for Primary Life Goal</span>
                  <p className="text-sm text-gray-600">
                    Prioritize specific feng shui areas to enhance your primary goal.
                  </p>
                  <span className="text-blue-600 font-medium">+$5</span>
                </div>
              </label>
              
              {payment.lifeGoalOptimization && (
                <div className="mt-3 ml-8">
                  <label className="text-sm font-medium mb-1 block">Select Primary Goal:</label>
                  <select
                    value={payment.lifeGoal || ''}
                    onChange={(e) => setLifeGoal(e.target.value || null)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a goal...</option>
                    <option value="career">Career & Work</option>
                    <option value="wealth">Money & Prosperity</option>
                    <option value="health">Health & Wellness</option>
                    <option value="relationships">Love & Relationships</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Edit Protection */}
            <div className="mb-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={payment.editProtection}
                  onChange={() => setPaymentOption('editProtection', !payment.editProtection)}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium">Edit Protection</span>
                  <p className="text-sm text-gray-600">
                    Make one-time adjustments to your layout within 48 hours without repurchasing.
                  </p>
                  <span className="text-blue-600 font-medium">+$3</span>
                </div>
              </label>
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="flex justify-between mb-1">
                <span>Base Layout</span>
                <span>$12.00</span>
              </div>
              
              {payment.lifeGoalOptimization && (
                <div className="flex justify-between mb-1">
                  <span>Life Goal Optimization</span>
                  <span>$5.00</span>
                </div>
              )}
              
              {payment.editProtection && (
                <div className="flex justify-between mb-1">
                  <span>Edit Protection</span>
                  <span>$3.00</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${calculateTotalPrice()}.00</span>
              </div>
              
              <Button
                className="w-full mt-4"
                onClick={onNext}
                disabled={isLoading}
              >
                Continue to Payment
              </Button>
              
              <div className="mt-2 text-xs text-center text-gray-500">
                Secure payment processing by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Step 3
        </Button>
      </div>
    </div>
  );
};

export default ResultsPreview;