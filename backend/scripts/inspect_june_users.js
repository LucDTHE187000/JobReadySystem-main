import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

async function run() {
    try {
        await connectDatabase();
        const usersCollection = mongoose.connection.db.collection('users');

        const users = await usersCollection.find({
            createdAt: {
                $gte: new Date('2026-06-19T00:00:00+07:00'),
                $lte: new Date('2026-06-27T23:59:59+07:00')
            }
        }).sort({ createdAt: 1 }).toArray();

        console.log(`\nFound ${users.length} users registered between June 19 and June 27:`);
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Date: ${u.createdAt.toISOString()}`);
        });

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}
run();
