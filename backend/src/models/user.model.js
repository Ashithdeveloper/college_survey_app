import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String,  unique: true }, // Used for login
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ["student", "viewer"], default: "student" },
  collegeId: { type: String }, // College unique identifier
  collegename: { type: String },
  isVerified: { type: Boolean, default: false }, // Verified after Gemini API check
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
