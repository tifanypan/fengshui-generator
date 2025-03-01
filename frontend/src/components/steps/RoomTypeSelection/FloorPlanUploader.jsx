import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../../../state/store';
import Button from '../../shared/Button';
import { uploadFloorPlan } from '../../../api/floorPlan';

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
    
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit');
        return;
      }
      
      // Set the file in state first
      setFloorPlanFile(file);
      
      // Get the current room type
      const roomType = floorPlan.roomType || 'bedroom'; // Default to bedroom if not set
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room_type', roomType);
        
        // Upload to backend
        const response = await uploadFloorPlan(formData);
        
        if (response.data.success) {
          // Store the ID returned from the backend
          console.log('Upload successful, floor plan ID:', response.data.floor_plan_id);
          setFloorPlanId(response.data.floor_plan_id);
          setError(null);
        } else {
          setError(response.data.error || 'Upload failed');
          console.log('Upload failed, using mock ID');
          
          // Use a VALID mock ID for testing
          // Make sure this ID actually exists in your database
          setFloorPlanId(1); // Use ID 1 which should exist in your database
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error uploading file: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
        
        console.log('API error, using mock ID');
        // Use a VALID mock ID for testing
        setFloorPlanId(1); // Use ID 1 which should exist in your database
      }
    }
  }, [floorPlan.roomType, setFloorPlanFile, setFloorPlanId, setError]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
  });
  
  const removeFile = () => {
    setFloorPlanFile(null);
    setFloorPlanId(null); // Also clear the ID when the file is removed
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Upload Floor Plan</h3>
      
      {!floorPlan.file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            Drag & drop your floor plan here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, PNG, JPEG, HEIC, SVG, DXF (max 10MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{floorPlan.file.name}</p>
              <p className="text-sm text-gray-500">
                {(floorPlan.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {floorPlan.id && (
                <p className="text-sm text-blue-600">Floor Plan ID: {floorPlan.id}</p>
              )}
            </div>
            <Button variant="secondary" onClick={removeFile}>
              Remove
            </Button>
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
        </div>
      )}
      
      {floorPlan.error && (
        <p className="text-red-600 mt-2">{floorPlan.error}</p>
      )}
    </div>
  );
};

export default FloorPlanUploader;