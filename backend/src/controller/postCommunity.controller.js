import Post from "../models/communityPost.js";
import User from "../models/user.model.js";


export const createPost = async (req, res) => {
  try {
    // 1️⃣ Get the logged-in user's ID
    const userId = req.user?.id;

    // 2️⃣ Extract post details from request body
    const { text, media } = req.body;

    // 3️⃣ Validate required fields
    if (!text && !media) {
      return res
        .status(400)
        .json({ message: "Text or media is required", success: false });
    }

    // 4️⃣ Create a new post document
    const post = new Post({
      user: userId,
      text,
      media: media || null,
    });

    // 5️⃣ Save the post to MongoDB
    await post.save();

    // 6️⃣ Return success response
    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const likeOrUnlikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: postId } = req.params;

    // 1️⃣ Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // 2️⃣ Check if the user already liked the post
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // 3️⃣ If already liked, remove user from likes array (unlike)
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      await post.save();
      return res
        .status(200)
        .json({ message: "Post unliked", success: true, post });
    } else {
      // 4️⃣ Otherwise, add the user to likes array (like)
      post.likes.push(userId);
      await post.save();
      return res
        .status(200)
        .json({ message: "Post liked", success: true, post });
    }
  } catch (error) {
    console.error("Like/Unlike Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: postId } = req.params;
    const { text } = req.body;

    // 1️⃣ Validate comment text
    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ message: "Comment text is required", success: false });
    }

    // 2️⃣ Find the post by ID
    const post = await Post.findById(postId).populate("user", "name isVerified ,role");
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    // 3️⃣ Create a new comment object
    const comment = {
      user: userId,
      text: text.trim(),
    };

    // 4️⃣ Add comment to post
    post.comments.push(comment);
    await post.save();

    // 5️⃣ Return updated post
    return res.status(201).json({
      message: "Comment added successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
//show comment for that post
export const showComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate("user", "name isVerified ,role");
        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false });
        }
        return res.status(200).json({ success: true, post });
    } catch (error) {
        console.error("Show Comment Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}

//user post list '
export const userPostList = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const posts = await Post.find({ user: userId })
          .sort({ createdAt: -1 })
          .populate("user", "name isVerified ,role");
        if(!posts) {
            return res.status(404).json({ message: "Posts not found", success: false });
        }
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        console.log(error);
    }
}
//all post list 
export const allPostList = async (req, res) => {
    try {
          const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("user", "name isVerified role")
            .populate("comments.user", "name isVerified role");

        if(!posts) {
            return res.status(404).json({ message: "Posts not found", success: false });
        }
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        console.log(error);
    }
}

