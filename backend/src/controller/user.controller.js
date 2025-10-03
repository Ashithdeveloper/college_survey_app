import User from "../models/user.model.js";
import { configDotenv } from "dotenv";
configDotenv();
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises"; // Use fs.promises for async file operations
import { generateToken } from "../Token/genToken.js";
import { hashPassword , comparePassword } from "../config/passwordencrypt.js";
import { generatequestion } from "./question.controller.js";

// API Key client
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert a local file to a Base64 string for Gemini
async function fileToGenerativePart(filePath, mimeType) {
  try {
    const fileData = await fs.readFile(filePath);
    return {
      inlineData: {
        data: Buffer.from(fileData).toString("base64"),
        mimeType,
      },
    };
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error("Failed to process uploaded file.");
  }
}


// Function to handle user signup
export const signup = async (req, res) => {
  const liveselfie = req.files["liveselfie"]?.[0];
  const idCard = req.files["idCard"]?.[0];

  const cleanUpFiles = async () => {
    if (liveselfie?.path) await fs.unlink(liveselfie.path).catch(() => {});
    if (idCard?.path) await fs.unlink(idCard.path).catch(() => {});
  };

  try {
    const { name, password, collegeId, collegename, email } = req.body;

    console.log("Received Data:", {
      name,
      email,
      collegeId,
      collegename,
      idCardPath: idCard?.path,
      selfiePath: liveselfie?.path,
    });

    // Ensure files are uploaded
    if (!liveselfie || !idCard) {
      return res
        .status(400)
        .json({
          message: "Both ID card and selfie are required.",
          success: false,
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { collegeId }],
    });
    if (existingUser) {
      await cleanUpFiles();
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    // Convert images to Gemini-compatible format
    const liveselfiePart = await fileToGenerativePart(
      liveselfie.path,
      liveselfie.mimetype
    );
    const idCardPart = await fileToGenerativePart(idCard.path, idCard.mimetype);

    // AI verification prompt
    const verificationPrompt = `
You are an identity verification expert. Verify whether the provided text details match the student ID card and the live selfie image.

Check for:
1. Name consistency
2. College ID correctness
3. College name accuracy
4. Face match between ID card photo and live selfie

Details to verify:
- Name: "${name}"
- College ID: "${collegeId}"
- College Name: "${collegename}"

Respond only in valid JSON format:
{
  "verified": true,
  "verifiedDetails": {
    "name": "Matched or Not",
    "collegeId": "Matched or Not",
    "collegeName": "Matched or Not",
    "faceMatch": "Matched or Not"
  }
}

If any mismatch occurs, respond with:
{
  "verified": false,
  "reason": "Explain the exact discrepancy",
  "verifiedDetails": {
    "name": "...",
    "collegeId": "...",
    "collegeName": "...",
    "faceMatch": "..."
  }
}
`;


    // Send multimodal request to Gemini
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: verificationPrompt }, liveselfiePart, idCardPart],
        },
      ],
    });

    const aiResponseText = result.response.text();
    const cleanText = aiResponseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(cleanText);
      console.log("Parsed Output:", parsedOutput);
    } catch (err) {
      console.error("Failed to parse AI response:", cleanText);
      await cleanUpFiles();
      return res
        .status(500)
        .json({ message: "Invalid AI response format", success: false });
    }

    // Verification check
    if (!parsedOutput.verified) {
      await cleanUpFiles();
      return res
        .status(400)
        .json({
          message: parsedOutput.reason || "Verification failed",
          success: false,
        });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      password: hashedPassword,
      collegeId,
      email,
      collegename,
      isVerified: true,
    });
    await user.save();

    // Generate default questions for the college
    await generatequestion(collegename);

    // Cleanup uploaded files
    await cleanUpFiles();

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Student registered and verified successfully",
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error.response?.data || error.message);
    await cleanUpFiles();
    return res
      .status(500)
      .json({ message: "Server error during signup", success: false });
  }
};
export const userLogin = async(req, res) => {
    try {
      const { email, password , name , role } = req.body;
      if(!email || !password || !name || !role){
        return res.status(400).json({message : "All fields are required"});
      }
      const existingUser = await User.findOne({ email });
      if(existingUser){
        return res.status(400).json({message : "User already exists"});
      }
      const hashedPassword = await hashPassword(password);
      const newuser = new User({
        name,
        email,
        password : hashedPassword,
        role
      })
      await newuser.save();
      const token = generateToken(newuser._id);
      return res.status(200).json({message : "User created successfully", token , user : newuser}); 
    } catch (error) {
      console.log(error);
    }
}

export const getme = async(req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    await generatequestion(user.collegename);
    return res
      .status(200)
      .json({ message: "User logged in successfully", token , user});
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};