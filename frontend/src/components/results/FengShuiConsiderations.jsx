import React from 'react';
import { getSeverityBackground, getFurnitureName } from '../../utils/furnitureUtils';

/**
 * Component to display feng shui considerations and tradeoffs
 */
const FengShuiConsiderations = ({ layoutData, furniturePlacements }) => {
  return (
    <div className="md:col-span-1 border rounded-md p-3">
      <h4 className="font-medium mb-2">Feng Shui Considerations</h4>
      
      {layoutData.tradeoffs && layoutData.tradeoffs.length > 0 ? (
        <div className="max-h-40 overflow-y-auto pr-1">
          <ul className="text-xs space-y-2">
            {layoutData.tradeoffs.map((tradeoff, index) => (
              <li key={index} className={`p-1.5 rounded ${getSeverityBackground(tradeoff.severity)}`}>
                <p className="font-medium">
                  {getFurnitureName(tradeoff.item_id, furniturePlacements)}: {tradeoff.description}
                </p>
                {tradeoff.mitigation && (
                  <p className="text-gray-700 mt-0.5 text-xs">{tradeoff.mitigation}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-green-600">
          No feng shui issues detected in this layout!
        </p>
      )}
    </div>
  );
};

export default FengShuiConsiderations;