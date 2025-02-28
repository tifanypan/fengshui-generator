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

      
    //   // Add default furniture based on room type
    //   switch (roomType) {
    //     case 'bedroom':
    //       addFurnitureItem('bed', 'queen_bed', 1, { width: 60, height: 80 });
    //       addFurnitureItem('storage', 'nightstand', 2, { width: 18, height: 18 });
    //       addFurnitureItem('storage', 'dresser', 1, { width: 60, height: 18 });
    //       break;
          
    //     case 'office':
    //       addFurnitureItem('desk', 'desk', 1, { width: 48, height: 24 });
    //       addFurnitureItem('seating', 'office_chair', 1, { width: 24, height: 24 });
    //       addFurnitureItem('storage', 'bookshelf', 1, { width: 36, height: 12 });
    //       break;
          
    //     case 'bedroom_office':
    //       addFurnitureItem('bed', 'queen_bed', 1, { width: 60, height: 80 });
    //       addFurnitureItem('storage', 'nightstand', 1, { width: 18, height: 18 });
    //       addFurnitureItem('desk', 'desk', 1, { width: 48, height: 24 });
    //       addFurnitureItem('seating', 'office_chair', 1, { width: 24, height: 24 });
    //       break;
          
    //     case 'living_room':
    //       addFurnitureItem('seating', 'sofa', 1, { width: 84, height: 36 });
    //       addFurnitureItem('seating', 'lounge_chair', 1, { width: 30, height: 30 });
    //       addFurnitureItem('table', 'coffee_table', 1, { width: 40, height: 20 });
    //       addFurnitureItem('storage', 'tv_stand', 1, { width: 60, height: 18 });
    //       break;
          
    //     case 'dining_room':
    //       addFurnitureItem('table', 'dining_table', 1, { width: 72, height: 36 });
    //       addFurnitureItem('seating', 'dining_chair', 4, { width: 18, height: 18 });
    //       break;
          
    //     case 'studio':
    //       addFurnitureItem('bed', 'full_bed', 1, { width: 54, height: 75 });
    //       addFurnitureItem('seating', 'sofa', 1, { width: 60, height: 30 });
    //       addFurnitureItem('table', 'coffee_table', 1, { width: 36, height: 18 });
    //       addFurnitureItem('desk', 'desk', 1, { width: 48, height: 24 });
    //       addFurnitureItem('seating', 'office_chair', 1, { width: 24, height: 24 });
    //       break;
          
    //     default:
    //       break;
    //   }
    }
  });