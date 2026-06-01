import mongoose from 'mongoose';
import InterviewSession from '../interview.model.js';
import InterviewQuestion from '../interviewQuestion.model.js';

import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    const sessions = await InterviewSession.find().sort({ createdAt: -1 }).limit(5);
    for (const session of sessions) {
        console.log(`\n========================================`);
        console.log(`Session ID: ${session._id}`);
        console.log(`Job Title: ${session.jobTitle}`);
        console.log(`Job Category: ${session.jobCategory}`);
        console.log(`Status: ${session.status}`);
        console.log(`Created At: ${session.createdAt}`);
        
        const questions = await InterviewQuestion.find({ sessionId: session._id }).sort({ questionNumber: 1 });
        console.log('--- QUESTIONS ---');
        questions.forEach(q => {
            console.log(`Q${q.questionNumber} [${q.topic} - ${q.questionType}]: ${q.questionText} (Score: ${q.aiScore})`);
        });
    }
    mongoose.disconnect();
})
.catch(err => {
    console.error('Failed:', err);
});
