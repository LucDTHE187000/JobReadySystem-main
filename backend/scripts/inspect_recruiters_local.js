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

    const recruiters = await usersCollection.find({ role: 'EMPLOYER' }).toArray();
    console.log(`Found ${recruiters.length} recruiters:`);
    recruiters.forEach(r => {
        console.log(`- Email: ${r.email}, Name: ${r.name}, isApproved: ${r.isApproved}, isActive: ${r.isActive}, isVerified: ${r.isVerified}`);
    });

    await mongoose.connection.close();
    console.log('🔌 Closed connection.');
}

run().catch(console.error);
