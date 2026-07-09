import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. If isApproved is undefined/null, set it to false
    const undefinedResult = await usersCollection.updateMany(
        {
            role: 'EMPLOYER',
            $or: [
                { isApproved: { $exists: false } },
                { isApproved: null }
            ]
        },
        { $set: { isApproved: false } }
    );
    console.log(`✅ Set isApproved: false for ${undefinedResult.modifiedCount} employers where it was undefined.`);

    // 2. Synchronize isActive for unapproved employers (isActive should match isApproved)
    const syncResult = await usersCollection.updateMany(
        { role: 'EMPLOYER', isApproved: false },
        { $set: { isActive: false } }
    );
    console.log(`✅ Synchronized isActive: false for ${syncResult.modifiedCount} unapproved employers.`);

    // 3. Print out statistics of approved vs unapproved
    const totalEmployers = await usersCollection.countDocuments({ role: 'EMPLOYER' });
    const approvedCount = await usersCollection.countDocuments({ role: 'EMPLOYER', isApproved: true });
    const pendingCount = await usersCollection.countDocuments({ role: 'EMPLOYER', isApproved: false });
    console.log(`📊 Recruiter Stats: Total=${totalEmployers}, Approved=${approvedCount}, Pending=${pendingCount}`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
