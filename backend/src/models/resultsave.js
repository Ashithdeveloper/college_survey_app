import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    collegename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    results: {
      mental_health: {
        type: Number,
        required: true,
        min: 0,
      },
      placement_training: {
        type: Number,
        required: true,
        min: 0,
      },
      skill_training: {
        type: Number,
        required: true,
        min: 0,
      },
      total_score_college: {
        type: Number,
        required: true,
        min: 0,
      },
      overall_explanation: { type: String, required: false }, // optional
    },
    student: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Result", resultSchema);
