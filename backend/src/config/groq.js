import Groq from 'groq-sdk';

/**
 * Author: Dương Trọng Lực - mssv: HE187000
 * Param: None
 * Description: Groq API configuration - Initialize Groq client for AI-powered interview features
 * Using Groq for faster and cheaper AI generation compared to OpenAI
 */

let _groqClient = null;

/**
 * Lazily create Groq client so missing key only errors on first actual AI call,
 * not at server startup — allows the server to boot without a key set.
 */
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
     * Generate interview question using Groq with retry
     * @param {String} prompt - The prompt to send to Groq
     * @returns {Promise<Object>} - Parsed question object
     */
    async generateQuestion(prompt) {
        return this.retryWithBackoff(async () => {
            try {
                const completion = await getGroqClient().chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 500,
                });

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
                const completion = await getGroqClient().chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.5,
                    max_tokens: 800,
                });

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
                const completion = await getGroqClient().chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.6,
                    max_tokens: 300,
                });

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
                const completion = await getGroqClient().chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.5,
                    max_tokens: 1000,
                });

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
                const completion = await getGroqClient().chat.completions.create({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 1000,
                });

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
