export const floorPlanSlice = (set, get) => ({
  floorPlan: {
    file: null,
    fileUrl: null,
    fileType: null,
    roomType: null,
    occupants: [],
    dimensions: { width: 0, height: 0 },
    compass: {
      orientation: null, // 'North', 'East', 'South', 'West'
    },
    isLoading: false,
    error: null,
  },
  
  gridSettings: {
    cellSize: 20,
    snapEnabled: true,
    scale: 1, // 1 = 1 foot, 0.3048 = 1 meter
    backgroundOpacity: 100,
  },
  
  setFloorPlanFile: (file) => set((state) => ({
    floorPlan: {
      ...state.floorPlan,
      file,
      fileUrl: file ? URL.createObjectURL(file) : null,
      fileType: file ? file.type : null,
    },
  })),
    
    setRoomType: (roomType) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        roomType,
      },
    })),
    
    addOccupant: (occupant) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        occupants: [...state.floorPlan.occupants, occupant],
      },
    })),
    
    removeOccupant: (index) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        occupants: state.floorPlan.occupants.filter((_, i) => i !== index),
      },
    })),
    
    setDimensions: (dimensions) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        dimensions,
      },
    })),
    
    setLoading: (isLoading) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        isLoading,
      },
    })),
    
    setError: (error) => set((state) => ({
      floorPlan: {
        ...state.floorPlan,
        error,
      },
    })),

     
  setCellSize: (cellSize) => set((state) => ({
    gridSettings: {
      ...state.gridSettings,
      cellSize,
    },
  })),
  
  setSnapEnabled: (snapEnabled) => set((state) => ({
    gridSettings: {
      ...state.gridSettings,
      snapEnabled,
    },
  })),
  
  setScale: (scale) => set((state) => ({
    gridSettings: {
      ...state.gridSettings,
      scale,
    },
  })),
  
  setBackgroundOpacity: (backgroundOpacity) => set((state) => ({
    gridSettings: {
      ...state.gridSettings,
      backgroundOpacity,
    },
  })),

  setCompassOrientation: (orientation) => set((state) => ({
    floorPlan: {
      ...state.floorPlan,
      compass: {
        ...state.floorPlan.compass,
        orientation,
      },
    },
  })),
});
