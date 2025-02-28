export const elementsSlice = (set, get) => ({
    elements: {
      items: [],
      selected: null,
    },
    
    addElement: (element) => set((state) => ({
      elements: {
        ...state.elements,
        items: [...state.elements.items, element],
      },
    })),
    
    updateElement: (id, updates) => set((state) => ({
      elements: {
        ...state.elements,
        items: state.elements.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    })),
    
    removeElement: (id) => set((state) => ({
      elements: {
        ...state.elements,
        items: state.elements.items.filter(item => item.id !== id),
        selected: state.elements.selected === id ? null : state.elements.selected,
      },
    })),
    
    selectElement: (id) => set((state) => ({
      elements: {
        ...state.elements,
        selected: id,
      },
    })),
    
    deselectElement: () => set((state) => ({
      elements: {
        ...state.elements,
        selected: null,
      },
    })),
  });