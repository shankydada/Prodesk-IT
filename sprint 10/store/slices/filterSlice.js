import { createSlice } from "@reduxjs/toolkit";
import { MAX_PRICE } from "../../data/products";

// --- Phase 2: Global Filter State ---
// Sidebar writes into this slice; the product grid reads from it.
// Because both live off the same store, any dispatch here re-renders
// the grid instantly with no prop drilling between them.

const initialState = {
  category: "All",
  maxPrice: MAX_PRICE,
  search: "",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = Number(action.payload);
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setCategory, setMaxPrice, setSearch, resetFilters } =
  filterSlice.actions;

export const selectFilters = (state) => state.filters;

export default filterSlice.reducer;
