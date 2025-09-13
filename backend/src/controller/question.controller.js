import Question from "../models/question.model.js";
import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.model.js";
import Answer from "../models/answersave.js";
configDotenv();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate survey questions for a given college
 */
export const generatequestion = async (collegename) => {
  try {
    if (!collegename) throw new Error("Please enter collegename");

    const normalizedCollegeName = collegename.trim().toLowerCase();

    const existing = await Question.findOne({ collegename: normalizedCollegeName });
    if (existing)
      throw new Error("Questions already generated for this college");

    const verificationPrompt = `Please provide questions related to a specified college ${collegename} if and only if the college is known give its appropriate questions otherwise give random questions. Conditions for the questions are:
      1. The questions should be in the format of questions and options rather than the last question should be the answer by themselves and the last question be sharing their own feelings.
      2. The questions must be given in the format of JSON and if a question is answered then the next question will be related to the answer of the question answered specifically that if a question is answered it will jump to its related question which will answer the previous question ("Notice the questions must be of jumped that means it must move from one place to another question. Eg: If first question is answered as option 2 then the question related to the options will be in the fourth question it will skip the second and third question.").
      3. The question must take the survey of their mental feelings (or) situations, their skill-development supports, placements percentage and their training systematics and skill based support regarding to their college.`;

    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
    });

    let aiResponseText = result.response.text();
    console.log("AI raw response:", aiResponseText);

    // Strip markdown fences if present
    aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();

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

    // Transform questions to match schema
    const questionsArray = (parsedJSON.questions || []).map((q, index) => ({
      id: index + 1,
      question: q.question?.trim() || `Question ${index + 1}`,
      options: Array.isArray(q.options) && q.options.length ? q.options : ["Option 1"],
      jump_to: Array.isArray(q.jump_to) ? q.jump_to : [],
    }));

    console.log("Transformed questions array:", questionsArray);

    const questionDoc = new Question({
      collegename: normalizedCollegeName,
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

/**
 * Get questions for the current user's college
 */
export const getquestion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const collegename = user.collegename.trim().toLowerCase();
    const question = await Question.findOne({ collegename });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Questions not found for this college",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      question,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const saveanswer = async (req, res) => {
  try {
    const { answers, collegename } = req.body;
    if (!answers || !collegename) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "Answers must be a non-empty array" });
    }

    const normalizedCollegeName = collegename.trim().toLowerCase();
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const question = await Question.findOne({ collegename: normalizedCollegeName });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this college",
      });
    }

    const lastAnswer = await Answer.findOne({
      userId: user._id,
      collegename: normalizedCollegeName,
    }).sort({ createdAt: -1 });

    if (lastAnswer) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastAnswer.createdAt > sixMonthsAgo) {
        return res.status(400).json({
          success: false,
          message: "You can only answer again after 6 months",
        });
      }
    }

    // Validate each answer
    for (const ans of answers) {
      if (typeof ans.id !== "number" || typeof ans.answer !== "string") {
        return res.status(400).json({
          success: false,
          message: 'Each answer must have an "id" (number) and "answer" (string)',
        });
      }
    }

    const newAnswer = new Answer({
      userId: user._id, 
      collegename: normalizedCollegeName,
      answers,
    });

    console.log("Saving Answer:", newAnswer);
    await newAnswer.save();

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
    });
  } catch (error) {
    console.error("Save Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getresult = async (req, res) => {
  try {
    const allAnswers = await Answer.find();
    if (allAnswers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No answers found in the database",
      });
    }

    // Prepare answers text for AI input
    const answersText = allAnswers
      .map((ans, index) => {
        return `Student ${index + 1} from "${ans.collegename}": ${JSON.stringify(ans.answers)}`;
      })
      .join("\n");

    const verificationPrompt = `
According to the selected options for the questions, give a rating (out of 0 to 100) for the following sub-bases of the student: mental health, placement training, skill training.

Here are the collected student answers:
${answersText}

Provide the output as JSON in the following format:
{
  "mental_health": number,
  "placement_training": number,
  "skill_training": number
}
`;

    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: verificationPrompt }] }],
    });

    let aiResponseText = result.response.text();
    console.log("AI Raw Response:", aiResponseText);

    aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();

    const firstBrace = aiResponseText.indexOf("{");
    const lastBrace = aiResponseText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("AI did not return valid JSON format");
    }

    const jsonString = aiResponseText.slice(firstBrace, lastBrace + 1).trim();
    const ratings = JSON.parse(jsonString);

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
