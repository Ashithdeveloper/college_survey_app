import mongoose from "mongoose";

const mentorChartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  advice :{
    type: String,
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
  },
  learningPlan: { type: Array, default: [] },
  youtubeLinks: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorChartSchema);

export default Mentor;
