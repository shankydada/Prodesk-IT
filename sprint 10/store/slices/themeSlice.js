import { createSlice } from "@reduxjs/toolkit";

// --- Phase 3: Global Theming ---
// Dark/light mode is owned entirely by the store, not component state,
// so any component in the tree can read or flip it without prop drilling.

const initialState = {
  mode: "light", // "light" | "dark"
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.mode;

export default themeSlice.reducer;
