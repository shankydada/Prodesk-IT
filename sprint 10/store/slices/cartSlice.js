import { createSlice } from "@reduxjs/toolkit";

// --- Phase 1: Slice Migration ---
// This slice replaces the old React Context "CartContext" + useReducer setup.
// Every mutation now happens through a standard dispatch(action), which is
// what shows up as discrete, inspectable entries in Redux DevTools.

const initialState = {
  items: [], // { id, name, price, emoji, qty }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...product, qty: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    incrementQty: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.qty += 1;
    },
    decrementQty: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, incrementQty, decrementQty, clearCart } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.qty * item.price, 0);

export default cartSlice.reducer;
