import Question from "../models/question.model.js";
import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.model.js";
import Answer from "../models/answersave.js";
// import saveResult from "./result.controller.js";
configDotenv();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const generatequestion = async (collegename) => {
  try {
    if (!collegename) throw new Error("Please enter collegename");

    // Check if questions already exist
    const existing = await Question.findOne({ collegename });
    if (existing)
      throw new Error("Questions already generated for this college");

    // AI prompt
    const verificationPrompt = `Please generate a questionnaire for the college ${collegename}. 
Output must be strictly in valid JSON format as an array of objects. 
Each question object should have the following structure:

{
  "id": <number>,
  "question": "<question text>",
  "type": "<question type: 'multiple_choice' or 'open_ended'>",
  "options": [
    {
      "text": "<option text>",
      "nextQuestionId": <number or null>
    },
    ...
  ]
}

Requirements:
1. Include multiple-choice questions covering mental health, skill-development support, placements, training, and skill-based support.
2. The last question should be an open-ended question allowing students to provide feedback; for this question, "options" can be an empty array if that is typing for user then give option 1 or enpty and maximum of 20 questions need.    .
3. Ensure all options are objects with a "text" field, not plain strings.
4. Use sequential IDs starting from 1 for questions, and proper nextQuestionId values for each option (or null for open-ended question).
5. Return ONLY valid JSON (no extra text, explanations, or comments).`;


    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
    });

    const aiResponseText = result.response.text();
    console.log("AI raw response:", aiResponseText);

    // Detect first [ or { to handle arrays or objects
    const firstBracket = aiResponseText.indexOf("[");
    const lastBracket = aiResponseText.lastIndexOf("]");
    const firstBrace = aiResponseText.indexOf("{");
    const lastBrace = aiResponseText.lastIndexOf("}");

    let jsonString;

    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = aiResponseText.slice(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = aiResponseText.slice(firstBrace, lastBrace + 1);
    } else {
      throw new Error("AI did not return valid JSON");
    }

    // Remove comments and trim
    jsonString = jsonString.replace(/\/\/.*$/gm, "").trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Handle both array and object with "questions" field
    const questionsRaw = Array.isArray(parsedJSON)
      ? parsedJSON
      : parsedJSON.questions;

    if (!questionsRaw || !questionsRaw.length) {
      throw new Error("Parsed JSON contains no questions");
    }

    // Transform AI response to your schema
    const questionsArray = questionsRaw.map((q, index) => ({
      id: index + 1,
      question: q.text || q.question || `Question ${index + 1}`,
      options:
        Array.isArray(q.options) && q.options.length
          ? q.options.map((opt) => ({
              text: typeof opt === "string" ? opt : opt.text || "Option",
              nextQuestionId: typeof opt.next === "number" ? opt.next : null,
            }))
          : [],
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
export const listModels = async () => {
  try {
    const { models } = await genai.listModels();
    console.log("Available models:");
    for (const model of models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
};


export const getresult = async (req, res) => {
  try {
    const { collegename } = req.params;
    listModels();

    // 1️⃣ Guard: collegename required
    if (!collegename) {
      return res.status(400).json({
        success: false,
        message: "College name is required in the URL",
      });
    }

    console.log("Selected college:", collegename);
    

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
        "overall explanation": string
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

    // 6️⃣ Return result
    return res.status(200).json({
      success: true,
      message: "Ratings generated successfully",
      ratings,
    });
    // await saveResult( ratings.mental_health, ratings.placement_training, ratings.skill_training, ratings.total_score_college, collegename, req.user.id);
  } catch (error) {
    console.error("Get Result Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};