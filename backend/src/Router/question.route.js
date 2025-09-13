import express from "express";
import verifyToken from "../middleware/token.middleware.js";
import { getquestion } from "../controller/question.controller.js";

const router = express.Router();

router.get("/",verifyToken, getquestion)

export default router