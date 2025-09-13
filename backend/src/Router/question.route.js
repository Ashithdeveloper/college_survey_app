import express from "express";
import verifyToken from "../middleware/token.middleware.js";
import { getquestion, getresult, saveanswer } from "../controller/question.controller.js";

const router = express.Router();


router.get("/",verifyToken, getquestion)
router.post("/answer",verifyToken,saveanswer);
router.get('/result',getresult);

export default router