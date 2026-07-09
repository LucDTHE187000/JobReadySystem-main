import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../src/modules/users/user.model.js';
import { connectDatabase } from '../src/config/database.js';
import { hashPassword } from '../src/utils/bcrypt.util.js';

dotenv.config();

const DEFAULT_PASSWORD = 'Password123!';

const newUsersData = [
  // 35 Job Seekers (Clean profiles: no skills list, empty experience, no addresses)
  { name: "Nguyễn Văn Tú", email: "nguyenvantu@gmail.com", role: "JOB_SEEKER" },
  { name: "Trần Minh Quân", email: "tranminhquan@gmail.com", role: "JOB_SEEKER" },
  { name: "Lê Hoàng Nam", email: "lehoangnam@gmail.com", role: "JOB_SEEKER" },
  { name: "Phạm Đức Anh", email: "phamducanh@gmail.com", role: "JOB_SEEKER" },
  { name: "Ngô Gia Huy", email: "ngogiahuy@gmail.com", role: "JOB_SEEKER" },
  { name: "Vũ Quốc Bảo", email: "vuquocbao@gmail.com", role: "JOB_SEEKER" },
  { name: "Đặng Thành Công", email: "dangthanhcong@gmail.com", role: "JOB_SEEKER" },
  { name: "Hoàng Minh Đức", email: "hoangminhduc@gmail.com", role: "JOB_SEEKER" },
  { name: "Bùi Anh Tuấn", email: "buianhtuan@gmail.com", role: "JOB_SEEKER" },
  { name: "Đỗ Văn Long", email: "dovanlong@gmail.com", role: "JOB_SEEKER" },

  { name: "Nguyễn Thị Lan", email: "nguyenthilan@gmail.com", role: "JOB_SEEKER" },
  { name: "Trần Thu Hà", email: "tranthuha@gmail.com", role: "JOB_SEEKER" },
  { name: "Lê Ngọc Ánh", email: "lengocanh@gmail.com", role: "JOB_SEEKER" },
  { name: "Phạm Minh Châu", email: "phamminhchau@gmail.com", role: "JOB_SEEKER" },
  { name: "Võ Thị Hương", email: "vothihuong@gmail.com", role: "JOB_SEEKER" },
  { name: "Đinh Minh Khoa", email: "dinhminhkhoa@gmail.com", role: "JOB_SEEKER" },
  { name: "Mai Đức Thắng", email: "maiducthang@gmail.com", role: "JOB_SEEKER" },
  { name: "Tạ Thành Đạt", email: "tathanhdat@gmail.com", role: "JOB_SEEKER" },
  { name: "Lý Gia Bảo", email: "lygiabao@gmail.com", role: "JOB_SEEKER" },
  { name: "Phan Quốc Huy", email: "phanquochuy@gmail.com", role: "JOB_SEEKER" },

  { name: "Nguyễn Hải Đăng", email: "nguyeniadang@gmail.com", role: "JOB_SEEKER" },
  { name: "Trần Đức Mạnh", email: "tranducmanh@gmail.com", role: "JOB_SEEKER" },
  { name: "Lê Thanh Tùng", email: "lethanhtung@gmail.com", role: "JOB_SEEKER" },
  { name: "Phạm Quốc Việt", email: "phamquocviet@gmail.com", role: "JOB_SEEKER" },
  { name: "Ngô Minh Nhật", email: "ngominhnhat@gmail.com", role: "JOB_SEEKER" },
  { name: "Vũ Tuấn Anh", email: "vutuananh@gmail.com", role: "JOB_SEEKER" },
  { name: "Đặng Quốc Trung", email: "dangquoctrung@gmail.com", role: "JOB_SEEKER" },
  { name: "Hoàng Anh Dũng", email: "hoanganhdung@gmail.com", role: "JOB_SEEKER" },
  { name: "Bùi Gia Hưng", email: "buigiahung@gmail.com", role: "JOB_SEEKER" },
  { name: "Đỗ Thành Nam", email: "dothanhnam@gmail.com", role: "JOB_SEEKER" },

  { name: "Nguyễn Khánh Linh", email: "nguyenkhanhlinh@gmail.com", role: "JOB_SEEKER" },
  { name: "Trần Ngọc Mai", email: "tranngocmai@gmail.com", role: "JOB_SEEKER" },
  { name: "Lê Thu Trang", email: "lethutrang@gmail.com", role: "JOB_SEEKER" },
  { name: "Phạm Diệu Linh", email: "phamdieulinh@gmail.com", role: "JOB_SEEKER" },
  { name: "Mai Phương Anh", email: "maiphuonganh@gmail.com", role: "JOB_SEEKER" },

  // 15 Employers (mapped to realistic company info, clean profile)
  { name: "Võ Bảo Ngọc", email: "vobaongoc@gmail.com", role: "EMPLOYER", company: "Tiki Corporation", web: "https://tiki.vn", desc: "Nền tảng thương mại điện tử uy tín hàng đầu Việt Nam" },
  { name: "Đinh Thùy Dương", email: "dinhthuyduong@gmail.com", role: "EMPLOYER", company: "OneMount Group", web: "https://onemount.com", desc: "Tập đoàn kiến tạo hệ sinh thái công nghệ lớn nhất Việt Nam" },
  { name: "Tạ Minh Anh", email: "taminhanh@gmail.com", role: "EMPLOYER", company: "Base.vn", web: "https://base.vn", desc: "Nền tảng quản trị doanh nghiệp phổ biến nhất Việt Nam" },
  { name: "Lý Thanh Hằng", email: "lythanhhang@gmail.com", role: "EMPLOYER", company: "KiotViet", web: "https://kiotviet.vn", desc: "Phần mềm quản lý bán hàng phổ biến nhất với hơn 150.000 cửa hàng" },
  { name: "Phan Mỹ Linh", email: "phanmylinh@gmail.com", role: "EMPLOYER", company: "Cốc Cốc", web: "https://coccoc.com", desc: "Trình duyệt web và công cụ tìm kiếm của người Việt" },
  { name: "Nguyễn Quốc Khánh", email: "nqkhanh@gmail.com", role: "EMPLOYER", company: "Giao Hàng Tiết Kiệm", web: "https://giaohangtietkiem.vn", desc: "Đơn vị vận chuyển công nghệ chuyên nghiệp phủ sóng 63 tỉnh thành" },
  { name: "Trần Hoàng Sơn", email: "thson@gmail.com", role: "EMPLOYER", company: "Giao Hàng Nhanh", web: "https://ghn.vn", desc: "Dịch vụ giao hàng thương mại điện tử tiên phong tại Việt Nam" },
  { name: "Lê Minh Tuấn", email: "lmtuan@gmail.com", role: "EMPLOYER", company: "Zalo Group", web: "https://zalo.me", desc: "Ứng dụng nhắn tin và gọi điện miễn phí phổ biến nhất Việt Nam" },
  { name: "Phạm Gia Hưng", email: "pghung@gmail.com", role: "EMPLOYER", company: "Sendo", web: "https://sendo.vn", desc: "Siêu chợ sen đỏ - Sàn thương mại điện tử của Tập đoàn FPT" },
  { name: "Ngô Thành Luân", email: "ntluan@gmail.com", role: "EMPLOYER", company: "Haravan", web: "https://haravan.com", desc: "Giải pháp bán hàng đa kênh, thiết kế website thương mại điện tử chuyên nghiệp" },
  { name: "Vũ Minh Hoàng", email: "vmhoang@gmail.com", role: "EMPLOYER", company: "FE Credit", web: "https://fecredit.com.vn", desc: "Công ty tài chính tiêu dùng dẫn đầu thị trường Việt Nam" },
  { name: "Đặng Quang Huy", email: "dqhuy@gmail.com", role: "EMPLOYER", company: "Luxstay", web: "https://luxstay.com", desc: "Nền tảng đặt phòng homestay, biệt thự nghỉ dưỡng trực tuyến" },
  { name: "Hoàng Đức Long", email: "hdlong@gmail.com", role: "EMPLOYER", company: "TopCV Vietnam", web: "https://topcv.vn", desc: "Nền tảng công nghệ tuyển dụng hàng đầu Việt Nam" },
  { name: "Bùi Công Nam", email: "bcnam@gmail.com", role: "EMPLOYER", company: "Teko Vietnam", web: "https://teko.vn", desc: "Thành viên tập đoàn VNLIFE, chuyên xây dựng giải pháp công nghệ O2O" },
  { name: "Đỗ Nhật Minh", email: "dnhatminh@gmail.com", role: "EMPLOYER", company: "Vinamilk", web: "https://vinamilk.com.vn", desc: "Công ty Cổ phần Sữa Việt Nam - Thương hiệu dinh dưỡng hàng đầu nước nhà" }
];

// List of old static emails from previous run to clean up
const oldStaticEmails = [
    "quang.pham.tech@gmail.com", "huong.nguyen.sales@gmail.com", "son.le.dev@gmail.com", "trang.tran.marketing@gmail.com", "nam.bui.biz@gmail.com", "linh.vu.design@gmail.com", "bao.do.sys@gmail.com", "hanh.hoang.media@gmail.com", "khanh.ngo.dev@gmail.com", "truc.phan.hr@gmail.com", "triet.ly.data@gmail.com", "dang.dang.sales@gmail.com", "mai.trinh.writer@gmail.com", "nam.dinh.code@gmail.com", "dung.phung.networks@gmail.com", "chi.lam.tester@gmail.com", "khang.doan.biz@gmail.com", "thao.mai.content@gmail.com", "hung.to.dev@gmail.com", "van.vuong.sales@gmail.com", "tuan.ta.systems@gmail.com", "ha.cao.design@gmail.com", "khanh.diep.data@gmail.com", "kiet.luong.dev@gmail.com", "chau.ho.marketing@gmail.com", "vinh.truong.hr@gmail.com", "anh.quach.admin@gmail.com", "huy.duong.coder@gmail.com", "hang.phi.sales@gmail.com", "tuan.viet.analyst@gmail.com", "dat.giap.dev@gmail.com", "tri.kong.networks@gmail.com", "huong.trieu.hr@gmail.com", "long.thai.biz@gmail.com", "my.ton.design@gmail.com", "bao.nguyen@tiki.vn", "anh.le@onemount.com", "duc.tran@base.vn", "hang.pham@kiotviet.com", "tuan.hoang@coccoc.com", "manh.vu@ghtk.vn", "trang.do@ghn.vn", "khanh.bui@zalo.me", "nhung.ngo@sendo.vn", "thinh.phan@haravan.com", "hoang.ly@fecredit.com.vn", "thao.dang@luxstay.com", "nam.trinh@topcv.vn", "hai.dinh@teko.vn", "linh.phung@vinamilk.com.vn"
];

// Target dates: June 13, 14, 15
const targetDays = [
    new Date("2026-06-13T00:00:00Z"),
    new Date("2026-06-14T00:00:00Z"),
    new Date("2026-06-15T00:00:00Z")
];

function generateRandomDate(index) {
    const baseDay = targetDays[index % targetDays.length];
    const hour = 8 + Math.floor(Math.random() * 14); // 8 to 21
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const date = new Date(baseDay);
    date.setUTCHours(hour, minute, second);
    return date;
}

async function runMigrationAndSeed() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        // TASK 1: Migrate all existing users who do not have the credits field
        console.log('🔄 Checking & migrating missing credits field...');
        const usersCollection = mongoose.connection.db.collection('users');
        
        const missingCreditsCount = await usersCollection.countDocuments({
            $or: [
                { credits: { $exists: false } },
                { credits: null }
            ]
        });
        console.log(`Found ${missingCreditsCount} users without credits.`);

        if (missingCreditsCount > 0) {
            const updateResult = await usersCollection.updateMany(
                {
                    $or: [
                        { credits: { $exists: false } },
                        { credits: null }
                    ]
                },
                { $set: { credits: 6500 } }
            );
            console.log(`✅ Successfully updated ${updateResult.modifiedCount} accounts to 6,500 credits.`);
        } else {
            console.log('ℹ️ All existing accounts already have credits.');
        }

        // TASK 2: Clean up any previously seeded accounts from this 50-batch (both old static & new exact list)
        const newEmailsList = newUsersData.map(u => u.email.toLowerCase().trim());
        const allEmailsToDelete = [...oldStaticEmails, ...newEmailsList];

        const deleteBatchResult = await usersCollection.deleteMany({
            email: { $in: allEmailsToDelete }
        });
        console.log(`🧹 Cleaned up ${deleteBatchResult.deletedCount} old/duplicate batch accounts.`);

        // TASK 3: Hash password and map the 50 new documents
        console.log('Preparing 50 new realistic accounts...');
        const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

        const docsToInsert = newUsersData.map((u, i) => {
            const timestamp = generateRandomDate(i);
            const doc = {
                email: u.email.toLowerCase().trim(),
                password: hashedPassword,
                name: u.name,
                role: u.role,
                isVerified: true,
                isActive: true,
                isApproved: true,
                isMock: true,
                phone: '',
                address: '',
                credits: 6500,
                createdAt: timestamp,
                updatedAt: timestamp
            };

            if (u.role === 'JOB_SEEKER') {
                doc.skills = [];
                doc.experience = '';
            } else if (u.role === 'EMPLOYER') {
                doc.companyName = u.company;
                doc.companyDescription = u.desc;
                doc.companyWebsite = u.web;
            }

            return doc;
        });

        console.log('Inserting 50 new accounts into database...');
        const insertResult = await usersCollection.insertMany(docsToInsert);
        console.log(`🎉 Successfully seeded ${insertResult.insertedCount} new realistic accounts directly to MongoDB!`);

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration and Seeding failed:', error);
        process.exit(1);
    }
}

runMigrationAndSeed();
