import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    const users = await UserModel.find({});
    console.log(`Found ${users.length} users:`);
    for (const user of users) {
        console.log(`- ${user.name} (${user.email}) ID: ${user._id}`);
        console.log(`  CV count: ${user.cvs ? user.cvs.length : 0}`);
        if (user.cvs && user.cvs.length > 0) {
            user.cvs.forEach((cv, idx) => {
                console.log(`    CV #${idx + 1}: ${cv.fileName} (Score: ${cv.analysis ? cv.analysis.score : 'N/A'})`);
            });
        }
    }
    mongoose.disconnect();
})
.catch(err => {
    console.error('Failed:', err);
});
