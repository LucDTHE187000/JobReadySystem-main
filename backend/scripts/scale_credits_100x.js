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
        
        const allUsers = await usersCollection.find().toArray();
        console.log(`Total users to migrate: ${allUsers.length}`);

        let modifiedCount = 0;
        for (const user of allUsers) {
            const oldCredits = user.credits ?? 6500;
            // Scale down by 100x and round to nearest integer
            const newCredits = Math.round(oldCredits / 100);

            await usersCollection.updateOne(
                { _id: user._id },
                { 
                    $set: { credits: newCredits },
                    // Ensure redeemedCodes is initialized if it doesn't exist
                    $setOnInsert: { redeemedCodes: [] }
                }
            );
            modifiedCount++;
            console.log(`Updated user ${user.email}: ${oldCredits} credits -> ${newCredits} credits`);
        }

        console.log(`\n✅ Successfully updated credits for ${modifiedCount} accounts.`);

        // Print final credits distribution
        const creditGroups = await usersCollection.aggregate([
            { $group: { _id: "$credits", count: { $sum: 1 } } }
        ]).toArray();
        console.log("\nNew credits distribution in DB:", creditGroups);

        mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to run migration:', error);
        process.exit(1);
    }
}

run();
