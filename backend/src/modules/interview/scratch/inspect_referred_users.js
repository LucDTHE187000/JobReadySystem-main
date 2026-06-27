import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    console.log('Successfully connected to MongoDB.');

    // 1. Tìm tất cả user có referredBy
    const referredUsers = await UserModel.find({ referredBy: { $exists: true, $ne: null } })
        .populate('referredBy', 'name email credits referralCode')
        .lean();

    console.log(`\nFound ${referredUsers.length} users registered with a referral code:\n`);
    for (const u of referredUsers) {
        console.log('--------------------------------------------------');
        console.log(`Referee (Người được giới thiệu):`);
        console.log(`  - Name: ${u.name}`);
        console.log(`  - Email: ${u.email}`);
        console.log(`  - Credits: ${u.credits}`);
        console.log(`  - Verified: ${u.isVerified}`);
        console.log(`  - referralBonusProcessed: ${u.referralBonusProcessed}`);
        console.log(`Referrer (Người giới thiệu):`);
        if (u.referredBy) {
            console.log(`  - Name: ${u.referredBy.name}`);
            console.log(`  - Email: ${u.referredBy.email}`);
            console.log(`  - Credits: ${u.referredBy.credits}`);
            console.log(`  - Referral Code: ${u.referredBy.referralCode}`);
        } else {
            console.log(`  - (Referrer not found by ID: ${u.referredBy})`);
        }
    }

    // 2. In ra 5 user bất kỳ có mã giới thiệu
    const usersWithCodes = await UserModel.find({ referralCode: { $exists: true } }).limit(5).lean();
    console.log(`\nSample 5 users with referral codes:`);
    usersWithCodes.forEach(u => {
        console.log(`  - User: ${u.name} | Code: ${u.referralCode} | Credits: ${u.credits}`);
    });

    mongoose.disconnect();
})
.catch(err => {
    console.error('Failed to connect to database:', err);
});
