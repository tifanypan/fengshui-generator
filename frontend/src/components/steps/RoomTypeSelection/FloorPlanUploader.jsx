import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import { uploadFloorPlan } from '../../../api/floorPlan';
import RoomTypeSelector from '../RoomTypeSelection/RoomTypeSelector';


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
  'image/heic': ['.heic'],
  'image/svg+xml': ['.svg'],
  'image/vnd.dxf': ['.dxf'],
};

const FloorPlanUploader = () => {
  const { floorPlan, setFloorPlanFile, setFloorPlanId, setError } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'success', 'error'
  const [retryCount, setRetryCount] = useState(0);
  
  // Debug: Log the current state of floorPlan when component mounts or state changes
  useEffect(() => {
    console.log("Current floorPlan state:", floorPlan);
  }, [floorPlan]);
  
  // Verify if the floor plan ID persists across renders
  useEffect(() => {
    if (floorPlan.id) {
      console.log("Floor plan ID persists:", floorPlan.id);
    }
  }, [floorPlan.id]);
    
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit');
        setUploadStatus('error');
        return;
      }
      
      setIsUploading(true);
      setUploadStatus(null);
      
      try {
        // Set the file in state first to show preview
        setFloorPlanFile(file);
        
        // Get the current room type
        const availableRoomTypes = [
          'bedroom',
          'office',
          'bedroom_office',
          'living_room',
          'dining_room',
          'kitchen_dining',
          'kitchen_dining_living',
          'studio'
        ];
        
        const roomType = availableRoomTypes.includes(floorPlan.roomType) ? floorPlan.roomType : 'bedroom';
         
        console.log('Uploading file with room type:', roomType);
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room_type', roomType);
        
        // Upload to backend
        const response = await uploadFloorPlan(formData);
        
        // Debug the response in detail
        console.log('Upload API response:', {
          status: response.status,
          data: response.data
        });
        
        if (response.data.success) {
          // Store the ID returned from the backend
          const floorPlanId = response.data.floor_plan_id;
          console.log('Upload successful, floor plan ID:', floorPlanId);
          
          // Make sure we set the ID in state
          setFloorPlanId(floorPlanId);
          setUploadStatus('success');
          setError(null);
          
          // Debug confirmation after setting
          setTimeout(() => {
            console.log('Confirmed floor plan ID is set:', floorPlan.id);
          }, 100);
        } else {
          console.error('Upload failed with response:', response.data);
          setError(response.data.error || 'Upload failed');
          setUploadStatus('error');
          
          // For development, still set a mock ID
          if (process.env.NODE_ENV === 'development') {
            console.log('Setting development mock ID = 1');
            setFloorPlanId(1);
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        
        // Detailed error logging
        if (error.response) {
          console.error('Response error details:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        }
        
        setError('Error uploading file: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
        setUploadStatus('error');
        
        // For development, still set a mock ID
        if (process.env.NODE_ENV === 'development') {
          console.log('Setting development mock ID = 1 after error');
          setFloorPlanId(1);
        }
      } finally {
        setIsUploading(false);
      }
    }
  }, [floorPlan.roomType, setFloorPlanFile, setFloorPlanId, setError, floorPlan.id]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading
  });
  
  const removeFile = () => {
    setFloorPlanFile(null);
    setFloorPlanId(null); // Also clear the ID when the file is removed
    setUploadStatus(null);
  };
  
  const handleRetryUpload = () => {
    if (floorPlan.file) {
      setRetryCount(prev => prev + 1);
      onDrop([floorPlan.file]);
    }
  };
  
  const getStatusColor = () => {
    if (uploadStatus === 'success') return 'text-green-600';
    if (uploadStatus === 'error') return 'text-red-600';
    return 'text-yellow-600';
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Upload Floor Plan</h3>

<RoomTypeSelector />

      
      {!floorPlan.file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Drag & drop your floor plan here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, PNG, JPEG, HEIC, SVG, DXF (max 10MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{floorPlan.file.name}</p>
              <p className="text-sm text-gray-500">
                {(floorPlan.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {floorPlan.id ? (
                <p className="text-sm text-green-600">Floor Plan ID: {floorPlan.id}</p>
              ) : (
                <p className="text-sm text-yellow-600">Floor Plan ID not set! Please try re-uploading.</p>
              )}
              {uploadStatus && (
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {uploadStatus === 'success' ? 'Upload successful!' : 'Upload failed'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Button variant="secondary" onClick={removeFile}>
                Remove
              </Button>
              {uploadStatus === 'error' && (
                <Button variant="secondary" onClick={handleRetryUpload} className="ml-2">
                  Retry
                </Button>
              )}
            </div>
          </div>
          
          {floorPlan.fileUrl && floorPlan.file.type.startsWith('image/') && (
            <div className="mt-4">
              <img 
                src={floorPlan.fileUrl} 
                alt="Floor plan preview" 
                className="max-h-60 max-w-full mx-auto"
              />
            </div>
          )}
          
          {/* Debug/Manual ID entry for development - REMOVE FOR PRODUCTION */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <h4 className="font-medium text-yellow-800 mb-1">Debug Tools</h4>
            <div className="flex items-center space-x-2">
              <span className="mr-2">Manual ID:</span>
              <input
                type="number"
                min="1"
                value={floorPlan.id || ''}
                onChange={(e) => setFloorPlanId(parseInt(e.target.value) || null)}
                className="border rounded px-2 py-1 w-20"
              />
              <button
                onClick={() => setFloorPlanId(1)}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm"
              >
                Set ID=1
              </button>
              <button
                onClick={() => console.log("Current floor plan state:", floorPlan)}
                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm"
              >
                Log State
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-yellow-800">Current room type: <span className="font-mono">{floorPlan.roomType || 'not set'}</span></p>
            </div>
          </div>
        </div>
      )}
      
      {floorPlan.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{floorPlan.error}</p>
        </div>
      )}
    </div>
  );
};

export default FloorPlanUploader;