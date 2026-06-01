import InterviewSession from './interview.model.js';
import InterviewQuestion from './interviewQuestion.model.js';
import GroqService from '../../config/groq.js';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: [position, level, userId]
 * Description: Service xử lý Interview Training - sinh câu hỏi & chấm điểm
 */

class SimpleInterviewService {
    /**
     * Sinh 1 câu hỏi phỏng vấn dựa vào position + level
     * @param {String} position - VD: Frontend, Backend, Fullstack...
     * @param {String} level - Intern, Fresher, Junior, Senior...
     * @returns {Promise<Object>} - Question object
     */
    async generateQuestion(position, level) {
        try {
            const prompt = this.buildQuestionPrompt(position, level);
            const response = await GroqService.generateWithPrompt(prompt);

            // Parse response để lấy câu hỏi
            const parsed = this.parseQuestionResponse(response);
            return parsed;
        } catch (error) {
            console.error('Generate question error:', error);
            // Fallback question
            return {
                question: `Bạn có kinh nghiệm với ${position} ở level ${level} chưa? Hãy kể về một dự án bạn đã làm.`,
                type: 'Behavioral'
            };
        }
    }

    /**
     * Chấm điểm câu trả lời (1-10)
     * @param {String} question - Câu hỏi
     * @param {String} answer - Câu trả lời
     * @returns {Promise<Object>} - { score, feedback, strengths, weaknesses, suggestions }
     */
    async evaluateAnswer(question, answer) {
        try {
            const prompt = this.buildEvaluationPrompt(question, answer);
            const response = await GroqService.generateWithPrompt(prompt);

            // Parse response
            const parsed = this.parseEvaluationResponse(response);
            return parsed;
        } catch (error) {
            console.error('Evaluate answer error:', error);
            // Fallback evaluation
            return {
                score: 5,
                feedback: 'AI evaluation không khả dụng',
                strengths: ['Bạn đã cố gắng trả lời'],
                weaknesses: ['Cần chi tiết hơn'],
                suggestions: ['Thêm ví dụ thực tế']
            };
        }
    }

    /**
     * Build prompt để sinh câu hỏi
     */
    buildQuestionPrompt(position, level) {
        return `Bạn là một nhà phỏng vấn kỹ sư phần mềm chuyên nghiệp.

Hãy tạo 1 câu hỏi phỏng vấn REALISTIC cho:
- Vị trí: ${position}
- Level: ${level}

YÊRU CẦU:
- Câu hỏi phải phù hợp với level
- Nếu Fresher: hỏi về kiến thức cơ bản, dự án học tập
- Nếu Junior: hỏi về kinh nghiệm thực tế, problem-solving
- Nếu Senior: hỏi về leadership, architecture, mentoring
- Câu hỏi phải có thể trả lời trong 1-2 phút

Trả về JSON PURE (không markdown):
{
  "question": "...",
  "type": "Technical hoặc Behavioral"
}`;
    }

    /**
     * Build prompt để chấm điểm
     */
    buildEvaluationPrompt(question, answer) {
        return `Bạn là một nhà phỏng vấn chuyên nghiệp.

Câu hỏi phỏng vấn: ${question}

Câu trả lời của ứng viên: ${answer}

HƯỚNG DẪN:
- Chấm điểm từ 1-10 (không phải 0-100)
- 1-3: Rất kém (sai hướng, thiếu kiến thức)
- 4-5: Kém (thiếu chi tiết, ít kinh nghiệm)
- 6-7: Bình thường (đủ tốt, nhưng cần cải thiện)
- 8-9: Tốt (rõ ràng, có ví dụ, logic tốt)
- 10: Xuất sắc (toàn diện, sâu sắc, có tinh thần leadership)

Trả về JSON PURE (không markdown, không code block):
{
  "score": <1-10>,
  "feedback": "nhận xét chi tiết tiếng Việt",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
  "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
  "suggestions": ["gợi ý 1", "gợi ý 2"]
}`;
    }

    /**
     * Parse question response
     */
    parseQuestionResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { question: response.substring(0, 200), type: 'Technical' };
        } catch (error) {
            return { question: response.substring(0, 200), type: 'Technical' };
        }
    }

    /**
     * Parse evaluation response
     */
    parseEvaluationResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    score: Math.min(10, Math.max(1, parsed.score || 5)),
                    feedback: parsed.feedback || '',
                    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
                    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
                };
            }
        } catch (error) {
            // Fallback
        }

        return {
            score: 5,
            feedback: 'Không thể phân tích',
            strengths: [],
            weaknesses: [],
            suggestions: []
        };
    }
}

export default new SimpleInterviewService();
