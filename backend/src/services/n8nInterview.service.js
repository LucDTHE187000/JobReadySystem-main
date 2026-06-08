import { GoogleGenerativeAI } from '@google/generative-ai';
import groqService from '../config/groq.js';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Description: Thay thế N8N bằng Google Gemini trực tiếp, nay bổ sung thêm Groq làm primary engine.
 * Interface giữ nguyên 100% để interview.controller.js không cần sửa.
 */

let _geminiClient = null;

function getModel() {
    if (!_geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
        _geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return _geminiClient.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: 'application/json' },
    });
}

async function callAI(prompt) {
    // 1. Thử dùng Groq trước (llama-3.3-70b-versatile nhanh và ổn định)
    try {
        console.log("[AI CALL] Đang gọi Groq Service làm primary...");
        const responseText = await groqService.generateWithPrompt(prompt);
        if (responseText) {
            try {
                return JSON.parse(responseText);
            } catch (jsonErr) {
                const m = responseText.match(/\{[\s\S]*\}/);
                if (m) return JSON.parse(m[0]);
                throw jsonErr;
            }
        }
    } catch (groqErr) {
        console.warn("[AI CALL] Groq thất bại, đang chuyển sang fallback Gemini:", groqErr.message);
    }

    // 2. Fallback sang Gemini
    console.log("[AI CALL] Đang gọi Gemini làm fallback...");
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
        return JSON.parse(text);
    } catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) return JSON.parse(m[0]);
        throw new Error('Gemini trả về response không parse được: ' + text.substring(0, 200));
    }
}

class GeminiInterviewService {

    // ─── 1. GENERATE QUESTION ──────────────────────────────────────────────────
    async generateQuestion(data) {
        const {
            position, level, interviewType, targetDifficulty, targetDomain,
            previousQuestions = [], cvSkills = [], cvTopics = [],
            cvStrengths = [], cvWeaknesses = [], cvString = '',
            interviewStage = 1, averageScore = 0,
            weakTopics = [], strongTopics = [],
        } = data;

        const prevList = previousQuestions.length > 0
            ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
            : 'Chưa có câu hỏi nào';

        const prompt = `Bạn là một nhà tuyển dụng cấp cao, chuyên phỏng vấn ứng viên ${position} tại công ty công nghệ hàng đầu Việt Nam.

THÔNG TIN PHỎNG VẤN:
- Vị trí: ${position}
- Cấp bậc yêu cầu: ${level}
- Loại phỏng vấn: ${interviewType || 'Mixed'}
- Độ khó mục tiêu: ${targetDifficulty} (Easy=câu nền tảng, Medium=tình huống thực tế, Hard=kiến trúc/leadership/edge case)
- Chủ đề cần hỏi lần này: ${targetDomain}
- Câu hỏi số: ${interviewStage}
- Điểm trung bình hiện tại: ${averageScore}/100

HỒ SƠ ỨNG VIÊN:
- Kỹ năng: ${cvSkills.join(', ') || 'Chưa rõ'}
- Chủ đề nổi bật từ CV: ${cvTopics.join(', ') || 'Chưa rõ'}
- Điểm mạnh: ${cvStrengths.join(', ') || 'Chưa rõ'}
- Điểm yếu cần khai thác: ${cvWeaknesses.join(', ') || 'Chưa rõ'}
- Tóm tắt: ${cvString || 'Không có'}
- Chủ đề ứng viên đang yếu: ${weakTopics.join(', ') || 'Không có'}
- Chủ đề ứng viên đang mạnh: ${strongTopics.join(', ') || 'Không có'}

CÁC CÂU HỎI ĐÃ HỎI — TUYỆT ĐỐI KHÔNG LẶP LẠI Ý NÀO:
${prevList}

YÊU CẦU CÂU HỎI:
- Viết hoàn toàn bằng tiếng Việt, tự nhiên như người phỏng vấn thực nói
- Phải KHÁC HOÀN TOÀN với tất cả câu hỏi đã hỏi ở trên
- Phù hợp đúng độ khó: ${targetDifficulty}
${targetDifficulty === 'Hard' ? '- Với Hard: hỏi về system design, trade-off, tình huống khó, leadership, hoặc kinh nghiệm xử lý failure thực tế' : ''}
${targetDifficulty === 'Medium' ? '- Với Medium: hỏi tình huống cụ thể, cách giải quyết vấn đề, hoặc kinh nghiệm thực tế' : ''}
- Nếu ứng viên yếu chủ đề nào, hỏi sâu hơn về chủ đề đó
- Câu hỏi nên khai thác được CV của ứng viên
- Kèm 1 follow-up question để hỏi tiếp nếu câu trả lời chung chung

Trả về JSON:
{
  "questionText": "câu hỏi chính bằng tiếng Việt",
  "questionType": "Technical hoặc Behavioral",
  "topic": "${targetDomain}",
  "followUpQuestion": "câu hỏi follow-up nếu ứng viên trả lời quá ngắn hoặc chung chung"
}`;

        return await callAI(prompt);
    }

    // ─── 2. EVALUATE ANSWER ───────────────────────────────────────────────────
    async evaluateAnswer(data) {
        const { question, answer } = data;

        const prompt = `Bạn là chuyên gia đánh giá phỏng vấn kỹ thuật với 10+ năm kinh nghiệm.

CÂU HỎI PHỎNG VẤN:
${question}

CÂU TRẢ LỜI CỦA ỨNG VIÊN:
${answer}

THANG ĐIỂM (0-100):
- 0-30: Sai hướng hoàn toàn hoặc không trả lời được
- 31-50: Hiểu mơ hồ, thiếu kiến thức nền
- 51-70: Đúng hướng nhưng thiếu chiều sâu hoặc ví dụ cụ thể
- 71-85: Tốt, có ví dụ thực tế, logic rõ ràng
- 86-100: Xuất sắc, toàn diện, có insight sâu, thể hiện kinh nghiệm thực chiến

Đánh giá KHÁCH QUAN và NGHIÊM KHẮC — không cho điểm cao nếu câu trả lời chung chung.

Trả về JSON:
{
  "aiScore": <số từ 0-100>,
  "aiFeedback": "nhận xét chi tiết bằng tiếng Việt, chỉ ra cụ thể điểm đúng và sai",
  "keyPoints": ["điểm mạnh 1", "điểm mạnh 2"],
  "missedPoints": ["điểm thiếu 1", "điểm thiếu 2"],
  "suggestions": ["gợi ý cải thiện 1", "gợi ý cải thiện 2"],
  "followUpQuestion": "câu hỏi đào sâu hơn nếu muốn"
}`;

        return await callAI(prompt);
    }

    // ─── 3. FOLLOW-UP ─────────────────────────────────────────────────────────
    async generateFollowUp(data) {
        const { question, answer, position, level } = data;

        const prompt = `Ứng viên vị trí ${position} (${level}) vừa trả lời câu hỏi phỏng vấn.

Câu hỏi gốc: ${question}
Câu trả lời: ${answer}

Sinh 1 câu hỏi follow-up sắc bén bằng tiếng Việt để:
- Đào sâu vào điểm chưa rõ trong câu trả lời
- Hoặc challenge một assumption trong câu trả lời
- Hoặc hỏi về edge case / failure scenario

Trả về JSON:
{
  "questionText": "câu hỏi follow-up bằng tiếng Việt",
  "questionType": "Technical",
  "topic": "Follow-up"
}`;

        return await callAI(prompt);
    }

    // ─── 4. OVERALL FEEDBACK ──────────────────────────────────────────────────
    async generateOverallFeedback(data) {
        const { position, level, questions = [], averageScore = 0 } = data;

        const qaList = questions.map((q, i) =>
            `Q${i + 1} [${q.topic || 'General'}] (${q.aiScore ?? '?'}/100): ${q.questionText}\nTrả lời: ${q.userAnswer || '(không có)'}`
        ).join('\n\n');

        const prompt = `Bạn là HR Director đang tổng kết buổi phỏng vấn cho vị trí ${position} (${level}).

TOÀN BỘ BUỔI PHỎNG VẤN:
${qaList}

Điểm trung bình: ${averageScore}/100

Hãy viết đánh giá tổng thể CHUYÊN NGHIỆP và CỤ THỂ bằng tiếng Việt.

Trả về JSON:
{
  "overallFeedback": "đánh giá tổng thể 3-5 câu, nêu rõ ứng viên phù hợp vị trí không và lý do",
  "strengths": ["điểm mạnh nổi bật 1", "điểm mạnh nổi bật 2", "điểm mạnh nổi bật 3"],
  "improvements": ["điểm cần cải thiện 1", "điểm cần cải thiện 2"],
  "nextSteps": ["bước tiếp theo 1", "bước tiếp theo 2"],
  "hiringRecommendation": "Strong Yes / Yes / Maybe / No"
}`;

        return await callAI(prompt);
    }

    // ─── 5. ANALYZE CV ────────────────────────────────────────────────────────
    async analyzeCV(data) {
        const { cvText, position } = data;

        const prompt = `Bạn là chuyên gia HR phân tích CV cho vị trí ${position || 'Software Engineer'}.

CV CỦA ỨNG VIÊN:
${cvText}

Phân tích chi tiết và trả về JSON:
{
  "skills": ["kỹ năng 1", "kỹ năng 2"],
  "technologies": ["công nghệ 1", "công nghệ 2"],
  "experienceLevel": "Intern / Fresher / Junior / Mid / Senior",
  "experienceYears": <số năm kinh nghiệm ước tính>,
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
  "recommendedInterviewTopics": ["chủ đề nên hỏi 1", "chủ đề nên hỏi 2", "chủ đề nên hỏi 3"],
  "summary": "tóm tắt ngắn gọn về ứng viên bằng tiếng Việt"
}`;

        return await callAI(prompt);
    }
}

export default new GeminiInterviewService();