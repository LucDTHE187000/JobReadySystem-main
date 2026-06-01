import mongoose from 'mongoose';
import InterviewSession from '../interview.model.js';
import CV from '../../cv/cv.model.js';

import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    console.log('CONNECTED TO MONGO');
    const latestSession = await InterviewSession.findOne().sort({ createdAt: -1 });
    if (!latestSession) {
        console.log('No sessions found!');
        mongoose.disconnect();
        return;
    }
    
    console.log(`Session ID: ${latestSession._id}`);
    console.log(`User ID: ${latestSession.userId}`);
    
    const cv = await CV.findOne({ userId: latestSession.userId }).sort({ createdAt: -1 });
    if (!cv) {
        console.log('No CV found for this user!');
    } else {
        console.log(`CV ID: ${cv._id}`);
        console.log(`CV Title: ${cv.title || 'Untitled'}`);
        console.log(`CV Skills:`, cv.skills);
        console.log(`CV Analysis score:`, cv.analysis?.score);
        console.log(`CV Text snippet:\n`, cv.cvText ? cv.cvText.substring(0, 1000) : 'No text');
    }
    mongoose.disconnect();
})
.catch(err => {
    console.error(err);
});
