import mongoose from 'mongoose';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: None
 * Description: Schema cho InterviewSession - Phiên phỏng vấn với AI
 * Tạo phiên phỏng vấn mô phỏng dựa trên Job Description và Job Category
 * Lưu trữ câu hỏi, câu trả lời, feedback từ AI, điểm số
 */
const interviewSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            default: null,
        },
        jobTitle: {
            type: String,
            required: true, // ví dụ: "Senior Software Engineer"
        },
        jobCategory: {
            type: String,
            enum: ['IT', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Business', 'Other'],
            required: true,
        },
        jobDescription: {
            type: String, // Optional - dùng để tạo câu hỏi customize
            default: '',
        },
        // Phỏng vấn dựa trên loại ngành
        interviewType: {
            type: String,
            enum: ['Technical', 'Behavioral', 'Mixed'],
            default: 'Mixed',
        },
        difficultyLevel: {
            type: Number,
            min: 1,
            max: 5,
            default: 2,
        },
        status: {
            type: String,
            enum: ['ongoing', 'completed', 'paused'],
            default: 'ongoing',
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'InterviewQuestion',
            },
        ],
        // Điểm số tổng động
        totalScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        totalQuestions: {
            type: Number,
            default: 0,
        },
        answeredQuestions: {
            type: Number,
            default: 0,
        },
        // Thời gian
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        duration: {
            type: Number, // Seconds
            default: 0,
        },
        // Feedback AI tổng quát
        overallFeedback: {
            type: String,
            default: '',
        },
        strengths: [String],
        improvements: [String],
        nextSteps: [String],
        recommendation: {
            type: String,
            default: '', // Strong Hire / Hire / Consider / No Hire
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookup
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ jobId: 1, userId: 1 });

export default mongoose.model('InterviewSession', interviewSessionSchema);
