import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Description: Gemini API Service - faster fallback thay thế Groq nếu chậm hoặc trùng
 * Model: gemini-2.0-flash (có thể thay bằng gemini-1.5-pro nếu cần)
 */

let _client = null;

function getGeminiClient(modelName = 'gemini-2.0-flash') {
    if (!_client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm nó vào file .env của bạn.');
        }
        _client = new GoogleGenerativeAI(apiKey);
    }
    try {
        return _client.getGenerativeModel({ model: modelName });
    } catch (error) {
        console.error(`[GEMINI] Failed to get model ${modelName}, falling back to gemini-1.5-pro`);
        return _client.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }
}

class GeminiService {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.timeout = 15000; // 15 giây timeout
    }

    isRetryable(error) {
        const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '429', '500', '503', 'deadline'];
        const errorStr = error.toString();
        return retryableErrors.some(code => errorStr.includes(code));
    }

    async retryWithBackoff(fn, retries = this.maxRetries) {
        try {
            return await Promise.race([
                fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Gemini timeout')), this.timeout)
                )
            ]);
        } catch (error) {
            if (retries > 0 && this.isRetryable(error)) {
                const delay = this.retryDelay * (this.maxRetries - retries + 1);
                console.warn(`[GEMINI RETRY] Attempt ${this.maxRetries - retries + 1}/${this.maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryWithBackoff(fn, retries - 1);
            }
            throw error;
        }
    }

    async generateWithPrompt(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const model = getGeminiClient();
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const responseText = response.text();
                
                if (!responseText) {
                    throw new Error('Gemini API trả về response rỗng');
                }
                
                console.log(`[GEMINI SUCCESS] Generated response (${responseText.length} chars)`);
                return responseText;
            } catch (error) {
                console.error('[GEMINI ERROR]', error.message);
                throw new Error(`Gemini sinh câu hỏi thất bại: ${error.message}`);
            }
        });
    }

    parseJsonResponse(text) {
        try {
            // Try markdown code block
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }

            // Try direct JSON
            return JSON.parse(text);
        } catch {
            return null;
        }
    }
}

export default new GeminiService();
