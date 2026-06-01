import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';

import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    const users = await UserModel.find();
    for (const user of users) {
        console.log(`\n========================================`);
        console.log(`User ID: ${user._id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`CVS count: ${user.cvs ? user.cvs.length : 0}`);
        if (user.cvs && user.cvs.length > 0) {
            user.cvs.forEach((cv, idx) => {
                console.log(`  CV #${idx + 1}:`);
                console.log(`    File Name: ${cv.fileName}`);
                console.log(`    Uploaded At: ${cv.uploadedAt}`);
                console.log(`    Analysis Score: ${cv.analysis ? cv.analysis.score : 'N/A'}`);
                if (cv.analysis) {
                    console.log(`    Analysis Skills: ${JSON.stringify(cv.analysis.skills)}`);
                    console.log(`    Analysis Recommended Topics: ${JSON.stringify(cv.analysis.recommendedInterviewTopics)}`);
                    console.log(`    Analysis Experience Level: ${cv.analysis.experienceLevel}`);
                }
            });
        }
    }
    mongoose.disconnect();
})
.catch(err => {
    console.error('Failed:', err);
});
