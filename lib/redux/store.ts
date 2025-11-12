import { configureStore } from "@reduxjs/toolkit";
import { facturlyApi } from "@/services/facturlyApi";

export const store = configureStore({
  reducer: {
    [facturlyApi.reducerPath]: facturlyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(facturlyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
