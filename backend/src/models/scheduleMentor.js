import mongoose from "mongoose";

const learningDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  learningGoal: { type: String, required: true },
  details: { type: String, required: true },
  resources: [{ type: String }],
});

const learningScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: { type: String, required: true },
    totalDays: { type: Number },
    schedule: [learningDaySchema], // array of day-wise plans
    advice: { type: String },
    aiResponse: { type: String }, // raw Gemini output
  },
  { timestamps: true }
);

export default mongoose.model("LearningSchedule", learningScheduleSchema);
