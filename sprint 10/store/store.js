import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage adapter

import cartReducer from "./slices/cartSlice";
import filterReducer from "./slices/filterSlice";
import themeReducer from "./slices/themeSlice";

// --- Phase 1: Store Architecture ---
const rootReducer = combineReducers({
  cart: cartReducer,
  filters: filterReducer,
  theme: themeReducer,
});

// FAQ #4: "My global state disappears on browser refresh."
// Fix: wrap the root reducer with redux-persist so cart + theme survive
// a hard reload. Filters intentionally are NOT persisted -- a fresh
// visit should start unfiltered.
const persistConfig = {
  key: "sprint10-root",
  storage,
  whitelist: ["cart", "theme"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

export const store = makeStore();
export const persistor = persistStore(store);
