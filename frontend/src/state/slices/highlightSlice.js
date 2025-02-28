// src/state/slices/highlightSlice.js
export const highlightSlice = (set, get) => ({
    highlights: {
      items: [], // Will contain highlight objects with paths, types, etc.
      activeType: 'wall', // Current highlighting tool: wall, door, window, closet, column, etc.
      history: [], // For undo/redo
      historyIndex: -1, // Current position in history
      selected: null, // Currently selected highlight
    },
    
    setActiveHighlightType: (type) => set((state) => ({
      highlights: {
        ...state.highlights,
        activeType: type,
      },
    })),
    
    addHighlight: (highlight) => {
      const state = get();
      const newItems = [...state.highlights.items, highlight];
      const newHistory = state.highlights.history.slice(0, state.highlights.historyIndex + 1);
      
      set((state) => ({
        highlights: {
          ...state.highlights,
          items: newItems,
          history: [...newHistory, newItems],
          historyIndex: newHistory.length,
          selected: highlight.id,
        },
      }));
    },
    
    updateHighlight: (id, updates) => {
      const state = get();
      const newItems = state.highlights.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      const newHistory = state.highlights.history.slice(0, state.highlights.historyIndex + 1);
      
      set((state) => ({
        highlights: {
          ...state.highlights,
          items: newItems,
          history: [...newHistory, newItems],
          historyIndex: newHistory.length,
        },
      }));
    },
    
    removeHighlight: (id) => {
      const state = get();
      const newItems = state.highlights.items.filter(item => item.id !== id);
      const newHistory = state.highlights.history.slice(0, state.highlights.historyIndex + 1);
      
      set((state) => ({
        highlights: {
          ...state.highlights,
          items: newItems,
          history: [...newHistory, newItems],
          historyIndex: newHistory.length,
          selected: state.highlights.selected === id ? null : state.highlights.selected,
        },
      }));
    },
    
    selectHighlight: (id) => set((state) => ({
      highlights: {
        ...state.highlights,
        selected: id,
      },
    })),
    
    deselectHighlight: () => set((state) => ({
      highlights: {
        ...state.highlights,
        selected: null,
      },
    })),
    
    undo: () => {
      const state = get();
      if (state.highlights.historyIndex > 0) {
        const newIndex = state.highlights.historyIndex - 1;
        set((state) => ({
          highlights: {
            ...state.highlights,
            items: state.highlights.history[newIndex],
            historyIndex: newIndex,
            selected: null,
          },
        }));
      }
    },
    
    redo: () => {
      const state = get();
      if (state.highlights.historyIndex < state.highlights.history.length - 1) {
        const newIndex = state.highlights.historyIndex + 1;
        set((state) => ({
          highlights: {
            ...state.highlights,
            items: state.highlights.history[newIndex],
            historyIndex: newIndex,
            selected: null,
          },
        }));
      }
    },
    
    // Initialize history with empty state
    initHighlightHistory: () => set((state) => ({
      highlights: {
        ...state.highlights,
        history: [[]],
        historyIndex: 0,
      },
    })),
    
    clearHighlights: () => {
      const state = get();
      const newHistory = state.highlights.history.slice(0, state.highlights.historyIndex + 1);
      
      set((state) => ({
        highlights: {
          ...state.highlights,
          items: [],
          history: [...newHistory, []],
          historyIndex: newHistory.length,
          selected: null,
        },
      }));
    },
  });