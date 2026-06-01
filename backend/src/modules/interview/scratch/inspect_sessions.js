import mongoose from 'mongoose';
import InterviewSession from '../interview.model.js';
import InterviewQuestion from '../interviewQuestion.model.js';

import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    console.log('CONNECTED TO MONGO');
    const sessions = await InterviewSession.find().sort({ createdAt: -1 }).limit(5);
    for (let session of sessions) {
        console.log(`\n==========================================`);
        console.log(`SESSION ID: ${session._id}`);
        console.log(`Job Title: ${session.jobTitle}`);
        console.log(`Job Category: ${session.jobCategory}`);
        console.log(`Interview Type: ${session.interviewType}`);
        console.log(`Created At: ${session.createdAt}`);
        
        const questions = await InterviewQuestion.find({ sessionId: session._id }).sort({ questionNumber: 1 });
        console.log(`Questions count: ${questions.length}`);
        questions.forEach(q => {
            console.log(`  - Q${q.questionNumber} [Type: ${q.questionType}] [Topic: ${q.topic}]: ${q.questionText}`);
        });
    }
    mongoose.disconnect();
})
.catch(err => {
    console.error(err);
});
