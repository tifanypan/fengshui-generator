
import { create } from 'zustand';
import { floorPlanSlice } from './slices/floorPlanSlice';
import { highlightSlice } from './slices/highlightSlice';

const useStore = create((set, get) => ({
  ...floorPlanSlice(set, get),
  ...highlightSlice(set, get),
}));

export default useStore;