import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Description: Gemini API config — lazy init giống pattern của groq.js
 */

let _client = null;

export function getGeminiModel(modelName = 'gemini-2.0-flash') {
    if (!_client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
        _client = new GoogleGenerativeAI(apiKey);
    }
    return _client.getGenerativeModel({ model: modelName });
}