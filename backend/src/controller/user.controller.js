import User from "../models/user.model.js";
import { configDotenv } from "dotenv";
configDotenv();
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises"; // Use fs.promises for async file operations

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

export const signup = async (req, res) => {
  try {
    const { name, password, collegeId, collegename } = req.body;
    const imageFile = req.file; // Multer's upload.single("file") populates req.file
    console.log("Received Data:", {
      name,
      collegeId,
      collegename,
      imageFile: imageFile?.path,
    });

    // Ensure an image file was uploaded
    if (!imageFile) {
      return res
        .status(400)
        .json({ message: "Image upload is required.", success: false });
    }

    // Check if user already exists
    const existing = await User.findOne({ collegeId });
    if (existing) {
      await fs.unlink(imageFile.path); // Clean up the temp file
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    // Convert the uploaded image file to a Gemini-compatible format
    const imagePart = await fileToGenerativePart(
      imageFile.path,
      imageFile.mimetype
    );

    // Prompt for both text and vision verification
    const verificationPrompt = `
      You are a verification expert. Your task is to check if the details provided in the text match the information on the student ID card in the image.
      Details to verify:
      Name: "${name}"
      College ID: "${collegeId}"
      College Name: "${collegename}"
      
      Respond with a JSON object. If all details match, {"verified": true}. If there's any inconsistency, {"verified": false, "reason": "Explain the discrepancy."}.
    `;

    // Send the multimodal request (text and image) to Gemini 1.5 Flash
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: verificationPrompt }, imagePart],
        },
      ],
    });

    // Clean and parse the AI's JSON response
    const aiResponseText = result.response.text();
    const cleanText = aiResponseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(cleanText);
    } catch (err) {
      console.error("Failed to parse AI response:", cleanText);
      await fs.unlink(imageFile.path); // Clean up temp file
      return res
        .status(500)
        .json({ message: "Invalid AI response format", success: false });
    }

    // Check the verification result from Gemini
    if (!parsedOutput.verified) {
      await fs.unlink(imageFile.path); // Clean up temp file
      return res.status(400).json({
        message: "Data verification failed",
        success: false,
        reason: parsedOutput.reason || "Unknown reason.",
      });
    }

    // Create and save the user if verification is successful
    const user = new User({
      name,
      password, // Your pre-save hook will hash this
      collegeId,
      collegename,
      isVerified: true,
    });
    await user.save();

    // Clean up the temporary uploaded file
    await fs.unlink(imageFile.path);

    return res.status(201).json({
      message: "User registered and verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error.response?.data || error.message);
    // Ensure the temporary file is deleted even on error
    if (req.file) {
      await fs
        .unlink(req.file.path)
        .catch((err) => console.error("Failed to delete temp file:", err));
    }
    return res
      .status(500)
      .json({ message: "Server error during signup", success: false });
  }
};
