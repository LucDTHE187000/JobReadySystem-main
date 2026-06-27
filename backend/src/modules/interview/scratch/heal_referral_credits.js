import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
.then(async () => {
    console.log('Successfully connected to MongoDB.');

    // Tìm tất cả user đã xác thực, có referredBy nhưng chưa xử lý referral bonus
    const usersToHeal = await UserModel.find({
        isVerified: true,
        referredBy: { $exists: true, $ne: null },
        referralBonusProcessed: false
    });

    console.log(`Found ${usersToHeal.length} users to heal.\n`);

    for (const user of usersToHeal) {
        console.log(`Healing user: ${user.name} (${user.email})`);
        
        // 1. Cộng 10 credit cho người được giới thiệu
        user.credits = (user.credits || 60) + 10;
        user.referralBonusProcessed = true;
        await user.save();
        console.log(`  -> Added 10 credits to referee ${user.name}. New credits: ${user.credits}`);

        // 2. Tìm người giới thiệu và cộng 15 credit
        const referrer = await UserModel.findById(user.referredBy);
        if (referrer) {
            referrer.credits = (referrer.credits || 60) + 15;
            await referrer.save();
            console.log(`  -> Added 15 credits to referrer ${referrer.name} (${referrer.email}). New credits: ${referrer.credits}`);

            // Gửi thông báo cho người giới thiệu
            try {
                const { NotificationService } = await import('../../notification/notification.service.js');
                await NotificationService.createNotification(
                    referrer._id,
                    "Nhận credit từ giới thiệu bạn bè (Hệ thống cập nhật bù)",
                    `Chúc mừng! Bạn đã được cộng bù +15 credits vì giới thiệu thành công ứng viên ${user.name}.`,
                    "system"
                );
                console.log(`  -> Created notification for referrer.`);
            } catch (notiErr) {
                console.error(`  -> Failed to create notification for referrer:`, notiErr.message);
            }
        } else {
            console.log(`  -> Referrer with ID ${user.referredBy} not found.`);
        }
    }

    console.log('\nHealing process completed.');
    mongoose.disconnect();
})
.catch(err => {
    console.error('Failed to connect to database:', err);
});
