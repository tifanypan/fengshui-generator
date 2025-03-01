// src/state/slices/furnitureSlice.js
export const furnitureSlice = (set, get) => ({
    furniture: {
      items: {}, // Format: { id: { type, quantity, dimensions, purpose } }
      specialConsiderations: {
        wheelchair: false,
        smallSpace: false,
        rental: false,
        pets: false,
        sensory: false
      },
      hasOutdoorSpace: false,
      studioConfig: {
        hasKitchen: false,
        hasDining: false,
        hasWorkspace: false,
        hasSleeping: true // Default true for studios
      }
    },
    
    addFurnitureItem: (itemType, itemId, defaultQuantity = 0, defaultDimensions = null, fengShuiRole = null, isResizable = false, dimensionLimits = null) => set(state => {
      // Don't add if it already exists
      if (state.furniture.items[itemId]) return state;
      
      return {
        furniture: {
          ...state.furniture,
          items: {
            ...state.furniture.items,
            [itemId]: {
              type: itemType,
              quantity: defaultQuantity,
              dimensions: defaultDimensions,
              customName: null,
              fengShuiRole,
              isResizable,
              dimensionLimits
            }
          }
        }
      };
    }),
    
    updateFurnitureQuantity: (itemId, quantity) => set(state => ({
      furniture: {
        ...state.furniture,
        items: {
          ...state.furniture.items,
          [itemId]: {
            ...state.furniture.items[itemId],
            quantity
          }
        }
      }
    })),
    
    updateFurnitureDimensions: (itemId, dimensions) => set(state => ({
      furniture: {
        ...state.furniture,
        items: {
          ...state.furniture.items,
          [itemId]: {
            ...state.furniture.items[itemId],
            dimensions
          }
        }
      }
    })),
    
    addCustomFurniture: (name, dimensions, purpose, quantity = 1) => {
      const itemId = `custom-${Date.now()}`;
      set(state => ({
        furniture: {
          ...state.furniture,
          items: {
            ...state.furniture.items,
            [itemId]: {
              type: 'custom',
              quantity,
              dimensions,
              customName: name,
              fengShuiRole: purpose,
              isResizable: false
            }
          }
        }
      }));
      return itemId;
    },
    
    removeFurnitureItem: (itemId) => set(state => {
      const updatedItems = { ...state.furniture.items };
      delete updatedItems[itemId];
      
      return {
        furniture: {
          ...state.furniture,
          items: updatedItems
        }
      };
    }),
    
    updateSpecialConsideration: (considerationType, value) => set(state => ({
      furniture: {
        ...state.furniture,
        specialConsiderations: {
          ...state.furniture.specialConsiderations,
          [considerationType]: value
        }
      }
    })),
    
    setHasOutdoorSpace: (value) => set(state => ({
      furniture: {
        ...state.furniture,
        hasOutdoorSpace: value
      }
    })),
    
    updateStudioConfig: (key, value) => set(state => ({
      furniture: {
        ...state.furniture,
        studioConfig: {
          ...state.furniture.studioConfig,
          [key]: value
        }
      }
    })),
    
    clearFurniture: () => set(state => ({
      furniture: {
        ...state.furniture,
        items: {}
      }
    })),
    
    populateRoomFurniture: (roomType) => {
      const { addFurnitureItem } = get();
      const { getFurnitureByRoomType } = require('../../utils/furnitureData');
      
      // Clear existing furniture first
      set(state => ({
        furniture: {
          ...state.furniture,
          items: {}
        }
      }));
      
      // Get furniture for the room type
      const furnitureList = getFurnitureByRoomType(roomType);
      
      // Add default furniture based on the furniture list
      furnitureList.forEach(category => {
        category.items.forEach(item => {
          addFurnitureItem(
            category.category.toLowerCase().replace(/\s+/g, '_'),
            item.id,
            item.defaultQuantity,
            item.dimensions,
            item.fengShuiRole,
            item.isResizable,
            item.dimensionLimits
          );
        });
      });
    }
  });