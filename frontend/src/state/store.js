import { create } from 'zustand';
import { floorPlanSlice } from './slices/floorPlanSlice';
import { elementsSlice } from './slices/elementsSlice';

const useStore = create((set, get) => ({
  ...floorPlanSlice(set, get),
  ...elementsSlice(set, get),
}));

export default useStore;