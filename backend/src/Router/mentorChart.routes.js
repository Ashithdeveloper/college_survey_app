import express from "express";
import { createMentorChart, deleteMentorSchedule, getMentorCharts, getMentorSchedule, scheduleMentorAI } from "../controller/mentor.controller.js";
import verifyToken from "../middleware/token.middleware.js";

const router = express.Router();

// Mentor routes

// Create a new chart with AI
router.post("/", verifyToken,createMentorChart)

// Get all charts for a user
router.get('/getmychart',verifyToken, getMentorCharts)

//schedule mentor AI
router.post("/schedule", verifyToken, scheduleMentorAI);

//Get all schedules for a user
router.get('/getschedule',verifyToken, getMentorSchedule);

//delete schedule
router.delete("/schedule/:id", verifyToken, deleteMentorSchedule);

export default router