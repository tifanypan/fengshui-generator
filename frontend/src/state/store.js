// src/state/store.js
import { create } from 'zustand';
import { floorPlanSlice } from './slices/floorPlanSlice';
import { highlightSlice } from './slices/highlightSlice';
import { furnitureSlice } from './slices/furnitureSlice';
import { paymentSlice } from './slices/paymentSlice';

const useStore = create((set, get) => ({
  ...floorPlanSlice(set, get),
  ...highlightSlice(set, get),
  ...furnitureSlice(set, get),
  ...paymentSlice(set, get),
}));

export default useStore;