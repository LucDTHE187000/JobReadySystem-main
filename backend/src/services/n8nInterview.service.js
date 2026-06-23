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
            previousQuestions = [], previousAnswers = [], cvSkills = [], cvTopics = [],
            cvStrengths = [], cvWeaknesses = [], cvString = '',
            interviewStage = 1, averageScore = 0,
            weakTopics = [], strongTopics = [],
        } = data;

        const prevList = previousQuestions.length > 0
            ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
            : 'Chưa có câu hỏi nào';

        // Xây dựng lịch sử hội thoại chi tiết (để AI bắt nhịp hội thoại tự nhiên)
        let conversationHistory = '';
        if (previousQuestions.length > 0) {
            conversationHistory = previousQuestions.map((q, i) => {
                const ans = previousAnswers[i] || '(Chưa có câu trả lời)';
                return `Người phỏng vấn: ${q}\nỨng viên: ${ans}`;
            }).join('\n\n');
        } else {
            conversationHistory = 'Chưa có hội thoại trước đó.';
        }

        const prompt = `Bạn là một nhà tuyển dụng cấp cao, chuyên phỏng vấn ứng viên ${position} tại công ty công nghệ hàng đầu Việt Nam. Bạn đang có cuộc trò chuyện trực tiếp (chat) với ứng viên.

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

LỊCH SỬ CUỘC TRÒ CHUYỆN (CÂU HỎI & CÂU TRẢ LỜI TRƯỚC ĐÓ):
${conversationHistory}

CÁC CÂU HỎI ĐÃ HỎI — TUYỆT ĐỐI KHÔNG LẶP LẠI Ý NÀO:
${prevList}

YÊU CẦU CÂU HỎI:
- Viết hoàn toàn bằng tiếng Việt.
- Bắt buộc phải phản hồi/giao tiếp tiếp nối tự nhiên dựa trên câu trả lời gần nhất của ứng viên trong lịch sử hội thoại (ví dụ: "Cảm ơn chia sẻ của bạn về...", "Từ câu trả lời của bạn, tôi thấy...", "Bạn có nhắc đến... vậy thì..."). Tạo cảm giác đàm thoại mượt mà, thân thiện như chat với ChatGPT thay vì các câu hỏi tĩnh độc lập, khô khan.
- Tuy nhiên, hãy khéo léo dẫn dắt câu hỏi tiếp theo hướng về chủ đề mục tiêu lần này là '${targetDomain}' và phù hợp với độ khó '${targetDifficulty}'.
- Phải KHÁC HOÀN TOÀN với tất cả câu hỏi đã hỏi ở trên.
${targetDifficulty === 'Hard' ? '- Với Hard: hỏi về system design, trade-off, tình huống khó, leadership, hoặc kinh nghiệm xử lý failure thực tế' : ''}
${targetDifficulty === 'Medium' ? '- Với Medium: hỏi tình huống cụ thể, cách giải quyết vấn đề, hoặc kinh nghiệm thực tế' : ''}
- Nếu ứng viên yếu chủ đề nào, hỏi sâu hơn về chủ đề đó.
- Câu hỏi nên khai thác được CV của ứng viên.
- Kèm 1 follow-up question để hỏi tiếp nếu câu trả lời chung chung.

Trả về JSON:
{
  "questionText": "câu hỏi chính bằng tiếng Việt (bao gồm cả phần dẫn dắt/nhận xét kết nối tự nhiên từ câu trả lời trước)",
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
 
 Hãy viết đánh giá tổng thể CHUYÊN NGHIỆP, CHI TIẾT và CỰ THỂ dựa trên các câu hỏi/trả lời thực tế bằng tiếng Việt.
 
 Trả về JSON:
 {
   "overallFeedback": "Đánh giá tổng thể chi tiết (5-8 câu), phân tích cụ thể thái độ, ưu điểm và nhược điểm nổi bật của ứng viên dựa trên câu trả lời thực tế, nêu rõ ứng viên có phù hợp với vị trí này không và lý do tại sao.",
   "strengths": [
     "Điểm mạnh cụ thể 1 (Ví dụ: Thể hiện tư duy logic tốt khi giải quyết bài toán tối ưu SQL ở câu 3)",
     "Điểm mạnh cụ thể 2 (Ví dụ: Nắm chắc kiến thức nền tảng về cơ chế Indexing trong MongoDB)",
     "Điểm mạnh cụ thể 3",
     "Điểm mạnh cụ thể 4 (tối thiểu 3-5 điểm mạnh chi tiết)"
   ],
   "improvements": [
     "Điểm cần cải thiện cụ thể 1 (Ví dụ: Cần phân biệt rõ kiểu dữ liệu nguyên thủy và phức tạp ở câu 8)",
     "Điểm cần cải thiện cụ thể 2 (Ví dụ: Câu trả lời ở câu 5 còn chung chung, cần bổ sung ví dụ thực tế)",
     "Điểm cần cải thiện cụ thể 3",
     "Điểm cần cải thiện cụ thể 4 (tối thiểu 3-5 điểm cải thiện chi tiết)"
   ],
   "nextSteps": [
     "Hành động cụ thể chi tiết 1",
     "Hành động cụ thể chi tiết 2",
     "Hành động cụ thể chi tiết 3"
   ],
   "hiringRecommendation": "Strong Yes / Yes / Maybe / No"
 }`;

        return await callAI(prompt);
    }

    // ─── 5. ANALYZE CV ────────────────────────────────────────────────────────
    async analyzeCV(data) {
        const { cvText, position } = data;

        const prompt = `Bạn là chuyên gia HR và ATS (Applicant Tracking System) phân tích CV cho vị trí ${position || 'Software Engineer'}.
Hãy phân tích cực kỳ chi tiết, khách quan và cụ thể dựa trên nội dung CV được cung cấp bên dưới. Hãy chỉ rõ từng điểm mạnh, điểm yếu cụ thể đọc được từ CV (không chung chung) và đưa ra các đề xuất cải thiện thực tế.

CV CỦA ỨNG VIÊN:
${cvText}

Yêu cầu phân tích chi tiết và trả về định dạng JSON thuần túy (không kèm markdown \`\`\`json) với cấu trúc sau:
{
  "totalScore": <điểm số ATS tổng quát từ 40-100, phản ánh độ hoàn thiện và mức độ phù hợp của CV>,
  "structureScore": <điểm cấu trúc, bố cục trình bày từ 0-100>,
  "contentScore": <điểm chất lượng nội dung, kinh nghiệm làm việc từ 0-100>,
  "languageScore": <điểm ngôn ngữ, chính tả, văn phong từ 0-100>,
  "relevanceScore": <điểm độ tương thích kỹ năng với vị trí ${position || 'Software Engineer'} từ 0-100>,
  "skills": ["kỹ năng chuyên môn 1", "kỹ năng chuyên môn 2"],
  "technologies": ["công nghệ/công cụ sử dụng 1", "công nghệ/công cụ sử dụng 2"],
  "experienceLevel": "Intern / Fresher / Junior / Mid / Senior",
  "experienceYears": <số năm kinh nghiệm ước tính, ví dụ: 2>,
  "strengths": [
    "Điểm mạnh cụ thể 1 (Ví dụ: Có 2 năm kinh nghiệm thực tế về Java & Python)",
    "Điểm mạnh cụ thể 2 (Ví dụ: Có kinh nghiệm xây dựng hệ thống quy mô nhỏ)",
    "Điểm mạnh cụ thể 3",
    "Điểm mạnh cụ thể 4"
  ],
  "weaknesses": [
    "Điểm yếu cụ thể 1 (Ví dụ: Thiếu kinh nghiệm làm việc với cơ sở dữ liệu lớn/phân tán)",
    "Điểm yếu cụ thể 2 (Ví dụ: Thiếu các số liệu đo lường hiệu quả công việc - KPIs)",
    "Điểm yếu cụ thể 3",
    "Điểm yếu cụ thể 4"
  ],
  "suggestions": [
    "Đề xuất cải thiện cụ thể 1 (Ví dụ: Bổ sung thêm các dự án thực tế về SQL/NoSQL)",
    "Đề xuất cải thiện cụ thể 2 (Ví dụ: Sử dụng mô hình STAR để viết phần kinh nghiệm và đưa số liệu % tăng trưởng vào)",
    "Đề xuất cải thiện cụ thể 3",
    "Đề xuất cải thiện cụ thể 4"
  ],
  "recommendedInterviewTopics": ["chủ đề phỏng vấn khuyên dùng 1", "chủ đề phỏng vấn khuyên dùng 2", "chủ đề phỏng vấn khuyên dùng 3"],
  "summary": "tóm tắt nhận xét tổng quát ngắn gọn về ứng viên bằng tiếng Việt (2-3 câu)"
}`;

        return await callAI(prompt);
    }
}

export default new GeminiInterviewService();