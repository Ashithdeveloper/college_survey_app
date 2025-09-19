import mongoose from "mongoose";

const answerschema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collegename: {
    type: String,
    required: true,
  },
  answers: [
    {
      id: { type: Number, required: true }, // ID of the question
      answer: { type: String, required: true }, // The user’s answer (string)
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set when a document is created
  },
});

const Answer = mongoose.models.Answer || mongoose.model("Answer", answerschema);

export default Answer;
