import React, { useState } from 'react';

const FengShuiRecommendations = ({ recommendations = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedRec, setExpandedRec] = useState(null);
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <p className="text-gray-500 text-center">No recommendations available.</p>
      </div>
    );
  }
  
  // Get unique categories
  const allCategories = recommendations.map(rec => rec.category);
  const categories = ['all', ...Array.from(new Set(allCategories))];
  
  // Filter recommendations by active category
  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.category === activeCategory);
  
  // Group recommendations by importance
  const highPriority = filteredRecommendations.filter(rec => rec.importance === 'high');
  const mediumPriority = filteredRecommendations.filter(rec => rec.importance === 'medium');
  const lowPriority = filteredRecommendations.filter(rec => rec.importance === 'low');
  
  // Get category display name
  const getCategoryDisplayName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">Feng Shui Recommendations</h3>
      
      {/* Category Filter */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 text-sm rounded-md whitespace-nowrap transition-colors ${
                category === activeCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
        </div>
      </div>
      
      {/* High Priority Recommendations */}
      {highPriority.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-red-600 border-b border-red-100 pb-1">
            Essential Improvements
          </h4>
          <div className="space-y-3">
            {highPriority.map((rec, index) => (
              <RecommendationCard 
                key={index} 
                recommendation={rec} 
                isExpanded={expandedRec === `high-${index}`} 
                onToggle={() => setExpandedRec(expandedRec === `high-${index}` ? null : `high-${index}`)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Medium Priority Recommendations */}
      {mediumPriority.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-orange-600 border-b border-orange-100 pb-1">
            Recommended Enhancements
          </h4>
          <div className="space-y-3">
            {mediumPriority.map((rec, index) => (
              <RecommendationCard 
                key={index} 
                recommendation={rec} 
                isExpanded={expandedRec === `medium-${index}`} 
                onToggle={() => setExpandedRec(expandedRec === `medium-${index}` ? null : `medium-${index}`)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Low Priority Recommendations */}
      {lowPriority.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3 text-green-600 border-b border-green-100 pb-1">
            Optional Refinements
          </h4>
          <div className="space-y-3">
            {lowPriority.map((rec, index) => (
              <RecommendationCard 
                key={index} 
                recommendation={rec} 
                isExpanded={expandedRec === `low-${index}`} 
                onToggle={() => setExpandedRec(expandedRec === `low-${index}` ? null : `low-${index}`)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Five Elements Balance Information */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-medium mb-3 text-gray-700">Five Elements Balance</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <ElementCard 
            element="Wood" 
            color="green" 
            items={["Plants", "Wooden furniture", "Columns", "Vertical shapes"]}
            qualities={["Growth", "Vitality", "Flexibility"]}
          />
          <ElementCard 
            element="Fire" 
            color="red" 
            items={["Lighting", "Candles", "Electronics", "Triangular shapes"]}
            qualities={["Passion", "Energy", "Transformation"]}
          />
          <ElementCard 
            element="Earth" 
            color="yellow" 
            items={["Ceramics", "Pottery", "Square shapes", "Stone"]}
            qualities={["Stability", "Grounding", "Nurturing"]}
          />
          <ElementCard 
            element="Metal" 
            color="gray" 
            items={["Metal objects", "Round shapes", "White colors"]}
            qualities={["Clarity", "Precision", "Efficiency"]}
          />
          <ElementCard 
            element="Water" 
            color="blue" 
            items={["Mirrors", "Glass", "Asymmetrical shapes", "Fountains"]}
            qualities={["Flow", "Abundance", "Depth"]}
          />
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation, isExpanded, onToggle }) => {
  // Get icon based on recommendation type
  const getIcon = (type) => {
    switch (type) {
      case 'general':
        return '📝';
      case 'mitigation':
        return '🛠️';
      case 'enhancement':
        return '✨';
      case 'placement':
        return '📐';
      case 'special_need':
        return '⭐';
      default:
        return '💡';
    }
  };
  
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'mitigation':
        return 'bg-amber-100 text-amber-800';
      case 'enhancement':
        return 'bg-purple-100 text-purple-800';
      case 'placement':
        return 'bg-indigo-100 text-indigo-800';
      case 'special_need':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={`border border-gray-200 rounded-md hover:border-gray-300 transition-all ${
      isExpanded ? 'shadow-md' : ''
    }`}>
      <div 
        className="p-3 cursor-pointer flex justify-between items-start"
        onClick={onToggle}
      >
        <div className="flex items-start">
          <span className="text-xl mr-3 mt-0.5">{getIcon(recommendation.type)}</span>
          <div>
            <div className="flex items-center mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${getTypeBadgeClass(recommendation.type)}`}>
                {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
              </span>
              <h5 className="font-medium">{recommendation.title}</h5>
            </div>
            
            {!isExpanded && (
              <p className="text-sm text-gray-600 line-clamp-1">{recommendation.description}</p>
            )}
          </div>
        </div>
        <span className="text-gray-400 ml-2">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 ml-9">
          <p className="text-sm text-gray-600">{recommendation.description}</p>
          
          {/* Optional example implementation */}
          {recommendation.example && (
            <div className="mt-2 bg-gray-50 text-sm p-2 rounded border border-gray-100">
              <p className="font-medium text-xs text-gray-700 mb-1">Example:</p>
              <p className="text-gray-600 text-xs">{recommendation.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ElementCard = ({ element, color, items, qualities }) => {
  const getBgColor = () => {
    switch (color) {
      case 'green': return 'bg-green-50 border-green-200';
      case 'red': return 'bg-red-50 border-red-200';
      case 'yellow': return 'bg-amber-50 border-amber-200';
      case 'gray': return 'bg-slate-50 border-slate-200';
      case 'blue': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getTextColor = () => {
    switch (color) {
      case 'green': return 'text-green-800';
      case 'red': return 'text-red-800';
      case 'yellow': return 'text-amber-800';
      case 'gray': return 'text-slate-800';
      case 'blue': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };
  
  return (
    <div className={`rounded-md p-2 ${getBgColor()} border`}>
      <h5 className={`text-sm font-medium mb-1 ${getTextColor()}`}>{element}</h5>
      
      <div className="text-xs text-gray-600">
        <p className="font-medium mb-1">Qualities:</p>
        <ul className="mb-2 pl-3">
          {qualities.map((quality, index) => (
            <li key={index} className="list-disc list-inside">{quality}</li>
          ))}
        </ul>
        
        <p className="font-medium mb-1">Examples:</p>
        <ul className="pl-3">
          {items.map((item, index) => (
            <li key={index} className="list-disc list-inside">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FengShuiRecommendations;