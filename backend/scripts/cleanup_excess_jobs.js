import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

// 3 tài khoản được phép có job trên hệ thống
const ALLOWED_EMAILS = [
    'thephoebevietnam@gmail.com',   // Borntrend / Phoebe - 2 job thật
    'phongptcd2@beatnetwork.vn',     // BeatVN             - 2 job thật
    'thuynt1081980@gmail.com',       // Nguyễn Thị Thuỷ   - 8 job agency
];

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const jobsCollection = db.collection('jobs');

    // 1. Lấy ID của 3 recruiter được phép
    const allowedRecruiters = await usersCollection
        .find({ email: { $in: ALLOWED_EMAILS } })
        .project({ _id: 1, email: 1, name: 1 })
        .toArray();

    console.log('📋 Recruiter được giữ lại:');
    allowedRecruiters.forEach(r => console.log(`  ✅ ${r.email} (${r._id})`));
    console.log();

    if (allowedRecruiters.length === 0) {
        console.error('❌ Không tìm thấy recruiter nào hợp lệ. Dừng lại.');
        await mongoose.connection.close();
        return;
    }

    const allowedIds = allowedRecruiters.map(r => r._id);

    // 2. Xem tất cả job hiện có
    const allJobs = await jobsCollection.find({}).project({
        title: 1, recruiterId: 1, agencyCompanyName: 1, sourcePlatform: 1
    }).toArray();

    console.log(`📊 Tổng số job hiện tại: ${allJobs.length}`);

    // 3. Phân loại job cần xóa
    const toKeep = allJobs.filter(j =>
        allowedIds.some(id => id.toString() === j.recruiterId?.toString())
    );
    const toDelete = allJobs.filter(j =>
        !allowedIds.some(id => id.toString() === j.recruiterId?.toString())
    );

    console.log(`\n✅ Giữ lại ${toKeep.length} job:`);
    toKeep.forEach(j => console.log(`  → ${j.title?.substring(0, 50)} | ${j.agencyCompanyName || '(real)'}`));

    console.log(`\n🗑️  Xóa ${toDelete.length} job dư:`);
    toDelete.forEach(j => console.log(`  ✕ ${j.title?.substring(0, 50)} | recruiter: ${j.recruiterId}`));

    if (toDelete.length === 0) {
        console.log('\n✨ Không có job dư nào cần xóa!');
        await mongoose.connection.close();
        return;
    }

    // 4. Xóa các job dư + applications liên quan
    const deleteIds = toDelete.map(j => j._id);
    const deleteResult = await jobsCollection.deleteMany({ _id: { $in: deleteIds } });

    // Xóa applications liên quan đến các job đã xóa
    const applicationsResult = await db.collection('jobapplications').deleteMany({
        jobId: { $in: deleteIds }
    });

    console.log(`\n🎉 Đã xóa ${deleteResult.deletedCount} job dư.`);
    console.log(`🎉 Đã xóa ${applicationsResult.deletedCount} đơn ứng tuyển liên quan.`);
    console.log(`\n📊 Tổng job còn lại trên hệ thống: ${toKeep.length} (mục tiêu: 12)`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
