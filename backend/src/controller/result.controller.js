import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.model.js";
import Answer from "../models/answersave.js";
import resultsave from "../models/resultsave.js";
// import saveResult from "./result.controller.js";
configDotenv();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getresult = async (collegename , userId) => {
  try {
    // 1️⃣ Guard: collegename required
    if (!collegename) {
      return res.status(400).json({
        success: false,
        message: "College name is required in the URL",
      });
    }

    console.log("Selected college:", collegename);
    console.log("User ID:", userId);

    // 2️⃣ Fetch answers from DB
    const allAnswers = await Answer.find({ collegename });
    console.log("Fetched answers from DB:", allAnswers);
    if (!allAnswers || allAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No answers found in the database for this college",
      });
    }

    // 3️⃣ Prepare answers for AI prompt
    const answersText = allAnswers
      .map(
        (ans, index) =>
          `Student ${index + 1} from "${ans.collegename}": ${JSON.stringify(
            ans.answers
          )}`
      )
      .join("\n");

    const verificationPrompt = `
      According to the selected options for the questions, give a rating (0–100) for these categories:
      - mental health
      - placement training
      - skill training

      Here are the collected student answers:
      ${answersText}

      Provide the output as valid JSON in this format only:
      {
        "mental_health": number,
        "placement_training": number,
        "skill_training": number,
        "total_score_college": number,
        "overall_explanation": string
      }
    `;

    // 4️⃣ Call Google Generative AI
    let aiResponseText;
    try {
      const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
      });
      aiResponseText = result.response.text();
      console.log("AI Raw Response:", aiResponseText);
    } catch (aiErr) {
      console.error("AI Fetch Error:", aiErr);
      return res.status(500).json({
        success: false,
        message: "Error fetching AI result",
        error: aiErr.message,
      });
    }

    // 5️⃣ Extract JSON safely
    const firstBrace = aiResponseText.indexOf("{");
    const lastBrace = aiResponseText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(400).json({
        success: false,
        message: "AI did not return a valid JSON",
        raw: aiResponseText,
      });
    }

    let ratings;
    try {
      const jsonString = aiResponseText.slice(firstBrace, lastBrace + 1).trim();
      ratings = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr.message);
      return res.status(400).json({
        success: false,
        message: "Failed to parse AI response as JSON",
        raw: aiResponseText,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const existing = await resultsave.findOne({ collegename });
    // 5️⃣ Save to DB
    
   if (existing) {
     // ✅ Update the single results object
     existing.results = {
       mental_health: ratings.mental_health,
       placement_training: ratings.placement_training,
       skill_training: ratings.skill_training,
       total_score_college: ratings.total_score_college,
       overall_explanation: ratings.overall_explanation,
     };

     // ✅ Add the student if not already included
     if (!existing.student.includes(userId)) {
       existing.student.push(userId);
     }

     await existing.save();
   } else {
     // ✅ Create a new result document for this college
     await resultsave.create({
       collegename,
       results: {
         mental_health: ratings.mental_health,
         placement_training: ratings.placement_training,
         skill_training: ratings.skill_training,
         total_score_college: ratings.total_score_college,
         overall_explanation: ratings.overall_explanation,
       },
       student: [userId],
     });
   }
    // 6️⃣ Return result
    return console.log("Ratings:", ratings);
    // await saveResult( ratings.mental_health, ratings.placement_training, ratings.skill_training, ratings.total_score_college, collegename, req.user.id);
  } catch (error) {
    console.error("Get Result Error:", error);
    return console.error(error);
  }
};

export const getCollegeResult = async (req, res) => {
    try {
        const { collegename } = req.params;
        console.log(collegename);
        const result = await resultsave.findOne({ collegename });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Results not found for this college",
            });
        }
        console.log(result);
        return res.status(200).json({
            success: true,
            message: "Results fetched successfully",
            result,
        });
    } catch (error) {
        console.log(error);
    }
};