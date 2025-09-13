import express from 'express'
import { signup, userLogin } from '../controller/user.controller.js';
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post("/signup", upload.single("file"), signup);
router.post("/userlogin", userLogin);


export default router