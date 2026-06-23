import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Description: Groq API configuration - Initialize Groq client with robust model fallbacks (Llama 3.3 70B -> Llama 3.1 8B -> Gemini 2.0 Flash)
 */

let _groqClient = null;
let _geminiClient = null;

function getGroqClient() {
    if (!_groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY chưa được cấu hình. Vui lòng thêm nó vào file .env của bạn.');
        }
        _groqClient = new Groq({ apiKey });
    }
    return _groqClient;
}

function getGeminiModel(expectJson = false) {
    if (!_geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY chưa được cấu hình.');
        }
        _geminiClient = new GoogleGenerativeAI(apiKey);
    }
    return _geminiClient.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined,
    });
}

class GroqService {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 1000; // ms
    }

    /**
     * Retry logic with exponential backoff
     */
    async retryWithBackoff(fn, retries = this.maxRetries) {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0 && this.isRetryable(error)) {
                const delay = this.retryDelay * (this.maxRetries - retries + 1);
                console.warn(`Retry attempt ${this.maxRetries - retries + 1}/${this.maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryWithBackoff(fn, retries - 1);
            }
            throw error;
        }
    }

    /**
     * Check if error is retryable
     */
    isRetryable(error) {
        const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '429', '500', '503'];
        const errorStr = error.toString();
        return retryableErrors.some(code => errorStr.includes(code));
    }

    /**
     * Helper to perform chat completion with robust multi-model fallback (70B -> 8B -> Gemini)
     */
    async chatCompletion(params, expectJson = false) {
        const primaryModel = params.model || 'llama-3.3-70b-versatile';
        
        try {
            // 1. Try Primary Model (llama-3.3-70b-versatile)
            return await getGroqClient().chat.completions.create({
                ...params,
                model: primaryModel
            });
        } catch (error) {
            const errorStr = error.toString().toLowerCase();
            const isRateLimit = errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('limit reached') || errorStr.includes('rate_limit_exceeded');
            
            if (primaryModel === 'llama-3.3-70b-versatile') {
                console.warn(`[GROQ FALLBACK] Primary model 70B rate limited or failed (${error.message}). Retrying with llama-3.1-8b-instant...`);
                try {
                    // 2. Fallback to Llama 3.1 8B Instant (separate rate limit, higher quota)
                    return await getGroqClient().chat.completions.create({
                        ...params,
                        model: 'llama-3.1-8b-instant'
                    });
                } catch (fallbackError) {
                    console.error('[GROQ FALLBACK FAILED] Fallback to 8B model also failed:', fallbackError.message);
                    
                    // 3. Fallback to Google Gemini 2.0 Flash
                    try {
                        return await this.callGeminiFallback(params, expectJson);
                    } catch (geminiError) {
                        console.error('[GEMINI FALLBACK FAILED] Fallback to Gemini failed:', geminiError.message);
                        throw geminiError;
                    }
                }
            } else if (primaryModel === 'llama-3.1-8b-instant') {
                // If the requested model was already 8B and it failed, try Gemini directly
                try {
                    return await this.callGeminiFallback(params, expectJson);
                } catch (geminiError) {
                    console.error('[GEMINI FALLBACK FAILED] Direct fallback to Gemini failed:', geminiError.message);
                    throw geminiError;
                }
            }
            throw error;
        }
    }

    /**
     * Call Gemini and shape the response structure like Groq SDK for compatibility
     */
    async callGeminiFallback(params, expectJson = false) {
        console.log("[GEMINI FALLBACK] Retrying chat completion with Gemini 2.0 Flash...");
        const lastMessage = params.messages[params.messages.length - 1]?.content || '';
        
        let fullPrompt = lastMessage;
        if (params.messages.length > 1) {
            // Build thread representation for context
            fullPrompt = params.messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n') + '\n\nAssistant:';
        }
        
        const model = getGeminiModel(expectJson);
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        
        return {
            choices: [
                {
                    message: {
                        content: text
                    }
                }
            ]
        };
    }

    /**
     * Generate interview question using Groq with retry
     * @param {String} prompt - The prompt to send to Groq
     * @returns {Promise<Object>} - Parsed question object
     */
    async generateQuestion(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 500,
                }, true);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }

                const parsed = this.parseJsonResponse(responseText);
                return parsed || { question: responseText, type: 'Technical', topic: 'General' };
            } catch (error) {
                console.error('Groq generateQuestion error:', error.message);
                throw new Error(`Không thể sinh câu hỏi: ${error.message}`);
            }
        });
    }

    /**
     * Evaluate user answer and provide feedback with retry
     * @param {String} prompt - The evaluation prompt
     * @returns {Promise<Object>} - Score, feedback, suggestions
     */
    async evaluateAnswer(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.5,
                    max_tokens: 800,
                }, true);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }

                const parsed = this.parseJsonResponse(responseText);

                // Ensure score is between 0-100
                if (parsed && parsed.score) {
                    parsed.score = Math.min(100, Math.max(0, parseInt(parsed.score)));
                }

                return (
                    parsed || {
                        score: 70,
                        feedback: responseText,
                        keyPoints: [],
                        missedPoints: [],
                        suggestions: [],
                        sentiment: 'good',
                    }
                );
            } catch (error) {
                console.error('Groq evaluateAnswer error:', error.message);
                throw new Error(`Không thể đánh giá câu trả lời: ${error.message}`);
            }
        });
    }

    /**
     * Generate follow-up question based on user's answer with retry
     * @param {String} prompt - Follow-up prompt
     * @returns {Promise<Object>} - Follow-up question
     */
    async generateFollowUp(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.6,
                    max_tokens: 300,
                }, true);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }
                const parsed = this.parseJsonResponse(responseText);

                return parsed || { question: responseText };
            } catch (error) {
                console.error('Groq generateFollowUp error:', error.message);
                throw new Error(`Không thể sinh câu hỏi tiếp theo: ${error.message}`);
            }
        });
    }

    /**
     * Generate overall feedback for completed interview with retry
     * @param {String} prompt - Overall feedback prompt
     * @returns {Promise<Object>} - Feedback, strengths, improvements
     */
    async generateOverallFeedback(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.5,
                    max_tokens: 1000,
                }, true);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }
                const parsed = this.parseJsonResponse(responseText);

                return (
                    parsed || {
                        feedback: responseText,
                        strengths: [],
                        improvements: [],
                        nextSteps: [],
                    }
                );
            } catch (error) {
                console.error('Groq generateOverallFeedback error:', error.message);
                throw new Error(`Không thể sinh đánh giá tổng thể: ${error.message}`);
            }
        });
    }

    /**
     * Generic method for custom prompts with retry
     * @param {String} prompt - Custom prompt
     * @returns {Promise<String>} - Raw response
     */
    async generateWithPrompt(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 1000,
                }, false);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }
                return responseText;
            } catch (error) {
                console.error('Groq generateWithPrompt error:', error.message);
                throw new Error(`Không thể sinh response: ${error.message}`);
            }
        });
    }

    /**
     * Fast safety classifier using a smaller model (llama-3.1-8b-instant)
     */
    async classifySafety(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.1-8b-instant',
                    temperature: 0.0,
                    max_tokens: 60,
                }, false);
                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API safety classification returned empty response');
                }
                return responseText;
            } catch (error) {
                console.warn('Groq classifySafety error, trying fallback:', error.message);
                return this.generateWithPrompt(prompt);
            }
        });
    }

    /**
     * Chat with history using Groq with retry
     * @param {Array} messages - Array of message objects { role, content }
     * @returns {Promise<String>} - Assistant response text
     */
    async chat(messages) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await this.chatCompletion({
                    messages: messages,
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 1000,
                }, false);

                const responseText = completion.choices[0]?.message?.content;
                if (!responseText) {
                    throw new Error('Groq API trả về response rỗng');
                }
                return responseText;
            } catch (error) {
                console.error('Groq chat error:', error.message);
                throw new Error(`Không thể sinh câu trả lời: ${error.message}`);
            }
        });
    }

    /**
     * Helper: Parse JSON from response text
     * @param {String} text - Response text
     * @returns {Object|null} - Parsed JSON or null
     */
    parseJsonResponse(text) {
        try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }

            // Try direct JSON parse
            return JSON.parse(text);
        } catch {
            return null;
        }
    }
}

export default new GroqService();
