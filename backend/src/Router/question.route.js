import express from "express";
import verifyToken from "../middleware/token.middleware.js";
import { getallCollege, getquestion,  saveAnswer,  } from "../controller/question.controller.js";
import { getCollegeResult } from "../controller/result.controller.js";

const router = express.Router();


router.get("/",verifyToken, getquestion)
router.get('/allcollege',getallCollege)
router.post("/answer",verifyToken,saveAnswer);
router.get('/result/:collegename',verifyToken, getCollegeResult);

export default router