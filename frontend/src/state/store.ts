// frontend/src/state/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';

export const store = configureStore({
  reducer: {
    // Add the generated reducer
    [api.reducerPath]: api.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});