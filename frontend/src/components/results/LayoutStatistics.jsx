import React from 'react';
import { getScoreColor, countItemsInCommandPosition, countItemsAgainstWall } from '../../utils/furnitureUtils';

/**
 * Component to display layout statistics and scores
 */
const LayoutStatistics = ({ layoutData, furniturePlacements, layouts, activeLayout }) => {
  return (
    <div className="md:col-span-1 border rounded-md p-3">
      <h4 className="font-medium mb-2">Feng Shui Score</h4>
      <div className="flex justify-between items-center mb-3">
        <div className="bg-gray-200 h-4 w-full rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full"
            style={{
              width: `${layoutData.feng_shui_score}%`,
              backgroundColor: getScoreColor(layoutData.feng_shui_score)
            }}
          />
        </div>
        <span className="ml-3 font-bold">{layoutData.feng_shui_score}/100</span>
      </div>
      
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Items in command position:</span>
          <span className="font-medium">{countItemsInCommandPosition(furniturePlacements)}</span>
        </div>
        <div className="flex justify-between">
          <span>Items against wall:</span>
          <span className="font-medium">{countItemsAgainstWall(furniturePlacements)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total furniture pieces:</span>
          <span className="font-medium">{furniturePlacements.length}</span>
        </div>
      </div>
      
      {/* If life goal layout, show goal details */}
      {activeLayout === 'life_goal_layout' && layoutData.life_goal && (
        <div className="mt-3 bg-indigo-50 p-2 rounded border border-indigo-100">
          <h5 className="font-medium text-sm text-indigo-800">Life Goal Focus</h5>
          <p className="text-xs text-indigo-700">
            This layout is optimized for {layoutData.life_goal.charAt(0).toUpperCase() + layoutData.life_goal.slice(1)}
          </p>
        </div>
      )}
      
      {/* If kua number available, show it */}
      {layouts.kua_number && (
        <div className="mt-3 bg-teal-50 p-2 rounded border border-teal-100">
          <h5 className="font-medium text-sm text-teal-800">Personal Feng Shui</h5>
          <div className="text-xs text-teal-700">
            <div>Kua Number: <span className="font-medium">{layouts.kua_number}</span></div>
            <div>Group: <span className="font-medium">{layouts.kua_group}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutStatistics;