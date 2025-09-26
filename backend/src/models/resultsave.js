import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  collegename: {
    type: String,
    required: true,
  },
  results: [
    {
      mental_health: {
        type: Number,
        required: true,
      },
      placement_training: {
        type: Number,
        required: true,
      },
      skill_training: {
        type: Number,
        required: true,
      },
      total_score_college: {
        type: Number,
        required: true,
      },
    },
  ],
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Result", resultSchema);
