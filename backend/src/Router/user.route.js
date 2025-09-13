import express from 'express'
import { getme, login, signup, userLogin } from '../controller/user.controller.js';
import multer from "multer";
import verifyToken from '../middleware/token.middleware.js';
const upload = multer({ dest: "uploads/" });

const router = express.Router()

router.post("/signup", upload.single("file"), signup);
router.post("/userlogin", userLogin);

router.get("/getme", verifyToken, getme);
router.post("/login", login);


export default router