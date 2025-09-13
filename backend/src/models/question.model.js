import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  collegename: {
    type: String,
    required: true,
  },
  questions: {
    id: { type: Number, required: true },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    nextQuestionId: { type: mongoose.Mixed, default: {} },
  },
});

const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;