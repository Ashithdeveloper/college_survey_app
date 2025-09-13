import express from "express";
import cors from "cors";
import connectDB from "./db/Database.js";
import UserRouter from "./Router/user.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", UserRouter);

app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Failed to connect to DB:", err));
