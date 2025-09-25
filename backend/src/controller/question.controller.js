import Question from "../models/question.model.js";
import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.model.js";
import Answer from "../models/answersave.js";
configDotenv();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatequestion = async (collegename) => {
  try {
    if (!collegename) throw new Error("Please enter collegename");

    const existing = await Question.findOne({ collegename });
    if (existing)
      throw new Error("Questions already generated for this college");

    const verificationPrompt = `Please provide questions related to a specified college ${collegename} if and only if the college is known give its appropriate questions otherwise give random questions. Conditions for the questions are:
      1. Questions should be in the format of questions and options; the last question should allow sharing their own feelings.
      2. Questions must be in JSON format and jumps should be handled according to answers.
      3. Questions must cover mental health, skill-development support, placements, training, and skill-based support regarding their college.`;

    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
    });

    const aiResponseText = result.response.text();
    console.log("AI raw response:", aiResponseText);

    const firstBrace = aiResponseText.indexOf("{");
    const lastBrace = aiResponseText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1)
      throw new Error("AI did not return valid JSON");

    let jsonString = aiResponseText.slice(firstBrace, lastBrace + 1).trim();
    jsonString = jsonString.replace(/\/\/.*$/gm, "").trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      throw new Error("Failed to parse AI response as JSON");
    }

const questionsArray = parsedJSON.questions.map((q, index) => ({
  id: index + 1,
  question: q.question || q.text, // fallback if AI used 'text'
  options:
    Array.isArray(q.options) && q.options.length
      ? q.options.map((opt) => ({
          text: opt.text,
          nextQuestionId: typeof opt.next === "number" ? opt.next : null,
        }))
      : [{ text: "Other (please specify)", nextQuestionId: null }],
  jump_to: [],
}));
    console.log("Transformed questions array:", questionsArray);

    const questionDoc = new Question({
      collegename,
      questions: questionsArray,
    });

    await questionDoc.save();
    console.log("Questions saved successfully!");

    return { success: true, message: "Questions generated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
export const getallCollege = async (req, res) => {
  try {
    const colleges = await Question.find();
    const collegeNames = colleges.map((c) => c.collegename); // extract the names
    return res.status(200).json(collegeNames);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getquestion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const collegename = user.collegename;
    const question = await Question.findOne({ collegename });

    if (!question) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Questions not found for this college",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Questions fetched successfully",
        question,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Save survey answers
export const saveAnswer = async (req, res) => {
  try {
    const { collegename, answers } = req.body;
    const userId = req.user.id; // from auth middleware
    console.log(req.body);

    // Validate inputs
    if (
      !collegename ||
      !answers ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    // student can only submit answers once every 6 months
     const lastAnswer = await Answer.findOne({ userId, collegename }).sort({
       createdAt: -1,
     });
     if (lastAnswer) {
       const sixMonthsAgo = new Date();
       sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

       if (lastAnswer.createdAt > sixMonthsAgo) {
         return res.status(200).json({
           success: true,
           message: "You can only submit answers once every 6 months.",
         });
       }
     }

    const newAnswer = new Answer({
      userId,
      collegename,
      answers,
    });

    await newAnswer.save();

    return res
      .status(200)
      .json({ success: true, message: "Answer saved successfully." });
  } catch (error) {
    console.error("Save Answer Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};



export const getresult = async (req, res) => {
  try {
    const { collegename } = req.params;
    console.log(req.params);

    const allAnswers = await Answer.find({ collegename });
    if (!allAnswers) {
      return res.status(404).json({
        success: false,
        message: "No feedback found in the database",
      });
    }

    if (allAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No answers found in the database",
      });
    }

    // Prepare answers text for AI input
    const answersText = allAnswers
      .map((ans, index) => {
        return `Student ${index + 1} from "${
          ans.collegename
        }": ${JSON.stringify(ans.answers)}`;
      })
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
        "overall explanation": string,
      }
    `;

    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
    });

    const aiResponseText = result.response.text();
    console.log("AI Raw Response:", aiResponseText);

    // Extract JSON from AI response safely
    const firstBrace = aiResponseText.indexOf("{");
    const lastBrace = aiResponseText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(400).json({
        success: false,
        message: "AI did not return a valid JSON format",
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

    return res.status(200).json({
      success: true,
      message: "Ratings generated successfully",
      ratings,
    });
  } catch (error) {
    console.error("Get Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
