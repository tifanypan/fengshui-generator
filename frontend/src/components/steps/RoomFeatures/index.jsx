import React, { useState } from 'react';
import Grid from '../../editor/Grid';
import Controls from '../../editor/Controls';
import ElementsPanel from './ElementsPanel';
import CompassSelector from './CompassSelector';
import Door from '../../elements/Door';
import Window from '../../elements/Window';
import FixedElement from '../../elements/FixedElement';
import useStore from '../../../state/store';
import Button from '../../shared/Button';

const RoomFeatures = ({ onNext, onBack }) => {
  const { 
    floorPlan, 
    gridSettings, 
    setSnapEnabled, 
    elements, 
    updateElement, 
    selectElement, 
    deselectElement 
  } = useStore();
  
  const [isSnapEnabled, setIsSnapEnabled] = useState(gridSettings.snapEnabled);
  
  const handleToggleSnap = () => {
    const newValue = !isSnapEnabled;
    setIsSnapEnabled(newValue);
    setSnapEnabled(newValue);
  };
  
  const handleElementUpdate = (id, updates) => {
    updateElement(id, updates);
  };
  
  const handleElementSelect = (id) => {
    selectElement(id);
  };
  
  const handleCanvasClick = () => {
    deselectElement();
  };
  
  const renderElements = () => {
    return elements.items.map((element) => {
      if (element.type === 'door') {
        return (
          <Door
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            isOpen={element.isOpen}
            isSelected={elements.selected === element.id}
            onSelect={() => handleElementSelect(element.id)}
            onUpdate={(updates) => handleElementUpdate(element.id, updates)}
            snapToGrid={isSnapEnabled}
            gridSize={gridSettings.cellSize}
          />
        );
      } else if (element.type === 'window') {
        return (
          <Window
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            isSelected={elements.selected === element.id}
            onSelect={() => handleElementSelect(element.id)}
            onUpdate={(updates) => handleElementUpdate(element.id, updates)}
            snapToGrid={isSnapEnabled}
            gridSize={gridSettings.cellSize}
          />
        );
      } else {
        return (
          <FixedElement
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            type={element.type}
            isSelected={elements.selected === element.id}
            onSelect={() => handleElementSelect(element.id)}
            onUpdate={(updates) => handleElementUpdate(element.id, updates)}
            snapToGrid={isSnapEnabled}
            gridSize={gridSettings.cellSize}
          />
        );
      }
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Step 2: Markup Key Room Features</h2>
      
      <ElementsPanel />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Controls 
          onToggleSnap={handleToggleSnap} 
          isSnapEnabled={isSnapEnabled}
        />
        <CompassSelector />
      </div>
      
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4" onClick={handleCanvasClick}>
        {floorPlan.fileUrl && (
          <div className="mb-4 relative">
            <img 
              src={floorPlan.fileUrl} 
              alt="Floor plan" 
              className="max-w-full mx-auto" 
              style={{ 
                maxHeight: '200px', 
                opacity: gridSettings.backgroundOpacity / 100
              }} 
            />
          </div>
        )}
        
        <Grid 
          width={800} 
          height={600} 
          cellSize={gridSettings.cellSize}
        >
          {renderElements()}
        </Grid>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="secondary"
          onClick={onBack}
        >
          Back to Step 1
        </Button>
        
        <Button 
          onClick={onNext}
        >
          Continue to Step 3
        </Button>
      </div>
    </div>
  );
};

export default RoomFeatures;