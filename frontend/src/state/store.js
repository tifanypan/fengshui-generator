// import { create } from 'zustand';
// import { floorPlanSlice } from './slices/floorPlanSlice';
// import { elementsSlice } from './slices/elementsSlice';

// const useStore = create((set, get) => ({
//   ...floorPlanSlice(set, get),
//   ...elementsSlice(set, get),
// }));

// export default useStore;

// src/state/store.js
import { create } from 'zustand';
import { floorPlanSlice } from './slices/floorPlanSlice';
import { highlightSlice } from './slices/highlightSlice';

const useStore = create((set, get) => ({
  ...floorPlanSlice(set, get),
  ...highlightSlice(set, get),
}));

export default useStore;