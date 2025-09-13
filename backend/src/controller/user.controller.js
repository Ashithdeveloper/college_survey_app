import User from "../models/user.model.js";
import { configDotenv } from "dotenv";
configDotenv();
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises"; // Use fs.promises for async file operations
import { generateToken } from "../Token/genToken.js";
import { hashPassword } from "../config/passwordencrypt.js";

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
    const { name, password, collegeId, collegename , email  } = req.body;
    const imageFile = req.file; // Multer's upload.single("file") populates req.file
    console.log("Received Data:", {
      name,
      collegeId,
      collegename,
      imageFile: imageFile?.path,
    });
     
    //if user login
    if (email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ message: "User already exists",token ,success: false });
      }
    }
     

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
      
      The image contains a student ID card.
      
      Respond with a JSON object. If all details match, {"verified": true}. If there's any inconsistency, {"verified": false, "reason": "Explain the discrepancy. "also return what verifyed details like name , collegeId, collegename"}.
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
      console.log("Parsed Output:", parsedOutput);
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
    //password hashing
    const hashedPassword = await hashPassword(password);

    // Create and save the user if verification is successful
    const user = new User({
      name,
      password : hashedPassword, 
      collegeId,
      collegename,
      isVerified: true,
    });
    await user.save();

    // Clean up the temporary uploaded file
    await fs.unlink(imageFile.path);
    //create token
    const token = generateToken(user._id);
    return res.status(201).json({
      message: "student registered and verified successfully",
      success: true,
      token,
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
      return res.status(200).json({message : "User created successfully", token}); 
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

