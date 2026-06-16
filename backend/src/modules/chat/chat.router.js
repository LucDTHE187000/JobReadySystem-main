import { Router } from "express";
import { handleChat } from "./chat.controller.js";

const chatRouter = Router();

// Endpoint công khai cho phép cả khách và người dùng đăng nhập trò chuyện với AI
chatRouter.post("/", handleChat);

export { chatRouter };
