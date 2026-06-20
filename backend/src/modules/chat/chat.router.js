import { Router } from "express";
import { handleChat } from "./chat.controller.js";

const chatRouter = Router();

// In-memory request tracker for sliding window rate limiting (max 20 requests per minute per IP)
const rateLimitWindow = 60 * 1000; // 1 minute
const rateLimitMax = 20;
const ipRequestCounts = new Map();

// Periodic cleanup of stale memory records every 5 minutes
setInterval(() => {
    ipRequestCounts.clear();
}, 5 * 60 * 1000);

function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!ipRequestCounts.has(ip)) {
        ipRequestCounts.set(ip, []);
    }
    
    // Filter out timestamps outside the current 1-minute window
    const requests = ipRequestCounts.get(ip).filter(timestamp => now - timestamp < rateLimitWindow);
    
    if (requests.length >= rateLimitMax) {
        return res.status(429).json({ 
            error: "Bạn đang gửi quá nhiều tin nhắn. Vui lòng đợi 1 phút trước khi thử lại." 
        });
    }
    
    requests.push(now);
    ipRequestCounts.set(ip, requests);
    next();
}

// Endpoint công khai cho phép cả khách và người dùng đăng nhập trò chuyện với AI (được bảo vệ bởi rate limiter)
chatRouter.post("/", rateLimiter, handleChat);

export { chatRouter };
