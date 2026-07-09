import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

const KNOWN_REAL_EMAILS = [
    // Real candidates
    'haunvhs180539@fpt.edu.vn',
    'antran22122003@gmail.com',
    'antnhe172489@fpt.edu.vn',
    'he180364dovanquang@gmail.com',
    'duongthihien2002kt@gmail.com',
    'khanhpvz3@gmail.com',
    // Real recruiters & test recruiters
    'thephoebeatelier@gmai.com',
    'quynhltnimedia@gmail.com',
    'minhloc1401@gmail.com',
    'thuhuyen2k66@gmail.com',
    'nguyenvana123@gmail.com',
    'nguyenthimai@gmail.com',
    'duongtronglucc9999@gmail.com',
    'nhatuyendung@gmail.com'
];

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Automatically find all Admin emails to ensure they are marked as real
    const adminUsers = await usersCollection.find({ role: 'ADMIN' }).toArray();
    const adminEmails = adminUsers.map(u => u.email.toLowerCase().trim());
    console.log(`👑 Found ${adminEmails.length} Admin accounts:`, adminEmails);

    const allRealEmails = [
        ...KNOWN_REAL_EMAILS.map(e => e.toLowerCase().trim()),
        ...adminEmails
    ];

    // 1. Mark real users
    console.log('🔄 Setting isMock: false for real users...');
    const realResult = await usersCollection.updateMany(
        { email: { $in: allRealEmails } },
        { $set: { isMock: false } }
    );
    console.log(`✅ Updated ${realResult.modifiedCount} real users.`);

    // 2. Mark mock users
    console.log('🔄 Setting isMock: true for all other users...');
    const mockResult = await usersCollection.updateMany(
        { email: { $nin: allRealEmails } },
        { $set: { isMock: true } }
    );
    console.log(`✅ Updated ${mockResult.modifiedCount} mock users.`);

    // 3. Inspect final state
    const totalCount = await usersCollection.countDocuments();
    const mockCount = await usersCollection.countDocuments({ isMock: true });
    const realCount = await usersCollection.countDocuments({ isMock: { $ne: true } });
    console.log(`📊 DB Summary: Total=${totalCount}, Mock=${mockCount}, Real=${realCount}`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
