import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../config/TypeConfig";


interface AuthState {
  user: User | null;
}


const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getUserDetails: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
        },
        removeUserDetails: (state) => {
            state.user = null
        }
    },
});

export const { getUserDetails , removeUserDetails } = authSlice.actions;
export default authSlice.reducer;