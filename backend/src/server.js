import express from 'express';
import cors from 'cors';
import connectDB from './db/Database.js';
import UserRouter from "./Router/user.route.js"
import { configDotenv } from "dotenv";

configDotenv();



// const client = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// const response = await client.models.generateContent({
//   model: "gemini-2.5-flash",
//   contents: "How does AI work?",
// });

// console.log(response.text);



const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/user', UserRouter); 

app.listen(3001, () => {
    connectDB();
    console.log('Server running on port 3001');
});