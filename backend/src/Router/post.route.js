import express from "express"
import verifyToken from "../middleware/token.middleware.js";
import { addComment, allPostList, createPost, likeOrUnlikePost, showComment, userPostList } from "../controller/postCommunity.controller.js";

const router = express.Router();

// Post routes

//post create function 
router.post("/postcreate",verifyToken, createPost );
//post like and unlike
router.post("/:id/like", verifyToken, likeOrUnlikePost);
//post comment function
router.post("/:id/comment", verifyToken, addComment);
//get user post list
router.get("/userpostlist",verifyToken, userPostList);
//get all post list
router.get("/allpostlist", allPostList);
//post comment show 
router.get("/:id/comment", verifyToken, showComment);


export default router