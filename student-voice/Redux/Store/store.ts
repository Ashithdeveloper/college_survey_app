import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice";
import questionSlice from "../Slices/questionSlice";
import resultCollegeReducer from "../Slices/resultCollege";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ques: questionSlice,
    resultCollege: resultCollegeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;