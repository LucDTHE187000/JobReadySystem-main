import express from 'express';
import InterviewController from './interview.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/interview/start
 * Tạo phiên phỏng vấn mới
 * Body: { jobTitle, jobCategory, jobDescription?, jobId?, interviewType? }
 */
router.post('/start', (req, res) => {
    InterviewController.startInterview(req, res);
});

/**
 * POST /api/interview/question
 * Sinh 1 câu hỏi phỏng vấn (NEW - phù hợp với UI mới)
 * Body: { position, level }
 */
router.post('/question', (req, res) => {
    InterviewController.generateQuestion(req, res);
});

/**
 * POST /api/interview/evaluate
 * Chấm điểm câu trả lời (NEW - phù hợp với UI mới)
 * Body: { question, answer }
 */
router.post('/evaluate', (req, res) => {
    InterviewController.evaluateAnswer(req, res);
});

/**
 * GET /api/interview/:sessionId/next-question
 * Lấy câu hỏi tiếp theo
 */
router.get('/:sessionId/next-question', (req, res) => {
    InterviewController.getNextQuestion(req, res);
});

/**
 * POST /api/interview/submit-answer
 * Ghi nhận và đánh giá câu trả lời
 * Body: { questionId, userAnswer, responseTime? }
 */
router.post('/submit-answer', (req, res) => {
    InterviewController.submitAnswer(req, res);
});

/**
 * POST /api/interview/:sessionId/complete
 * Hoàn tất phiên phỏng vấn
 */
router.post('/:sessionId/complete', (req, res) => {
    InterviewController.completeInterview(req, res);
});

/**
 * GET /api/interview/history
 * Lấy lịch sử phỏng vấn
 * Query params: limit=10, skip=0
 */
router.get('/history', (req, res) => {
    InterviewController.getInterviewHistory(req, res);
});

/**
 * GET /api/interview/analytics
 * Lấy thống kê hiệu suất
 */
router.get('/analytics', (req, res) => {
    InterviewController.getAnalytics(req, res);
});

/**
 * GET /api/interview/:sessionId/details
 * Lấy chi tiết phiên (tất cả câu hỏi + feedback)
 */
router.get('/:sessionId/details', (req, res) => {
    InterviewController.getSessionDetails(req, res);
});

/**
 * POST /api/interview/tts
 * Text-to-Speech endpoint
 * Body: { text, lang? }
 */
router.post('/tts', (req, res) => {
    InterviewController.textToSpeech(req, res);
});

export default router;
