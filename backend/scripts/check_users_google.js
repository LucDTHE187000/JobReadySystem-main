import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://lucdthe187000_db_user:g0rUrXvyzLLCqoTg@cluster0.xvfay6c.mongodb.net/?appName=Cluster0";

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        // Define schema quickly
        const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
        const User = mongoose.model('User', userSchema);

        const allUsers = await User.find({});
        console.log(`Total users: ${allUsers.length}`);

        const googleUsers = allUsers.filter(u => u.googleId || u.authProvider === 'google');
        console.log(`Google users: ${googleUsers.length}`);

        const localUsers = allUsers.filter(u => u.authProvider === 'local' || !u.authProvider);
        console.log(`Local users: ${localUsers.length}`);

        // Check for googleId: null
        const nullGoogleIdUsers = allUsers.filter(u => u.googleId === null);
        console.log(`Users with googleId === null: ${nullGoogleIdUsers.length}`);
        if (nullGoogleIdUsers.length > 0) {
            console.log("Null googleId users:", nullGoogleIdUsers.map(u => ({ email: u.email, id: u._id })));
        }

        // Check for duplicate emails
        const emailCounts = {};
        allUsers.forEach(u => {
            if (u.email) {
                const email = u.email.toLowerCase().trim();
                emailCounts[email] = (emailCounts[email] || 0) + 1;
            }
        });
        const duplicateEmails = Object.keys(emailCounts).filter(e => emailCounts[e] > 1);
        console.log(`Duplicate emails count: ${duplicateEmails.length}`);
        if (duplicateEmails.length > 0) {
            console.log("Duplicate emails:", duplicateEmails);
        }

        // Check for duplicate googleIds
        const googleIdCounts = {};
        allUsers.forEach(u => {
            if (u.googleId) {
                googleIdCounts[u.googleId] = (googleIdCounts[u.googleId] || 0) + 1;
            }
        });
        const duplicateGoogleIds = Object.keys(googleIdCounts).filter(g => googleIdCounts[g] > 1);
        console.log(`Duplicate googleIds count: ${duplicateGoogleIds.length}`);
        if (duplicateGoogleIds.length > 0) {
            console.log("Duplicate googleIds:", duplicateGoogleIds);
        }

        // Print sample Google Users
        if (googleUsers.length > 0) {
            console.log("\nSample Google Users (first 5):");
            googleUsers.slice(0, 5).forEach(u => {
                console.log(`- Email: ${u.email}, Name: ${u.name}, googleId: ${u.googleId}, role: ${u.role}, isVerified: ${u.isVerified}`);
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

run();
