import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../state/store';
import Button from '../shared/Button';

const RoomCalibration = ({ onCalibrationComplete }) => {
  const { floorPlan, setRoomCalibration } = useStore();
  const [step, setStep] = useState(0); // 0: intro, 1-4: corners, 5: confirm
  const [points, setPoints] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  // Initialize if we already have calibration data
  useEffect(() => {
    if (floorPlan.calibration?.points && floorPlan.calibration.points.length === 4) {
      setPoints(floorPlan.calibration.points);
      setStep(5); // Skip to confirmation
    }
  }, [floorPlan.calibration]);
  
  // Handle image load to get dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { width, height, naturalWidth, naturalHeight } = imageRef.current;
      setImageSize({
        width,
        height,
        naturalWidth,
        naturalHeight
      });
      setImageLoaded(true);
      
      // Draw initial canvas
      drawCanvas();
    }
  };
  
  // Draw current state on canvas
  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the floor plan image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    
    // Draw corner points that have been placed
    if (points.length > 0) {
      points.forEach((point, index) => {
        // Draw point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.7)';
        ctx.fill();
        
        // Draw point number
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, point.x, point.y);
      });
      
      // Draw lines between points to show room outline
      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (points.length === 4) {
          ctx.closePath();
        }
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // If in corner-picking mode, show instructions for current corner
    if (step > 0 && step < 5) {
      const cornerNames = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
      const instructions = `Click on the ${cornerNames[step-1]} corner of your room`;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, canvas.width - 20, 40);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(instructions, canvas.width / 2, 30);
    }
  };
  
  // Update canvas when points or step changes
  useEffect(() => {
    drawCanvas();
  }, [points, step]);
  
  // Handle canvas click to place corner points
  const handleCanvasClick = (e) => {
    if (step < 1 || step > 4) return; // Only process clicks during corner selection
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get click position relative to canvas
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Add point
    const newPoints = [...points];
    if (step - 1 < newPoints.length) {
      // Replace existing point if revisiting a step
      newPoints[step - 1] = { x, y };
    } else {
      // Add new point
      newPoints.push({ x, y });
    }
    
    setPoints(newPoints);
    
    // Move to next step if we're not revisiting
    if (step === points.length + 1) {
      setStep(step + 1);
    }
  };
  
  const startCalibration = () => {
    setStep(1);
    setPoints([]);
  };
  
  const resetCalibration = () => {
    setStep(1);
    setPoints([]);
  };
  
  const confirmCalibration = () => {
    // Save calibration to store
    setRoomCalibration({
      points,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      timestamp: Date.now()
    });
    
    // Notify parent component
    if (onCalibrationComplete) {
      onCalibrationComplete();
    }
    
    // Move to final step
    setStep(5);
  };
  
  // Render intro step
  if (step === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Room Calibration</h3>
        <p className="text-sm text-gray-600 mb-4">
          To ensure furniture is positioned correctly on your floor plan, you need to mark the four corners of your room.
          This helps the system understand the exact location and dimensions of your room in the image.
        </p>
        
        <Button onClick={startCalibration}>
          Start Calibration
        </Button>
      </div>
    );
  }
  
  // Render confirmation step
  if (step === 5) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <h3 className="text-lg font-medium mb-3">Room Calibration Complete</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your room has been calibrated successfully. Furniture will now be positioned correctly on your floor plan.
        </p>
        
        <div className="mb-4">
          <canvas 
            ref={canvasRef} 
            width={imageSize.width || 800} 
            height={imageSize.height || 600}
            className="mx-auto border border-gray-200 max-h-80 object-contain"
          />
          <img
            ref={imageRef}
            src={floorPlan.fileUrl}
            alt="Floor Plan"
            onLoad={handleImageLoad}
            className="hidden" // Hidden, just used for loading the image
          />
        </div>
        
        <Button variant="secondary" onClick={resetCalibration}>
          Recalibrate
        </Button>
      </div>
    );
  }
  
  // Render corner selection steps
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Room Calibration</h3>
      <p className="text-sm text-gray-600 mb-4">
        {step < 5 ? `Step ${step} of 4: Mark the corners of your room in clockwise order, starting from the top-left corner.` : ''}
      </p>
      
      <div className="mb-4 relative">
        <canvas 
          ref={canvasRef} 
          width={imageSize.width || 800} 
          height={imageSize.height || 600}
          onClick={handleCanvasClick}
          className="mx-auto border border-gray-200 max-h-80 object-contain cursor-crosshair"
        />
        <img
          ref={imageRef}
          src={floorPlan.fileUrl}
          alt="Floor Plan"
          onLoad={handleImageLoad}
          className="hidden" // Hidden, just used for loading the image
        />
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        
        {points.length === 4 ? (
          <Button onClick={confirmCalibration}>
            Confirm Calibration
          </Button>
        ) : (
          <Button 
            onClick={() => setStep(Math.min(5, step + 1))}
            disabled={points.length < step}
          >
            {step < 4 ? 'Next' : 'Finish'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoomCalibration;