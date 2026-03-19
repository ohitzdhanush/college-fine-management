// lib/store.ts
import authReducer from "@/redux/slices/authSlice"; // adjust path
import usersReducer from "@/redux/slices/usersSlice"; // adjust path
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import finesReducer from "@/redux/slices/finesSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: usersReducer,
  fines: finesReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // reducers to persist
  // blacklist: ["someTransientReducer"], // reducers you DON'T want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions are non-serializable; ignore them
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// create persistor (client-only usage)
export const persistor = persistStore(store);
