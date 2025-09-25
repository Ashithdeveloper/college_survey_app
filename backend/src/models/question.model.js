import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  collegename: {
    type: String,
    required: true,
  },
  questions: [
    {
      id: { type: Number, required: true },
      question: { type: String, required: true },
      options: [
        {
          text: { type: String, required: true },
          nextQuestionId: { type: Number }, // optional
        },
      ],
      jump_to: { type: [Number], required: false },
    },
  ],
});

const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;