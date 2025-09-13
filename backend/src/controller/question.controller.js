import Question from "../models/question.model.js";
import { configDotenv } from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
configDotenv();

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generatequestion = async (collegename) => {
  try {
    if (!collegename) throw new Error("Please enter collegename");

    const existing = await Question.findOne({ collegename });
    if (existing)
      throw new Error("Questions already generated for this college");

    const verificationPrompt = `Please provide questions related to a specified college ${collegename} if and only if the college is known give its appropriate questions otherwise give random questions. Conditons for the questions are 
        1. The questions should be in the format of questions and options rater than the last question should be the answer by themselves and the last question be sharing their own feelings.
        2. This questions must be given in the format of json and if a question is answered then the next question will be related to the answer of the question answered specifically that if a question is answered it will jump to its related question which will answer the previous question("Notice the questions must be of jumped that means it must move from one place to another question. Eg: If first question is answered as option 2 then the question related to the options will be in the fourth question it will skip the second and third question.").
        3. The question must take the survey of their mental feelings (or) situations, their skill-development supports, placements percentage and their training systematics and skill based support regarding to their college`;

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

    // Transform questions to match schema
    const questionsArray = (parsedJSON.questions || []).map((q, index) => ({
      id: index + 1, // Assign a unique ID
      question: q.question || "No question provided",
      options: Array.isArray(q.options) ? q.options : [],
      jump_to: q.jump_to || [],
    }));

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
