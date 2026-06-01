import mongoose from 'mongoose';
import InterviewController from '../interview.controller.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

async function run() {
    await mongoose.connect(mongoUri);
    console.log('CONNECTED TO MONGO');

    const controller = InterviewController;

    const mockReq = {
        user: {
            userId: "664878a8fc5863c0a52bb888" // Replace with a valid user ID if needed, or let it load
        },
        body: {
            sessionId: "6a0c71fdfdec603c35fb0dcd", // sales session
            position: "Nhân viên bán hàng",
            level: "Fresher",
            cv: "Họ và tên: Nguyễn Văn A. Vị trí: Nhân viên bán hàng. Kinh nghiệm: 2 năm bán lẻ và tư vấn khách hàng.",
            answer: ""
        }
    };

    // Find the latest user to get a real userId
    const latestSession = await mongoose.model('InterviewSession').findOne().sort({ createdAt: -1 });
    const userId = latestSession ? latestSession.userId : new mongoose.Types.ObjectId();
    
    // Create a new sales session
    const newSession = new (mongoose.model('InterviewSession'))({
        userId: userId,
        jobTitle: "Nhân viên bán hàng",
        jobCategory: "Sales",
        interviewType: "Behavioral",
        totalQuestions: 10,
        questions: [],
        answeredQuestions: 0
    });
    await newSession.save();
    
    mockReq.user.userId = userId.toString();
    mockReq.body.sessionId = newSession._id.toString();
    console.log(`Created NEW Session ID: ${mockReq.body.sessionId}, User ID: ${mockReq.user.userId}`);

    const mockRes = {
        status(code) {
            console.log(`STATUS CODE: ${code}`);
            return this;
        },
        json(data) {
            console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));
            return this;
        }
    };

    try {
        await controller.generateQuestion(mockReq, mockRes);
    } catch (err) {
        console.error('Controller error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
