import express from "express";
import verifyToken from "../middleware/token.middleware.js";
import { getquestion, saveanswer } from "../controller/question.controller.js";

const router = express.Router();


router.get("/",verifyToken, getquestion)
router.post("/answer",verifyToken,saveanswer);

export default router