import mongoose from 'mongoose';
import InterviewSession from '../interview.model.js';
import InterviewQuestion from '../interviewQuestion.model.js';

import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

console.log('Connecting to MongoDB...');
mongoose.connect(mongoUri)
.then(async () => {
    console.log('CONNECTED!');
    
    // Find the latest completed session
    const latestSession = await InterviewSession.findOne().sort({ createdAt: -1 });
    if (!latestSession) {
        console.log('No sessions found!');
        mongoose.disconnect();
        return;
    }
    
    console.log(`Session ID: ${latestSession._id}`);
    console.log(`Job Title: ${latestSession.jobTitle}`);
    console.log(`Status: ${latestSession.status}`);
    console.log(`Average Score: ${latestSession.averageScore}`);
    
    // Get questions
    const questions = await InterviewQuestion.find({ sessionId: latestSession._id }).sort({ questionNumber: 1 });
    console.log('\n--- QUESTIONS IN DB ---');
    questions.forEach(q => {
        console.log(`Q${q.questionNumber}: Topic: [${q.topic}] | Type: [${q.questionType}] | Score: ${q.aiScore}`);
        console.log(`Text: ${q.questionText}`);
        console.log('---');
    });
    
    mongoose.disconnect();
})
.catch(err => {
    console.error('Connection failed:', err.message);
});
