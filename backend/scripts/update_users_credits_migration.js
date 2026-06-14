import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        const usersCollection = mongoose.connection.db.collection('users');
        
        // Find users with credits = 14000
        const count = await usersCollection.countDocuments({ credits: 14000 });
        console.log(`Found ${count} users with exactly 14,000 credits.`);

        if (count > 0) {
            const updateResult = await usersCollection.updateMany(
                { credits: 14000 },
                { $set: { credits: 6500 } }
            );
            console.log(`✅ Successfully updated ${updateResult.modifiedCount} accounts to 6,500 credits.`);
        } else {
            console.log('ℹ️ No accounts with exactly 14,000 credits were found.');
        }

        const allUsersCount = await usersCollection.countDocuments();
        console.log(`Total users in DB: ${allUsersCount}`);

        const creditGroups = await usersCollection.aggregate([
            { $group: { _id: "$credits", count: { $sum: 1 } } }
        ]).toArray();
        console.log("Current credits distribution in DB:", creditGroups);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to run migration:', error);
        process.exit(1);
    }
}

run();
