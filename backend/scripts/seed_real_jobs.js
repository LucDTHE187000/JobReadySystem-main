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
    const jobsCollection = db.collection('jobs');

    // 1. Cập nhật / Xác thực tài khoản của Borntrend / Phoebe (thephoebevietnam@gmail.com)
    console.log('🔄 Checking/Updating Borntrend / Phoebe profile...');
    let recruiter1 = await usersCollection.findOne({ email: 'thephoebevietnam@gmail.com' });
    if (!recruiter1) {
        console.log('➕ Creating thephoebevietnam@gmail.com...');
        const newRec1 = await usersCollection.insertOne({
            email: 'thephoebevietnam@gmail.com',
            name: 'The Phoe Be VN',
            role: 'EMPLOYER',
            isVerified: true,
            isApproved: true,
            isActive: true,
            credits: 160,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        recruiter1 = { _id: newRec1.insertedId };
    }
    
    await usersCollection.updateOne(
        { _id: recruiter1._id },
        {
            $set: {
                companyName: 'Borntrend & Phoebe Vietnam',
                companyDescription: 'Borntrend là đơn vị sản xuất và thiết kế thời trang may mặc cao cấp, sở hữu thương hiệu thời trang thiết kế Phoebe Vietnam với Atelier Room sang trọng tại 505 Minh Khai, Hà Nội.',
                companyWebsite: 'https://www.instagram.com/phoebevietnam?igsh=OW54ZDJtYW11bm0y&utm_source=qr',
                credits: 160,
                isApproved: true,
                isActive: true
            }
        }
    );

    // 2. Cập nhật / Xác thực tài khoản của BeatVN (phongptcd2@beatnetwork.vn)
    console.log('🔄 Checking/Updating BeatVN profile...');
    let recruiter2 = await usersCollection.findOne({ email: 'phongptcd2@beatnetwork.vn' });
    if (!recruiter2) {
        console.log('➕ Creating phongptcd2@beatnetwork.vn...');
        const newRec2 = await usersCollection.insertOne({
            email: 'phongptcd2@beatnetwork.vn',
            name: 'Phong PT',
            role: 'EMPLOYER',
            isVerified: true,
            isApproved: true,
            isActive: true,
            credits: 160,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        recruiter2 = { _id: newRec2.insertedId };
    }

    await usersCollection.updateOne(
        { _id: recruiter2._id },
        {
            $set: {
                companyName: 'Công ty Cổ phần BEAT Việt Nam',
                companyDescription: 'BEAT Việt Nam là đơn vị truyền thông & giải trí hàng đầu cho giới trẻ tại Việt Nam, sở hữu hệ sinh thái BEATVN với hàng triệu lượt theo dõi trên mạng xã hội.',
                companyWebsite: 'https://www.topcv.vn/cong-ty/cong-ty-co-phan-beat-viet-nam/153316.html',
                credits: 160,
                isApproved: true,
                isActive: true
            }
        }
    );

    // Xóa các job cũ của 2 nhà tuyển dụng này trước khi insert để tránh trùng lặp nếu chạy lại script
    console.log('🧹 Clearing existing jobs for Borntrend and BeatVN...');
    await jobsCollection.deleteMany({
        recruiterId: { $in: [recruiter1._id, recruiter2._id] }
    });

    // 3. Khai báo 4 công việc thật
    const newJobs = [
        // Job 1 (Phoebe)
        {
            recruiterId: recruiter1._id,
            title: 'Fashion Sales Stylist (English-Speaking)',
            description: 'Tư vấn và chốt đơn các sản phẩm váy thiết kế cao cấp (custom & ready-to-wear) cho khách hàng quốc tế. Styling cho khách hàng về form dáng, chất liệu và concept tổng thể qua chat & call. Theo sát quy trình từ lúc tư vấn đến fitting và hoàn thiện đơn hàng.',
            requirements: 'Giao tiếp tiếng Anh tốt (chat & call trôi chảy với khách nước ngoài). Có gu thẩm mỹ tốt, đam mê thời trang cao cấp và hiểu biết cơ bản về thời trang nữ. Có tư duy bán hàng nhạy bén, chủ động và có trách nhiệm.',
            jobType: 'full-time',
            salary: { min: 12000000, max: 15000000, currency: 'VND' },
            location: { city: 'Hà Nội', country: 'Việt Nam' },
            isPremium: true, // HOT
            sourcePlatform: 'JobReady',
            externalUrl: '',
            status: 'open',
            views: 45,
            applicationsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        // Job 2 (Borntrend)
        {
            recruiterId: recruiter1._id,
            title: 'Kế toán tổng hợp',
            description: 'Kiểm soát toàn bộ hoạt động kế toán phát sinh từ khâu sản xuất (nguyên vật liệu, gia công, giá thành) đến khâu kinh doanh bán lẻ ngành thời trang. Đối soát doanh thu từ các kênh bán lẻ (Website, Fanpage) và các đơn vị vận chuyển COD.',
            requirements: 'Tốt nghiệp Đại học chuyên ngành Kế toán/Kiểm toán. Tối thiểu 3 năm kinh nghiệm kế toán tổng hợp, bắt buộc có kinh nghiệm trong lĩnh vực may mặc/thời trang/bán lẻ. Sử dụng thành thạo MISA, Excel nâng cao, trung thực và chịu áp lực tốt.',
            jobType: 'full-time',
            salary: { min: 15000000, max: 20000000, currency: 'VND' },
            location: { city: 'Hà Nội', country: 'Việt Nam' },
            isPremium: true, // HOT
            sourcePlatform: 'JobReady',
            externalUrl: '',
            status: 'open',
            views: 32,
            applicationsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        // Job 3 (BeatVN)
        {
            recruiterId: recruiter2._id,
            title: 'Nhân viên Influencer Marketing',
            description: 'Tìm kiếm, làm việc và duy trì mối quan hệ hợp tác lâu dài với các Talent/Influencer tiềm năng. Theo dõi tiến trình ký kết hợp đồng, giám sát hiệu suất và KPIs tăng trưởng của các Talent trên các nền tảng mạng xã hội.',
            requirements: 'Có khả năng giao tiếp và đàm phán tốt. Hiểu biết sâu sắc về các xu hướng truyền thông mạng xã hội (TikTok, Facebook, Instagram). Ưu tiên ứng viên có kinh nghiệm làm việc với KOC/KOL hoặc trong các Agency truyền thông.',
            jobType: 'full-time',
            salary: { min: 10000000, max: 14000000, currency: 'VND' },
            location: { city: 'Hà Nội', country: 'Việt Nam' },
            isPremium: true, // HOT
            sourcePlatform: 'JobReady',
            externalUrl: '',
            status: 'open',
            views: 58,
            applicationsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        // Job 4 (BeatVN)
        {
            recruiterId: recruiter2._id,
            title: 'VJ nội dung giải trí đường phố',
            description: 'Sáng tạo nội dung, lên kịch bản và trực tiếp dẫn dắt các video phỏng vấn đường phố, video ngắn tương tác hài hước dành cho giới trẻ. Phối hợp với team sản xuất để sản xuất các series video bắt trend trên các nền tảng TikTok/Facebook của BEATVN.',
            requirements: 'Ngoại hình sáng, năng động, giọng nói rõ ràng, cuốn hút. Có khả năng hoạt ngôn, phản xạ nhanh và khiếu hài hước tự nhiên. Ưu tiên các bạn trẻ dưới 1 năm kinh nghiệm nhưng có thế mạnh về TikTok/Video ngắn.',
            jobType: 'full-time',
            salary: { min: 9000000, max: 12000000, currency: 'VND' },
            location: { city: 'Hà Nội', country: 'Việt Nam' },
            isPremium: true, // HOT
            sourcePlatform: 'JobReady',
            externalUrl: '',
            status: 'open',
            views: 74,
            applicationsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    // 4. Insert jobs
    console.log('➕ Inserting the 4 real jobs...');
    const result = await jobsCollection.insertMany(newJobs);
    console.log(`🎉 Successfully added ${result.insertedCount} real jobs into the database!`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
