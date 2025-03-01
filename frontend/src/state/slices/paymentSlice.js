// src/state/slices/paymentSlice.js
export const paymentSlice = (set, get) => ({
    payment: {
      baseLayout: true, // Always true
      lifeGoalOptimization: false,
      editProtection: false,
      lifeGoal: null, // 'career', 'wealth', 'health', 'relationships'
      completed: false,
    },
    
    setPaymentOption: (option, value) => set((state) => ({
      payment: {
        ...state.payment,
        [option]: value,
      },
    })),
    
    setLifeGoal: (goal) => set((state) => ({
      payment: {
        ...state.payment,
        lifeGoal: goal,
      },
    })),
    
    setPaymentCompleted: (status) => set((state) => ({
      payment: {
        ...state.payment,
        completed: status,
      },
    })),
  });