import Blog from "./blog.model.js";

export class BlogController {
  static async createBlog(req, res) {
    try {
      const userId = req.user.userId;
      const { title, description, rating, outcome } = req.body;

      if (!title || !description || !rating || !outcome) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
      }

      const blog = await Blog.create({
        userId,
        title,
        description,
        rating: Number(rating),
        outcome,
        status: "approved"
      });

      return res.status(201).json(blog);
    } catch (error) {
      console.error("Create blog error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  static async getApprovedBlogs(req, res) {
    try {
      const blogs = await Blog.find({ status: "approved" })
        .populate("userId", "name role email")
        .sort({ createdAt: -1 });
      return res.status(200).json(blogs);
    } catch (error) {
      console.error("Get approved blogs error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }

  static async getMyBlogs(req, res) {
    try {
      const userId = req.user.userId;
      const blogs = await Blog.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json(blogs);
    } catch (error) {
      console.error("Get my blogs error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}
