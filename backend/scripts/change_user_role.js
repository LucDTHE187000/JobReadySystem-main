import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

const TARGET_EMAIL = 'thephoebevietnam@gmail.com';

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: TARGET_EMAIL.toLowerCase().trim() });
    if (!user) {
        console.error(`❌ User not found: ${TARGET_EMAIL}`);
        await mongoose.connection.close();
        return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email}) | Current Role: ${user.role}`);

    // Update role to EMPLOYER, isApproved to false (so you can approve it), isMock to false, and add companyName placeholder
    console.log('🔄 Updating user role to EMPLOYER and resetting approval state...');
    const result = await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                role: 'EMPLOYER',
                isApproved: false,
                isMock: false,
                companyName: 'The Phoe Be VN',
                companyDescription: 'Đang cập nhật...',
                companyWebsite: '',
                credits: 60 // Reset or keep credit
            },
            $unset: {
                cvs: '',
                skills: '',
                experience: '',
                education: ''
            }
        }
    );

    if (result.modifiedCount > 0) {
        console.log(`🎉 Successfully converted ${TARGET_EMAIL} to EMPLOYER!`);
        console.log('👉 You can now go to the Admin Dashboard under "Duyệt doanh nghiệp" -> "Chờ duyệt" to approve this account.');
    } else {
        console.log('⚠️ No modifications were made.');
    }

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
