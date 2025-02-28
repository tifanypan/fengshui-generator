import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import useStore from '../../../state/store';
import Button from '../../shared/Button';

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
  const { floorPlan, setFloorPlanFile, setError } = useStore();
  
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit');
        return;
      }
      setFloorPlanFile(file);
      setError(null);
    }
  }, [setFloorPlanFile, setError]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
  });
  
  const removeFile = () => {
    setFloorPlanFile(null);
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