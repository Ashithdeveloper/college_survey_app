import { create } from "zustand";

interface QuestionData {
  collegename: string;
  questions: {
    question: string;
    options?: { text: string }[];
  }[];
}

interface QuestionState {
  question: QuestionData | null;
  collegename: string | null; // ✅ added to interface
  setQuestion: (question: QuestionData) => void;
  setCollege: (collegename: string) => void;
  clearQuestion: () => void;
}

const useQuestionStore = create<QuestionState>((set) => ({
  question: null,
  collegename: null, // ✅ default value
  setQuestion: (question) => set({ question }),
  setCollege: (collegename) => set({ collegename }),
  clearQuestion: () => set({ question: null, collegename: null }), // ✅ clears both
}));

export default useQuestionStore;
