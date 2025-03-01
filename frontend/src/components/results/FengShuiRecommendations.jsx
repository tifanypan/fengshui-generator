import React, { useState } from 'react';

const FengShuiRecommendations = ({ recommendations = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <p className="text-gray-500 text-center">No recommendations available.</p>
      </div>
    );
  }
  
  // Get unique categories
  const categories = [
    'all',
    ...Array.from(new Set(recommendations.map(rec => rec.category)))
  ];
  
  // Filter recommendations by active category
  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.category === activeCategory);
  
  // Group recommendations by importance
  const highPriority = filteredRecommendations.filter(rec => rec.importance === 'high');
  const mediumPriority = filteredRecommendations.filter(rec => rec.importance === 'medium');
  const lowPriority = filteredRecommendations.filter(rec => rec.importance === 'low');
  
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-4">Feng Shui Recommendations</h3>
      
      {/* Category Filter */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 text-sm rounded-md whitespace-nowrap ${
                category === activeCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* High Priority Recommendations */}
      {highPriority.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2 text-red-600">High Priority</h4>
          <div className="space-y-3">
            {highPriority.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
      
      {/* Medium Priority Recommendations */}
      {mediumPriority.length > 0 && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2 text-orange-500">Medium Priority</h4>
          <div className="space-y-3">
            {mediumPriority.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
      
      {/* Low Priority Recommendations */}
      {lowPriority.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2 text-green-600">Optional Enhancements</h4>
          <div className="space-y-3">
            {lowPriority.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);
  
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
  
  return (
    <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
      <div 
        className="flex justify-between items-start cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start">
          <span className="text-xl mr-3">{getIcon(recommendation.type)}</span>
          <div>
            <h5 className="font-medium">{recommendation.title}</h5>
            {!expanded && (
              <p className="text-sm text-gray-600 line-clamp-1">{recommendation.description}</p>
            )}
          </div>
        </div>
        <span className="text-gray-400">
          {expanded ? '▲' : '▼'}
        </span>
      </div>
      
      {expanded && (
        <div className="mt-2 ml-9">
          <p className="text-sm text-gray-600">{recommendation.description}</p>
        </div>
      )}
    </div>
  );
};

export default FengShuiRecommendations;