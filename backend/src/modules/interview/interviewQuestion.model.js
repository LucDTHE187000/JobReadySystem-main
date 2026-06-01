import mongoose from 'mongoose';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: None
 * Description: Schema cho InterviewQuestion - Câu hỏi & Câu trả lời phỏng vấn
 * Mỗi câu hỏi được AI tạo ra dựa trên Job Category và Job Description
 * Lưu trữ câu trả lời từ user, feedback & điểm số từ AI
 */
const interviewQuestionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewSession',
            required: true,
        },
        questionNumber: {
            type: Number,
            required: true, // Câu hỏi 1, 2, 3...
        },
        questionText: {
            type: String,
            required: true, // Nội dung câu hỏi
        },
        questionType: {
            type: String,
            enum: ['Technical', 'Behavioral', 'System Design'],
            required: true,
        },
        // Lĩnh vực câu hỏi (tuỳ theo job category)
        topic: {
            type: String,
            // Ví dụ: "System Design", "Problem Solving", "Team Collaboration"
            default: '',
        },
        // Câu trả lời từ user
        userAnswer: {
            type: String,
            default: '',
        },
        answerSentimentAnalysis: {
            type: String,
            enum: ['excellent', 'good', 'average', 'poor'],
            default: null,
        },
        // AI Feedback & Scoring
        aiScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        aiFeedback: {
            type: String, // Nhận xét chi tiết từ AI
            default: '',
        },
        keyPoints: [String], // Những điểm chính AI cần người dùng nêu
        missedPoints: [String], // Những điểm bị bỏ qua
        suggestions: [String], // Gợi ý cải thiện
        // Follow-up question (nếu có)
        followUpQuestion: {
            type: String,
            default: null,
        },
        followUpAsked: {
            type: Boolean,
            default: false,
        },
        followUpAnswered: {
            type: Boolean,
            default: false,
        },
        // Thời gian
        createdAt: {
            type: Date,
            default: Date.now,
        },
        answeredAt: {
            type: Date,
            default: null,
        },
        responseTime: {
            type: Number, // Seconds - Thời gian suy nghĩ + trả lời
            default: 0,
        },
    },
    {
        timestamps: false,
    }
);

interviewQuestionSchema.index({ sessionId: 1, questionNumber: 1 });

export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
