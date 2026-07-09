import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

const REAL_RECRUITERS = [
    'thephoebeatelier@gmai.com',
    'quynhltnimedia@gmail.com',
    'minhloc1401@gmail.com',
    'thuhuyen2k66@gmail.com',
    'nguyenvana123@gmail.com',
    'nguyenthimai@gmail.com',
    'duongtronglucc9999@gmail.com',
    'thephoebevietnam@gmail.com'
];

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const realEmailsLower = REAL_RECRUITERS.map(e => e.toLowerCase().trim());

    // Set all recruiters to Pending
    console.log('🔄 Setting all 56 recruiters to Pending (isApproved: false, isActive: true, credits: 0)...');
    const result = await usersCollection.updateMany(
        { role: 'EMPLOYER' },
        {
            $set: {
                isApproved: false,
                isActive: true,
                credits: 0
            }
        }
    );
    console.log(`✅ Set ${result.modifiedCount} recruiters to Pending.`);

    // 3. Print out statistics
    const totalEmployers = await usersCollection.countDocuments({ role: 'EMPLOYER' });
    const approvedCount = await usersCollection.countDocuments({ role: 'EMPLOYER', isApproved: true });
    const pendingCount = await usersCollection.countDocuments({ role: 'EMPLOYER', isApproved: false });
    console.log(`📊 Recruiter Status Reset: Total=${totalEmployers}, Approved=${approvedCount}, Pending=${pendingCount}`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
