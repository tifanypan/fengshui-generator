import React, { useState, useEffect } from 'react';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import LayoutViewer from '../../results/LayoutViewer';
import FengShuiRecommendations from '../../results/FengShuiRecommendations';
import { generateLayouts, getFengShuiRecommendations } from '../../../api/layouts';

const ResultsPreview = ({ onNext, onBack }) => {
  const { floorPlan, furniture } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [layouts, setLayouts] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeLayout, setActiveLayout] = useState('optimal_layout');
  const [error, setError] = useState(null);
  const [paymentOption, setPaymentOption] = useState({
    baseLayout: true,
    lifeGoalOptimization: false,
    editProtection: false
  });
  const [selectedLifeGoal, setSelectedLifeGoal] = useState(null);
  
  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await getFengShuiRecommendations(floorPlan.id);
        setRecommendations(response.data.recommendations || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };
    
    if (floorPlan.id) {
      fetchRecommendations();
    }
  }, [floorPlan.id]);
  
  const handleGenerateLayouts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare data for API call
      const lifeGoal = paymentOption.lifeGoalOptimization ? selectedLifeGoal : null;
      
      const response = await generateLayouts(
        floorPlan.id,
        {
          items: furniture.items,
          specialConsiderations: furniture.specialConsiderations,
          hasOutdoorSpace: furniture.hasOutdoorSpace,
          studioConfig: furniture.studioConfig
        },
        lifeGoal
      );
      
      setLayouts(response.data.layouts);
      
      // Update recommendations if available
      if (response.data.layouts.recommendations) {
        setRecommendations(response.data.layouts.recommendations);
      }
      
    } catch (err) {
      console.error('Error generating layouts:', err);
      setError('Failed to generate layouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateTotalPrice = () => {
    let total = 0;
    if (paymentOption.baseLayout) total += 12;
    if (paymentOption.lifeGoalOptimization) total += 5;
    if (paymentOption.editProtection) total += 3;
    return total;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 4: Preview & Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Layout Preview */}
        <div className="md:col-span-2">
          {layouts ? (
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
                {layouts.life_goal_layout && (
                  <button
                    className={`py-2 px-4 ${activeLayout === 'life_goal_layout' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveLayout('life_goal_layout')}
                  >
                    {selectedLifeGoal ? `${selectedLifeGoal.charAt(0).toUpperCase() + selectedLifeGoal.slice(1)} Focus` : 'Life Goal Focus'}
                  </button>
                )}
              </div>
              
              {/* Layout Viewer */}
              <LayoutViewer 
                layouts={layouts}
                activeLayout={activeLayout}
                onChangeLayout={setActiveLayout}
              />
            </>
          ) : (
            <div className="bg-white border border-gray-300 rounded-md p-6 mb-4 text-center">
              <h3 className="text-lg font-medium mb-4">Preview Your Feng Shui Layout</h3>
              <p className="mb-6 text-gray-600">
                See your personalized feng shui furniture arrangement before purchasing the full PDF layout guide.
              </p>
              
              {isLoading ? (
                <div className="text-center p-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                  <p>Generating your personalized feng shui layouts...</p>
                </div>
              ) : (
                <Button onClick={handleGenerateLayouts}>
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
                  checked={paymentOption.baseLayout}
                  onChange={() => setPaymentOption(prev => ({ ...prev, baseLayout: !prev.baseLayout }))}
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
                  checked={paymentOption.lifeGoalOptimization}
                  onChange={() => setPaymentOption(prev => ({ 
                    ...prev, 
                    lifeGoalOptimization: !prev.lifeGoalOptimization,
                    // Reset selected life goal if turning off
                    selectedLifeGoal: !prev.lifeGoalOptimization ? selectedLifeGoal : null
                  }))}
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
              
              {paymentOption.lifeGoalOptimization && (
                <div className="mt-3 ml-8">
                  <label className="text-sm font-medium mb-1 block">Select Primary Goal:</label>
                  <select
                    value={selectedLifeGoal || ''}
                    onChange={(e) => setSelectedLifeGoal(e.target.value)}
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
                  checked={paymentOption.editProtection}
                  onChange={() => setPaymentOption(prev => ({ ...prev, editProtection: !prev.editProtection }))}
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
              
              {paymentOption.lifeGoalOptimization && (
                <div className="flex justify-between mb-1">
                  <span>Life Goal Optimization</span>
                  <span>$5.00</span>
                </div>
              )}
              
              {paymentOption.editProtection && (
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