// src/utils/furnitureData.js

// Bedroom furniture data
export const bedroomFurniture = [
  {
    category: 'Beds',
    items: [
      { id: 'twin_bed', name: 'Twin Bed', dimensions: { width: 38, height: 75 }, defaultQuantity: 0, fengShuiRole: 'rest', isResizable: false },
      { id: 'full_bed', name: 'Full Bed', dimensions: { width: 54, height: 75 }, defaultQuantity: 0, fengShuiRole: 'rest', isResizable: false },
      { id: 'queen_bed', name: 'Queen Bed', dimensions: { width: 60, height: 80 }, defaultQuantity: 1, fengShuiRole: 'rest', isResizable: false },
      { id: 'king_bed', name: 'King Bed', dimensions: { width: 76, height: 80 }, defaultQuantity: 0, fengShuiRole: 'rest', isResizable: false },
      { id: 'bunk_bed', name: 'Bunk Bed', dimensions: { width: 42, height: 80 }, defaultQuantity: 0, fengShuiRole: 'rest', isResizable: false },
      { id: 'murphy_bed', name: 'Murphy Bed', dimensions: { width: 60, height: 80 }, defaultQuantity: 0, fengShuiRole: 'flexibility', isResizable: false }
    ]
  },
  {
    category: 'Bedroom Storage',
    items: [
      { id: 'nightstand', name: 'Nightstand', dimensions: { width: 18, height: 18 }, defaultQuantity: 2, fengShuiRole: 'balance', isResizable: true, dimensionLimits: { minWidth: 16, maxWidth: 24, minDepth: 16, maxDepth: 24 } },
      { id: 'dresser', name: 'Dresser', dimensions: { width: 60, height: 18 }, defaultQuantity: 1, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 72, minDepth: 18, maxDepth: 24 } },
      { id: 'wardrobe', name: 'Wardrobe/Closet', dimensions: { width: 36, height: 24 }, defaultQuantity: 0, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 20, maxDepth: 30 } },
      { id: 'clothing_rack', name: 'Clothing Rack', dimensions: { width: 36, height: 18 }, defaultQuantity: 0, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 18, maxDepth: 24 } }
    ]
  },
  {
    category: 'Bedroom Accessories',
    items: [
      { id: 'standing_mirror', name: 'Standing Mirror', dimensions: { width: 20, height: 60 }, defaultQuantity: 0, fengShuiRole: 'reflection', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 30, minDepth: 2, maxDepth: 5 } },
      { id: 'vanity', name: 'Vanity Table & Mirror', dimensions: { width: 36, height: 18 }, defaultQuantity: 0, fengShuiRole: 'personal_care', isResizable: true, dimensionLimits: { minWidth: 30, maxWidth: 48, minDepth: 18, maxDepth: 24 } }
    ]
  }
];

// Office furniture data
export const officeFurniture = [
  {
    category: 'Workspace',
    items: [
      { id: 'desk', name: 'Desk', dimensions: { width: 48, height: 24 }, defaultQuantity: 1, fengShuiRole: 'productivity', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 72, minDepth: 18, maxDepth: 36 } },
      { id: 'gaming_desk', name: 'Gaming Desk', dimensions: { width: 60, height: 30 }, defaultQuantity: 0, fengShuiRole: 'productivity', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 80, minDepth: 24, maxDepth: 40 } },
      { id: 'drafting_table', name: 'Drafting Table', dimensions: { width: 42, height: 30 }, defaultQuantity: 0, fengShuiRole: 'creativity', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 60, minDepth: 24, maxDepth: 36 } },
      { id: 'office_chair', name: 'Office Chair', dimensions: { width: 24, height: 24 }, defaultQuantity: 1, fengShuiRole: 'support', isResizable: false },
      { id: 'gaming_chair', name: 'Gaming Chair', dimensions: { width: 26, height: 26 }, defaultQuantity: 0, fengShuiRole: 'support', isResizable: false }
    ]
  },
  {
    category: 'Office Storage',
    items: [
      { id: 'bookshelf', name: 'Bookshelf', dimensions: { width: 36, height: 12 }, defaultQuantity: 0, fengShuiRole: 'knowledge', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 10, maxDepth: 18 } },
      { id: 'filing_cabinet', name: 'Filing Cabinet', dimensions: { width: 18, height: 24 }, defaultQuantity: 0, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 15, maxWidth: 24, minDepth: 18, maxDepth: 30 } }
    ]
  },
  {
    category: 'Office Accessories',
    items: [
      { id: 'whiteboard', name: 'Whiteboard / Corkboard', dimensions: { width: 36, height: 24 }, defaultQuantity: 0, fengShuiRole: 'ideas', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 60, minDepth: 1, maxDepth: 3 } },
      { id: 'desk_lamp', name: 'Desk Lamp', dimensions: { width: 8, height: 8 }, defaultQuantity: 0, fengShuiRole: 'focus', isResizable: false }
    ]
  }
];

// Living Room furniture data
export const livingRoomFurniture = [
  {
    category: 'Seating',
    items: [
      { id: 'sofa_small', name: 'Sofa (Small)', dimensions: { width: 60, height: 30 }, defaultQuantity: 0, fengShuiRole: 'comfort', isResizable: true, dimensionLimits: { minWidth: 54, maxWidth: 72, minDepth: 28, maxDepth: 36 } },
      { id: 'sofa', name: 'Sofa (Large/Sectional)', dimensions: { width: 84, height: 36 }, defaultQuantity: 1, fengShuiRole: 'comfort', isResizable: true, dimensionLimits: { minWidth: 72, maxWidth: 120, minDepth: 30, maxDepth: 40 } },
      { id: 'lounge_chair', name: 'Lounge Chair', dimensions: { width: 30, height: 30 }, defaultQuantity: 0, fengShuiRole: 'relaxation', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 36, minDepth: 24, maxDepth: 36 } },
      { id: 'recliner', name: 'Recliner', dimensions: { width: 30, height: 36 }, defaultQuantity: 0, fengShuiRole: 'relaxation', isResizable: true, dimensionLimits: { minWidth: 28, maxWidth: 36, minDepth: 30, maxDepth: 40 } },
      { id: 'ottoman', name: 'Footrest / Ottoman', dimensions: { width: 24, height: 18 }, defaultQuantity: 0, fengShuiRole: 'support', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 30, minDepth: 18, maxDepth: 24 } },
      { id: 'bean_bag', name: 'Bean Bag Chair', dimensions: { width: 30, height: 30 }, defaultQuantity: 0, fengShuiRole: 'flexibility', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 36, minDepth: 24, maxDepth: 36 } }
    ]
  },
  {
    category: 'Tables',
    items: [
      { id: 'coffee_table', name: 'Coffee Table', dimensions: { width: 40, height: 20 }, defaultQuantity: 1, fengShuiRole: 'connection', isResizable: true, dimensionLimits: { minWidth: 30, maxWidth: 48, minDepth: 18, maxDepth: 24 } },
      { id: 'side_table', name: 'Side Table', dimensions: { width: 18, height: 18 }, defaultQuantity: 0, fengShuiRole: 'support', isResizable: true, dimensionLimits: { minWidth: 16, maxWidth: 24, minDepth: 16, maxDepth: 24 } },
      { id: 'console_table', name: 'Console Table', dimensions: { width: 48, height: 16 }, defaultQuantity: 0, fengShuiRole: 'transition', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 60, minDepth: 14, maxDepth: 20 } }
    ]
  },
  {
    category: 'Entertainment',
    items: [
      { id: 'tv_stand', name: 'TV Stand', dimensions: { width: 60, height: 18 }, defaultQuantity: 0, fengShuiRole: 'focus', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 72, minDepth: 16, maxDepth: 24 } },
      { id: 'media_console', name: 'Entertainment Center', dimensions: { width: 72, height: 20 }, defaultQuantity: 0, fengShuiRole: 'focus', isResizable: true, dimensionLimits: { minWidth: 60, maxWidth: 84, minDepth: 18, maxDepth: 24 } }
    ]
  }
];

// Dining Room furniture data
export const diningRoomFurniture = [
  {
    category: 'Dining Furniture',
    items: [
      { id: 'dining_table', name: 'Dining Table', dimensions: { width: 72, height: 36 }, defaultQuantity: 1, fengShuiRole: 'gathering', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 96, minDepth: 30, maxDepth: 48 } },
      { id: 'expandable_dining_table', name: 'Expandable Dining Table', dimensions: { width: 60, height: 36 }, defaultQuantity: 0, fengShuiRole: 'flexibility', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 84, minDepth: 30, maxDepth: 42 } },
      { id: 'dining_chair', name: 'Dining Chairs', dimensions: { width: 18, height: 18 }, defaultQuantity: 4, fengShuiRole: 'support', isResizable: false },
      { id: 'bench', name: 'Bench', dimensions: { width: 48, height: 14 }, defaultQuantity: 0, fengShuiRole: 'community', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 60, minDepth: 14, maxDepth: 18 } },
      { id: 'bar_stool', name: 'Bar Stools', dimensions: { width: 15, height: 15 }, defaultQuantity: 0, fengShuiRole: 'social', isResizable: false }
    ]
  },
  {
    category: 'Dining Storage',
    items: [
      { id: 'china_cabinet', name: 'China Cabinet', dimensions: { width: 40, height: 18 }, defaultQuantity: 0, fengShuiRole: 'abundance', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 60, minDepth: 16, maxDepth: 24 } },
      { id: 'buffet', name: 'Buffet / Sideboard', dimensions: { width: 60, height: 18 }, defaultQuantity: 0, fengShuiRole: 'abundance', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 72, minDepth: 16, maxDepth: 20 } },
      { id: 'bar_cart', name: 'Bar Cart', dimensions: { width: 30, height: 18 }, defaultQuantity: 0, fengShuiRole: 'social', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 36, minDepth: 16, maxDepth: 20 } }
    ]
  }
];

// Kitchen furniture data (for kitchen-dining combos)
export const kitchenFurniture = [
  {
    category: 'Kitchen Furniture',
    items: [
      { id: 'kitchen_island', name: 'Kitchen Island', dimensions: { width: 48, height: 30 }, defaultQuantity: 0, fengShuiRole: 'nourishment', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 72, minDepth: 24, maxDepth: 48 } },
      { id: 'breakfast_bar', name: 'Breakfast Bar', dimensions: { width: 60, height: 24 }, defaultQuantity: 0, fengShuiRole: 'nourishment', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 72, minDepth: 15, maxDepth: 24 } },
      { id: 'kitchen_cart', name: 'Kitchen Cart', dimensions: { width: 24, height: 18 }, defaultQuantity: 0, fengShuiRole: 'functionality', isResizable: true, dimensionLimits: { minWidth: 20, maxWidth: 30, minDepth: 16, maxDepth: 24 } }
    ]
  }
];

// Storage furniture data
export const storageFurniture = [
  {
    category: 'Storage Solutions',
    items: [
      { id: 'bookcase', name: 'Bookcase', dimensions: { width: 36, height: 12 }, defaultQuantity: 0, fengShuiRole: 'knowledge', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 10, maxDepth: 16 } },
      { id: 'wall_shelves', name: 'Wall Shelves', dimensions: { width: 36, height: 10 }, defaultQuantity: 0, fengShuiRole: 'display', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 60, minDepth: 8, maxDepth: 12 } },
      { id: 'cabinet', name: 'Cabinet', dimensions: { width: 36, height: 18 }, defaultQuantity: 0, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 16, maxDepth: 24 } },
      { id: 'drawer_unit', name: 'Drawer Unit', dimensions: { width: 30, height: 18 }, defaultQuantity: 0, fengShuiRole: 'organization', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 36, minDepth: 16, maxDepth: 24 } },
      { id: 'underbed_storage', name: 'Under-Bed Storage', dimensions: { width: 36, height: 24 }, defaultQuantity: 0, fengShuiRole: 'hidden_storage', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 24, maxDepth: 36 } }
    ]
  }
];

// Pet-friendly furniture data
export const petFurniture = [
  {
    category: 'Pet Furniture',
    items: [
      { id: 'cat_tree', name: 'Cat Tree / Scratching Post', dimensions: { width: 24, height: 24 }, defaultQuantity: 0, fengShuiRole: 'activity', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 36, minDepth: 18, maxDepth: 36 } },
      { id: 'pet_bed', name: 'Dog Bed / Pet Crate', dimensions: { width: 36, height: 24 }, defaultQuantity: 0, fengShuiRole: 'rest', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 18, maxDepth: 36 } },
      { id: 'aquarium', name: 'Fish Tank / Aquarium', dimensions: { width: 36, height: 18 }, defaultQuantity: 0, fengShuiRole: 'water_energy', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 60, minDepth: 12, maxDepth: 24 } },
      { id: 'bird_cage', name: 'Bird Cage / Small Animal Habitat', dimensions: { width: 24, height: 18 }, defaultQuantity: 0, fengShuiRole: 'air_energy', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 36, minDepth: 18, maxDepth: 24 } }
    ]
  }
];

// Hobby furniture data
export const hobbyFurniture = [
  {
    category: 'Music & Art',
    items: [
      { id: 'piano', name: 'Piano/Keyboard', dimensions: { width: 60, height: 24 }, defaultQuantity: 0, fengShuiRole: 'creativity', isResizable: true, dimensionLimits: { minWidth: 48, maxWidth: 72, minDepth: 20, maxDepth: 30 } },
      { id: 'guitar_stand', name: 'Guitar/Instrument Stand', dimensions: { width: 12, height: 12 }, defaultQuantity: 0, fengShuiRole: 'expression', isResizable: false },
      { id: 'easel', name: 'Art Easel', dimensions: { width: 24, height: 24 }, defaultQuantity: 0, fengShuiRole: 'inspiration', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 30, minDepth: 18, maxDepth: 30 } },
      { id: 'crafting_table', name: 'Crafting Table', dimensions: { width: 48, height: 24 }, defaultQuantity: 0, fengShuiRole: 'creativity', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 60, minDepth: 24, maxDepth: 36 } }
    ]
  },
  {
    category: 'Fitness & Wellness',
    items: [
      { id: 'yoga_mat', name: 'Yoga/Exercise Mat', dimensions: { width: 24, height: 72 }, defaultQuantity: 0, fengShuiRole: 'wellness', isResizable: false },
      { id: 'meditation_cushion', name: 'Meditation Cushion', dimensions: { width: 18, height: 18 }, defaultQuantity: 0, fengShuiRole: 'mindfulness', isResizable: false },
      { id: 'treadmill', name: 'Treadmill', dimensions: { width: 36, height: 72 }, defaultQuantity: 0, fengShuiRole: 'movement', isResizable: true, dimensionLimits: { minWidth: 30, maxWidth: 40, minDepth: 60, maxDepth: 80 } },
      { id: 'exercise_bike', name: 'Stationary Bike', dimensions: { width: 24, height: 48 }, defaultQuantity: 0, fengShuiRole: 'movement', isResizable: false }
    ]
  }
];

// Additional furniture and decorations
export const additionalFurniture = [
  {
    category: 'Wellness & Decor',
    items: [
      { id: 'floor_lamp', name: 'Floor Lamp', dimensions: { width: 18, height: 18 }, defaultQuantity: 0, fengShuiRole: 'light', isResizable: false },
      { id: 'table_lamp', name: 'Table Lamp', dimensions: { width: 12, height: 12 }, defaultQuantity: 0, fengShuiRole: 'light', isResizable: false },
      { id: 'plant_large', name: 'Large Plant', dimensions: { width: 24, height: 24 }, defaultQuantity: 0, fengShuiRole: 'life_energy', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 36, minDepth: 18, maxDepth: 36 } },
      { id: 'plant_small', name: 'Small Plant / Shelf', dimensions: { width: 12, height: 12 }, defaultQuantity: 0, fengShuiRole: 'life_energy', isResizable: true, dimensionLimits: { minWidth: 8, maxWidth: 18, minDepth: 8, maxDepth: 18 } },
      { id: 'room_divider', name: 'Room Divider / Screen', dimensions: { width: 60, height: 2 }, defaultQuantity: 0, fengShuiRole: 'separation', isResizable: true, dimensionLimits: { minWidth: 36, maxWidth: 72, minDepth: 1, maxDepth: 3 } }
    ]
  }
];

// Outdoor furniture data
export const outdoorFurniture = [
  {
    category: 'Outdoor Furniture',
    items: [
      { id: 'patio_chair', name: 'Outdoor Chair', dimensions: { width: 24, height: 24 }, defaultQuantity: 0, fengShuiRole: 'relaxation', isResizable: false },
      { id: 'patio_table', name: 'Outdoor Table', dimensions: { width: 36, height: 36 }, defaultQuantity: 0, fengShuiRole: 'gathering', isResizable: true, dimensionLimits: { minWidth: 24, maxWidth: 48, minDepth: 24, maxDepth: 48 } },
      { id: 'hammock', name: 'Hammock', dimensions: { width: 60, height: 24 }, defaultQuantity: 0, fengShuiRole: 'relaxation', isResizable: false },
      { id: 'outdoor_sofa', name: 'Outdoor Sofa/Lounger', dimensions: { width: 72, height: 30 }, defaultQuantity: 0, fengShuiRole: 'comfort', isResizable: true, dimensionLimits: { minWidth: 60, maxWidth: 84, minDepth: 24, maxDepth: 36 } },
      { id: 'planter', name: 'Planter Box', dimensions: { width: 24, height: 12 }, defaultQuantity: 0, fengShuiRole: 'life_energy', isResizable: true, dimensionLimits: { minWidth: 18, maxWidth: 36, minDepth: 10, maxDepth: 18 } }
    ]
  }
];

// Get furniture data by room type
export const getFurnitureByRoomType = (roomType) => {
  switch (roomType) {
    case 'bedroom':
      return [...bedroomFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
    case 'office':
      return [...officeFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
    case 'bedroom_office':
      return [...bedroomFurniture, ...officeFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
    case 'living_room':
      return [...livingRoomFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
    case 'dining_room':
      return [...diningRoomFurniture, ...storageFurniture, ...additionalFurniture];
    case 'kitchen_dining':
      return [...diningRoomFurniture, ...kitchenFurniture, ...storageFurniture, ...additionalFurniture];
    case 'kitchen_dining_living':
      return [...livingRoomFurniture, ...diningRoomFurniture, ...kitchenFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
      case 'studio':
        return [...bedroomFurniture, ...livingRoomFurniture, ...diningRoomFurniture, ...officeFurniture, ...kitchenFurniture, ...storageFurniture, ...hobbyFurniture, ...additionalFurniture];
      default:
        return [];
    }
  };
  
  // Get pet furniture data
  export const getPetFurniture = () => {
    return petFurniture;
  };
  
  // Get outdoor furniture data
  export const getOutdoorFurniture = () => {
    return outdoorFurniture;
  };
  
  // Get purpose options for custom furniture
  export const getPurposeOptions = () => {
    return [
      { value: 'workstation', label: 'Workstation / Desk', fengShuiRole: 'productivity' },
      { value: 'storage', label: 'Storage / Organization', fengShuiRole: 'organization' },
      { value: 'creative', label: 'Creative Space (Art, Music)', fengShuiRole: 'creativity' },
      { value: 'relaxation', label: 'Relaxation / Seating', fengShuiRole: 'comfort' },
      { value: 'fitness', label: 'Fitness / Exercise Equipment', fengShuiRole: 'movement' },
      { value: 'multiuse', label: 'Multi-Purpose', fengShuiRole: 'flexibility' }
    ];
  };
  
  // Get all furniture categories for a complete list
  export const getAllFurnitureCategories = () => {
    return [
      ...bedroomFurniture,
      ...officeFurniture,
      ...livingRoomFurniture,
      ...diningRoomFurniture,
      ...kitchenFurniture,
      ...storageFurniture,
      ...petFurniture,
      ...hobbyFurniture,
      ...additionalFurniture,
      ...outdoorFurniture
    ];
  };