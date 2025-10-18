import express from "express";
import cors from "cors";
import connectDB from "./db/Database.js";
import UserRouter from "./Router/user.route.js";
import dotenv from "dotenv";
import QuestionRouter from "./Router/question.route.js";
import job from "./config/cors.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", UserRouter);
app.use("/api/questions", QuestionRouter);
job.start();

app.get("/", (req, res) => res.send("Server is running"));



const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
.catch((err) => console.error("Failed to connect to DB:", err));
