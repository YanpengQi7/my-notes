import { configureStore } from '@reduxjs/toolkit';
import templatesReducer from './templatesSlice';

export const store = configureStore({
  reducer: {
    templates: templatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 