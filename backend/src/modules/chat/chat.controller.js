import groqService from '../../config/groq.js';

/**
 * Handle AI support chat requests
 * POST /api/chat
 */
export async function handleChat(req, res) {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    const systemPrompt = `Bạn là JobReady AI Assistant - Trợ lý sự nghiệp thông minh và tận tâm của hệ thống JobReady.
Nhiệm vụ của bạn là hỗ trợ và tư vấn cho người dùng về các chủ đề liên quan đến tuyển dụng, sự nghiệp và hệ thống JobReady:
1. Hướng dẫn viết, định dạng và tối ưu hóa CV để vượt qua hệ thống ATS.
2. Hướng dẫn chuẩn bị và luyện phỏng vấn (mock interview), trả lời các câu hỏi tình huống khó, câu hỏi chuyên môn.
3. Tư vấn định hướng nghề nghiệp, lộ trình học tập phát triển kỹ năng (ví dụ lập trình, marketing, sales, product management...).
4. Giải thích các tính năng của JobReady:
   - "Chấm CV bằng AI": Tải CV định dạng PDF lên, hệ thống sẽ phân tích, chấm điểm và gợi ý chỉnh sửa cụ thể.
   - "Luyện phỏng vấn AI": Phỏng vấn trực tiếp bằng tiếng Anh hoặc tiếng Việt theo từng chức vụ, cấp độ, nhận phản hồi chi tiết cho từng câu trả lời.
   - "Nạp Credit": Dùng để sử dụng dịch vụ AI (CV & Phỏng vấn).

Hãy trả lời bằng tiếng Việt một cách lịch sự, chuyên nghiệp, truyền cảm hứng và hữu ích.
Hãy định dạng câu trả lời bằng Markdown (ví dụ: dùng **in đậm**, các danh sách thụt lề, bảng biểu...) khi thích hợp để thông tin dễ đọc và trực quan.
Trả lời súc tích và tập trung vào câu hỏi của người dùng.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];

    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role && msg.content) {
          formattedMessages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          });
        }
      });
    }

    formattedMessages.push({ role: "user", content: message });

    // Use req.groqClient which is injected or fallback to groqService import
    const client = req.groqClient || groqService;
    const response = await client.chat(formattedMessages);
    
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Chatbot AI error:", error);
    return res.status(500).json({ error: error.message || "Lỗi khi xử lý chatbot AI" });
  }
}
