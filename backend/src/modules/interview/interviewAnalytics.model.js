import mongoose from 'mongoose';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: None
 * Description: Schema cho InterviewAnalytics - Thống kê hiệu suất phỏng vấn
 * Theo dõi tiến độ người dùng qua các phiên phỏng vấn
 * Hiển thị những điểm mạnh, điểm yếu, xu hướng cải thiện
 */
const interviewAnalyticsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
            required: true,
        },
        // Thống kê tổng
        totalInterviews: {
            type: Number,
            default: 0,
        },
        completedInterviews: {
            type: Number,
            default: 0,
        },
        totalQuestionsAnswered: {
            type: Number,
            default: 0,
        },
        // Điểm số
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        highestScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        lowestScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        scoreImprovement: {
            type: Number, // Tính từ (current avg - oldest avg)
            default: 0,
        },
        // Phân loại theo loại hỏi
        technicalScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        behavioralScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        // Phân loại theo Job Category
        categoryScores: {
            IT: { type: Number, default: 0 },
            Marketing: { type: Number, default: 0 },
            Sales: { type: Number, default: 0 },
            HR: { type: Number, default: 0 },
            Finance: { type: Number, default: 0 },
            Design: { type: Number, default: 0 },
            Business: { type: Number, default: 0 },
        },
        // Điểm mạnh nhất
        strongestCategories: [String], // Ví dụ: ['System Design', 'Problem Solving']
        weakestCategories: [String], // Những lĩnh vực cần cải thiện
        // Response time insights
        averageResponseTime: {
            type: Number,
            default: 0, // Seconds
        },
        // Sentiment insights
        sentimentTrend: {
            type: String,
            enum: ['improving', 'stable', 'declining'],
            default: 'stable',
        },
        // Skill tags
        topSkills: [String], // Kỹ năng nổi bật: "Leadership", "Problem Solving", etc
        skillsToImprove: [String],
        // Timeline
        firstInterviewDate: {
            type: Date,
            default: null,
        },
        lastInterviewDate: {
            type: Date,
            default: null,
        },
        lastUpdatedAt: {
            type: Date,
            default: Date.now,
        },
        // AI Recommendations
        aiRecommendations: [
            {
                category: String,
                recommendation: String,
                priority: { type: String, enum: ['high', 'medium', 'low'] },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('InterviewAnalytics', interviewAnalyticsSchema);
