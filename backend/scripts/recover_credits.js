import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB for Recovery');

        const usersCollection = mongoose.connection.db.collection('users');
        
        const allUsers = await usersCollection.find().toArray();
        console.log(`Total users to recover: ${allUsers.length}`);

        let modifiedCount = 0;
        for (const user of allUsers) {
            const currentCredits = user.credits ?? 0;
            let recoveredCredits = currentCredits;

            if (currentCredits === 1) {
                recoveredCredits = 65; // Hầu hết user cũ có 65 credits
            } else if (currentCredits === 0) {
                recoveredCredits = 45; // Các tài khoản cũ có 40 - 45 credits
            } else {
                recoveredCredits = currentCredits * 100; // Nhân lại 100 lần cho các số lớn hơn
            }

            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { credits: recoveredCredits } }
            );
            modifiedCount++;
            console.log(`Recovered user ${user.email}: ${currentCredits} credits -> ${recoveredCredits} credits`);
        }

        console.log(`\n✅ Successfully recovered credits for ${modifiedCount} accounts.`);

        // In phân bổ credit sau khôi phục
        const creditGroups = await usersCollection.aggregate([
            { $group: { _id: "$credits", count: { $sum: 1 } } }
        ]).toArray();
        console.log("\nCredits distribution after recovery:", creditGroups);

        mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to run recovery:', error);
        process.exit(1);
    }
}

run();
