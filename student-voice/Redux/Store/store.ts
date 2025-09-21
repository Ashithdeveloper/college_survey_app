import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice";
import questionSlice from "../Slices/questionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ques : questionSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;