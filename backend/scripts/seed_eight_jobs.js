import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

// Email của Thuỷ - người quản lý tất cả 8 job agency
const AGENCY_MANAGER_EMAIL = 'thuynt1081980@gmail.com';

// Thông tin 8 job agency - mỗi job lưu agencyCompanyName để hiển thị công ty gốc
const JOBS_DATA = [
    // --- TOPCV ---
    {
        title: 'Data Engineer (Python/SQL/GenAI)',
        agencyCompanyName: 'Công ty TNHH FPT Software',
        description: 'Phát triển và tối ưu hóa hệ thống dữ liệu (Data Pipeline) cho các dự án lớn của FPT Software. Thiết kế kiến trúc dữ liệu và tích hợp các giải pháp trí tuệ nhân tạo tạo sinh (GenAI). Tham gia xử lý và làm sạch dữ liệu lớn (Big Data).',
        requirements: 'Python, SQL, Big Data / GenAI',
        jobType: 'full-time',
        salary: { min: 30000000, max: 70000000, currency: 'VND' },
        location: { city: 'Hà Nội', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'TopCV',
        externalUrl: 'https://www.topcv.vn/viec-lam/data-engineer/1172867.html'
    },
    {
        title: 'Chuyên viên Kinh doanh Phần mềm AMIS MISA',
        agencyCompanyName: 'Công ty Cổ phần MISA',
        description: 'Tư vấn và giới thiệu giải pháp quản trị doanh nghiệp hợp nhất AMIS MISA cho các khách hàng doanh nghiệp. Demo tính năng phần mềm, thương lượng ký kết hợp đồng và hỗ trợ khách hàng trong quá trình triển khai.',
        requirements: 'Giao tiếp tốt, Kỹ năng đàm phán, Đam mê kinh doanh công nghệ',
        jobType: 'full-time',
        salary: { min: 15000000, max: 35000000, currency: 'VND' },
        location: { city: 'Hà Nội', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'TopCV',
        externalUrl: 'https://www.topcv.vn/viec-lam/chuyen-vien-kinh-doanh-phan-mem-amis-misa/1199341.html'
    },
    // --- VIETNAMWORKS ---
    {
        title: 'Software Engineer (Embedded, MCU, RTOS)',
        agencyCompanyName: 'NashTech Vietnam',
        description: 'Phát triển phần mềm nhúng cho các thiết bị gia dụng và thông minh của LG. Thiết kế, lập trình vi điều khiển (MCU) sử dụng hệ điều hành thời gian thực (RTOS). Thực hiện kiểm thử và sửa lỗi phần mềm nhúng.',
        requirements: 'Embedded C, MCU, RTOS',
        jobType: 'full-time',
        salary: { min: 16000000, max: 55000000, currency: 'VND' },
        location: { city: 'Hà Nội', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'VietnamWorks',
        externalUrl: 'https://www.vietnamworks.com/software-engineer-embedded-mcu-rtos-1614050-jv'
    },
    {
        title: 'Automation Framework Developer (Python/Robot)',
        agencyCompanyName: 'KMS Technology',
        description: 'Xây dựng và phát triển khung kiểm thử tự động (Automation Framework) sử dụng Python và Robot Framework cho các thiết bị phần cứng của LG. Viết script kiểm thử tự động để tối ưu hóa chất lượng sản phẩm.',
        requirements: 'Python, Robot Framework, Automation Testing',
        jobType: 'full-time',
        salary: { min: 16000000, max: 38000000, currency: 'VND' },
        location: { city: 'Hà Nội', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'VietnamWorks',
        externalUrl: 'https://www.vietnamworks.com/automation-framework-developer-python-robot-framework-embedded-1610450-jv'
    },
    // --- LINKEDIN ---
    {
        title: 'Senior Software Engineer (Backend/Go/Java)',
        agencyCompanyName: 'Motorola Solutions',
        description: 'Thiết kế kiến trúc hệ thống backend chất lượng cao bằng ngôn ngữ Golang hoặc Java. Tối ưu hiệu năng, đảm bảo tính sẵn sàng và mở rộng cho các dịch vụ cốt lõi tại thị trường Đông Nam Á.',
        requirements: 'Java / Golang, Distributed Systems, High Performance',
        jobType: 'full-time',
        salary: { min: 45000000, max: 90000000, currency: 'VND' },
        location: { city: 'TP.HCM', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'LinkedIn',
        externalUrl: 'https://www.linkedin.com/jobs/view/392013387/'
    },
    {
        title: 'Backend Software Engineer (Grab/Java/Spring)',
        agencyCompanyName: 'KMS Technology',
        description: 'Tham gia thiết kế và lập trình các dịch vụ backend phục vụ hàng triệu người dùng tại Đông Nam Á của Grab. Xây dựng mã nguồn sạch, dễ bảo trì sử dụng Java và Spring Boot.',
        requirements: 'Java, Spring Boot, Microservices',
        jobType: 'full-time',
        salary: { min: 35000000, max: 70000000, currency: 'VND' },
        location: { city: 'TP.HCM', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'LinkedIn',
        externalUrl: 'https://www.linkedin.com/jobs/view/39111885/'
    },
    // --- VIECLAM24H ---
    {
        title: 'Nhân viên Lập trình PHP / Laravel',
        agencyCompanyName: 'Công ty Cổ phần Công nghệ ABC',
        description: 'Lập trình và bảo trì các hệ thống ứng dụng web sử dụng ngôn ngữ PHP và Framework Laravel. Tham gia phân tích thiết kế database và tối ưu hóa hệ thống cho khách hàng doanh nghiệp.',
        requirements: 'PHP / Laravel, MySQL, Git',
        jobType: 'full-time',
        salary: { min: 12000000, max: 25000000, currency: 'VND' },
        location: { city: 'Hà Nội', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'ViecLam24h',
        externalUrl: 'https://vieclam24h.vn/it-phan-mem/lap-trinh-vien-php-id2002341.html'
    },
    {
        title: 'Nhân viên Kế toán tổng hợp doanh nghiệp',
        agencyCompanyName: 'Công ty TNHH Công nghệ XYZ',
        description: 'Thực hiện kiểm tra chứng từ kế toán, đối soát sổ sách và lập báo cáo tài chính định kỳ. Trực tiếp làm việc với cơ quan thuế khi có yêu cầu và tối ưu chi phí thuế doanh nghiệp.',
        requirements: 'Kế toán tổng hợp, Kỹ năng Excel, Nghiệp vụ thuế',
        jobType: 'full-time',
        salary: { min: 10000000, max: 18000000, currency: 'VND' },
        location: { city: 'TP.HCM', country: 'Việt Nam' },
        isPremium: false,
        sourcePlatform: 'ViecLam24h',
        externalUrl: 'https://vieclam24h.vn/ke-toan/ke-toan-tong-hop-doanh-nghiep-id2002342.html'
    }
];

async function run() {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Connected.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const jobsCollection = db.collection('jobs');
    const applicationsCollection = db.collection('jobapplications');

    // 1. Tìm Thuỷ - người quản lý agency
    console.log(`🔍 Looking up agency manager: ${AGENCY_MANAGER_EMAIL}...`);
    const agencyManager = await usersCollection.findOne({ email: AGENCY_MANAGER_EMAIL });
    if (!agencyManager) {
        console.error(`❌ Agency manager not found: ${AGENCY_MANAGER_EMAIL}`);
        console.error('   Vui lòng đảm bảo tài khoản Nguyễn Thị Thuỷ đã được tạo trong hệ thống.');
        await mongoose.connection.close();
        return;
    }
    console.log(`✅ Found agency manager: ${agencyManager.name || agencyManager.email} (ID: ${agencyManager._id})`);

    // 2. Xóa 8 job agency cũ (chỉ xóa job có agencyCompanyName để không ảnh hưởng job thật)
    console.log('🧹 Clearing old agency jobs...');
    const deleteResult = await jobsCollection.deleteMany({ agencyCompanyName: { $exists: true, $ne: '' } });
    console.log(`✅ Cleared ${deleteResult.deletedCount} old agency jobs.`);

    // 3. Insert 8 job mới - tất cả thuộc về Thuỷ
    console.log(`➕ Inserting 8 agency jobs under ${agencyManager.name || AGENCY_MANAGER_EMAIL}...`);
    const jobsToInsert = JOBS_DATA.map(job => ({
        recruiterId: agencyManager._id,
        title: job.title,
        agencyCompanyName: job.agencyCompanyName,   // Tên công ty gốc hiển thị
        description: job.description,
        requirements: job.requirements,
        jobType: job.jobType,
        salary: job.salary,
        location: job.location,
        isPremium: job.isPremium,
        externalUrl: job.externalUrl,
        sourcePlatform: job.sourcePlatform,
        status: 'open',
        views: Math.floor(Math.random() * 50) + 10,
        applicationsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    const result = await jobsCollection.insertMany(jobsToInsert);
    console.log(`🎉 Successfully seeded ${result.insertedCount} agency jobs, all managed by ${agencyManager.name || AGENCY_MANAGER_EMAIL}!`);
    console.log(`   📬 Application notifications will be sent to: ${AGENCY_MANAGER_EMAIL}`);

    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
}

run().catch(console.error);
