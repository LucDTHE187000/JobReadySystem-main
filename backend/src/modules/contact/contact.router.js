import { Router } from "express";
import { sendContactMessage } from "./contact.controller.js";

const contactRouter = Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Gửi tin nhắn liên hệ hỗ trợ
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
contactRouter.post("/", sendContactMessage);

export { contactRouter };
