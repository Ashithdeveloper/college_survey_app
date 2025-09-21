import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuestionOption {
  id: number;
  question: string;
  options: string[];
  jump_to: any[];
  _id: string;
}

interface QuestionData {
  _id: string;
  collegename: string;
  questions: QuestionOption[];
  __v: number;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface QuestionState {
  question: QuestionData | null;
  answers: Answer[]; // store selected answers
}

const initialState: QuestionState = {
  question: null,
  answers: [],
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQuestion: (state, action: PayloadAction<QuestionData>) => {
      state.question = action.payload;
      state.answers = []; // reset answers when new question is set
    },
    setAnswer: (state, action: PayloadAction<Answer>) => {
      // remove previous answer for same question if exists
      state.answers = state.answers.filter(
        (a) => a.questionId !== action.payload.questionId
      );
      state.answers.push(action.payload);
    },
  },
});

export const { setQuestion, setAnswer } = questionSlice.actions;
export default questionSlice.reducer;
