import express from 'express'
import { signup } from '../controller/user.controller.js';
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post("/signup", upload.single("file"), signup);

export default router