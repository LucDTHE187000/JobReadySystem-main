import dotenv from 'dotenv';
dotenv.config();
process.env.N8N_USE_TEST_WEBHOOK = 'false';
import n8nInterviewService from '../../../services/n8nInterview.service.js';

const mockCVText = `
HỌ VÀ TÊN: DƯƠNG TRỌNG LỰC
Vị trí: Backend Developer (Java, Spring Boot, Node.js)
Kinh nghiệm: 2 năm làm việc tại công ty ABC. Xây dựng REST API, tối ưu hóa database MySQL.
Kỹ năng: Java, Spring Boot, Node.js, Express, MySQL, Git, Docker, REST API.
`;

console.log('Sending CV to N8N...');
n8nInterviewService.analyzeCV({
    text: mockCVText,
    cvText: mockCVText,
    jobDescription: 'Tuyển dụng Backend Developer Java Nodejs'
})
.then(res => {
    console.log('RAW RESPONSE FROM N8N:', JSON.stringify(res, null, 2));
})
.catch(err => {
    console.error('ERROR OCCURRED:', err.message);
});
