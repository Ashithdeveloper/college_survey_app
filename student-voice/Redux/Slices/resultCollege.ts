import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ResultState {
    collegename: string;
}   

const initialState: ResultState = {
    collegename: "",
};

const resultCollegeSlice = createSlice({
    name: "resultCollege",
    initialState,
    reducers: {
        setResultCollege: (state, action: PayloadAction<string>) => {
            state.collegename = action.payload;
        },
    },
});

export const { setResultCollege } = resultCollegeSlice.actions;
export default resultCollegeSlice.reducer;