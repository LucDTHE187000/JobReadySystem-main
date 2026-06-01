import n8nInterviewService from '../../../services/n8nInterview.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    console.log('Testing N8N generateQuestion...');
    try {
        const payload = {
            sessionId: "6a0c71fdfdec603c35fb0dcd",
            position: "Nhân viên bán hàng",
            level: "Fresher",
            cv: "Họ và tên: Nguyễn Văn A. Vị trí: Nhân viên bán hàng. Kinh nghiệm: 2 năm bán lẻ và tư vấn khách hàng.",
            skills: ["Kỹ năng thuyết phục", "Chốt sales", "Tư vấn sản phẩm"],
            experienceLevel: "Fresher",
            recommendedTopics: ["Objection Handling", "Communication"],
            cvStrengths: [],
            cvWeaknesses: [],
            answer: "",
            previousQuestions: [],
            previousAnswers: [],
            previousScores: [],
            previousTopics: [],
            interviewStage: "start",
            averageScore: 0,
            recentScores: [],
            coveredDomains: [],
            weakTopics: [],
            strongTopics: [],
            failureStreak: 0,
            successStreak: 0,
            targetDifficulty: "Medium",
            targetDomain: "Work Ethic",
            interviewType: "Behavioral"
        };
        
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await n8nInterviewService.generateQuestion(payload);
        console.log('\n--- N8N RESPONSE ---');
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Error calling N8N:', error.message);
    }
}

run();
