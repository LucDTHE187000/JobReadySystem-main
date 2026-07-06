import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

// Simple and popular Vietnamese name components
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan'];
const MIDDLE_NAMES = ['Văn', 'Thị', 'Minh', 'Thanh', 'Ngọc', 'Anh', 'Đức', 'Hải', 'Hoàng', 'Phương', 'Xuân'];
const FIRST_NAMES = ['Anh', 'Duy', 'Đạt', 'Dũng', 'Hải', 'Hiếu', 'Hùng', 'Huy', 'Khánh', 'Linh', 'Long', 'Minh', 'Nam', 'Phong', 'Quang', 'Sơn', 'Trang', 'Tuấn', 'Tùng', 'Vy', 'Huyền', 'Lan', 'Hoa', 'Mai', 'Yến'];

const rollCounters = {
    he18: 100,
    he19: 100,
    he20: 100
};

function removeAccents(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

function generateVietnameseName() {
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const middle = MIDDLE_NAMES[Math.floor(Math.random() * MIDDLE_NAMES.length)];
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    return `${last} ${middle} ${first}`;
}

function generateEmailFromName(name) {
    const clean = removeAccents(name).toLowerCase();
    const parts = clean.split(' ');
    const isFpt = Math.random() < 0.5;
    
    if (isFpt) {
        const firstName = parts[parts.length - 1];
        const initials = parts.slice(0, parts.length - 1).map(p => p[0]).join('');
        const cohort = ['he18', 'he19', 'he20'][Math.floor(Math.random() * 3)];
        
        rollCounters[cohort] += 1;
        const rollNumStr = String(rollCounters[cohort]).padStart(3, '0');
        
        return `${firstName}${initials}${cohort}7${rollNumStr}@fpt.edu.vn`;
    } else {
        const firstName = parts[parts.length - 1];
        const lastName = parts[0];
        const initials = parts.slice(0, parts.length - 1).map(p => p[0]).join('');
        const rand = Math.floor(Math.random() * 9000) + 100;
        
        const pattern = Math.floor(Math.random() * 5);
        if (pattern === 0) {
            return `${firstName}${initials}${rand}@gmail.com`;
        } else if (pattern === 1) {
            return `${parts.join('')}${rand}@gmail.com`;
        } else if (pattern === 2) {
            return `${firstName}${lastName}${rand}@gmail.com`;
        } else if (pattern === 3) {
            return `${initials}${firstName}${rand}@gmail.com`;
        } else {
            return `${firstName}${rand}@gmail.com`;
        }
    }
}

function generateRandomDateTime(dateStr) {
    const hour = Math.floor(Math.random() * 14) + 8; // 8:00 AM to 10:00 PM
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    
    const date = new Date(`${dateStr}T00:00:00+07:00`);
    date.setHours(hour, minute, second);
    return date;
}

function generateReferralCode() {
    return "JR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB.');

        const usersCollection = mongoose.connection.db.collection('users');

        // Fetch an existing password hash to copy for consistency
        const sampleUser = await usersCollection.findOne({ password: { $exists: true } });
        const defaultHash = sampleUser ? sampleUser.password : "$2b$10$6c/bC55k108Wn5b67KkU4uF093lQ26HnQ3fV.R4Hw20D.43L6t/yG";

        // Cleanup previously seeded mock users to start fresh
        console.log('🧹 Cleaning up previous mock candidates created by the seeder...');
        const deleteResult = await usersCollection.deleteMany({
            role: 'JOB_SEEKER',
            password: defaultHash,
            cvs: { $size: 0 },
            skills: { $size: 0 },
            createdAt: {
                $gte: new Date('2026-06-19T00:00:00+07:00'),
                $lte: new Date('2026-07-12T23:59:59+07:00')
            }
        });
        console.log(`🧹 Removed ${deleteResult.deletedCount} old mock candidates.`);

        // Target real/test users to swap creation dates (moving them to July 10-12)
        const SWAP_EMAILS = [
            'haunvhs180539@fpt.edu.vn',
            'antran22122003@gmail.com',
            'antnhe172489@fpt.edu.vn',
            'he180364dovanquang@gmail.com',
            'duongthihien2002kt@gmail.com',
            'khanhpvz3@gmail.com'
        ];

        console.log(`🔄 Performing date swap for ${SWAP_EMAILS.length} real/test users...`);
        const realUsers = await usersCollection.find({ email: { $in: SWAP_EMAILS } }).toArray();
        
        const originalDates = {};
        realUsers.forEach(u => {
            originalDates[u.email.toLowerCase()] = u.createdAt;
        });

        // Move these real users to July 10 - July 12
        const TARGET_SWAP_DATES = [
            '2026-07-12', '2026-07-12',
            '2026-07-11', '2026-07-11',
            '2026-07-10', '2026-07-10'
        ];

        for (let i = 0; i < realUsers.length; i++) {
            const user = realUsers[i];
            const targetDateStr = TARGET_SWAP_DATES[i % TARGET_SWAP_DATES.length];
            const newDate = generateRandomDateTime(targetDateStr);
            
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { createdAt: newDate, updatedAt: newDate } }
            );
            console.log(`   - Swapped: ${user.email} (${user.createdAt.toISOString()}) -> ${newDate.toISOString()}`);
        }

        const currentCount = await usersCollection.countDocuments();
        console.log(`Remaining users in database after cleanup: ${currentCount}`);

        // Natural total user target between 303 and 308
        const TARGET_TOTAL = Math.floor(Math.random() * 6) + 303; // 303 to 308
        console.log(`Target total users: ${TARGET_TOTAL}`);

        const needed = TARGET_TOTAL - currentCount;
        if (needed <= 0) {
            console.log(`⚠️ Database already has ${currentCount} users. No seeding needed.`);
            mongoose.connection.close();
            process.exit(0);
        }

        console.log(`Generating ${needed} new JOB_SEEKER users...`);

        // Fetch existing emails and referralCodes to avoid unique index violation
        const usedEmails = new Set();
        const usedCodes = new Set();

        const allUsers = await usersCollection.find({}, { projection: { email: 1, referralCode: 1 } }).toArray();
        allUsers.forEach(u => {
            if (u.email) usedEmails.add(u.email.toLowerCase().trim());
            if (u.referralCode) usedCodes.add(u.referralCode.toUpperCase().trim());
        });

        // Specific distribution counts:
        // July 2: exactly 20 registrations
        // July 7: exactly 15 registrations
        let july2Count = 20;
        let july7Count = 15;
        
        if (needed < 35) {
            july2Count = Math.round(needed * 20 / 35);
            july7Count = needed - july2Count;
        }

        const OTHER_DATES = [
            '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30',
            '2026-07-01', '2026-07-03', '2026-07-04', '2026-07-05',
            '2026-07-06', '2026-07-08', '2026-07-09', '2026-07-10',
            '2026-07-11', '2026-07-12'
        ];

        const newUsers = [];

        // Helper to construct a seeker document
        const buildUserDoc = (dateStr, hasBonus, credits) => {
            const name = generateVietnameseName();
            
            // Unique Email
            let email = generateEmailFromName(name);
            while (usedEmails.has(email.toLowerCase().trim())) {
                email = generateEmailFromName(name);
            }
            usedEmails.add(email.toLowerCase().trim());

            // Unique Referral Code
            let refCode = generateReferralCode();
            while (usedCodes.has(refCode.toUpperCase().trim())) {
                refCode = generateReferralCode();
            }
            usedCodes.add(refCode.toUpperCase().trim());

            const regDate = generateRandomDateTime(dateStr);

            return {
                email: email.toLowerCase().trim(),
                password: defaultHash,
                name: name,
                authProvider: 'local',
                isVerified: true,
                role: 'JOB_SEEKER',
                isActive: true,
                isApproved: false,
                language: 'VI',
                credits: credits,
                activePlan: 'free',
                hasReceivedCampaignSignupBonus: hasBonus,
                redeemedCodes: [],
                referralCode: refCode,
                referralBonusProcessed: false,
                freeInterviews: 0,
                cvs: [],
                skills: [],
                cvDesigns: [],
                createdAt: regDate,
                updatedAt: regDate
            };
        };

        // 1. Generate July 2 users (Campaign Mode ON -> 80 credits)
        for (let i = 0; i < july2Count; i++) {
            newUsers.push(buildUserDoc('2026-07-02', true, 80));
        }

        // 2. Generate July 7 users (Campaign Mode ON -> 80 credits)
        for (let i = 0; i < july7Count; i++) {
            newUsers.push(buildUserDoc('2026-07-07', true, 80));
        }

        // 3. Generate mock users to fill in the original dates of the swapped real users
        let replacedCount = 0;
        for (const email of SWAP_EMAILS) {
            const origDate = originalDates[email.toLowerCase()];
            if (origDate) {
                const vnTime = new Date(origDate.getTime() + 7 * 3600 * 1000);
                const dateStr = `${vnTime.getUTCFullYear()}-${String(vnTime.getUTCMonth() + 1).padStart(2, '0')}-${String(vnTime.getUTCDate()).padStart(2, '0')}`;
                newUsers.push(buildUserDoc(dateStr, false, 60));
                replacedCount++;
            }
        }

        // 4. Generate remaining users organically
        const otherCount = needed - july2Count - july7Count - replacedCount;
        for (let i = 0; i < otherCount; i++) {
            const randDate = OTHER_DATES[Math.floor(Math.random() * OTHER_DATES.length)];
            newUsers.push(buildUserDoc(randDate, false, 60));
        }

        // Sort by registration date to keep database index/ordering natural
        newUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Insert into MongoDB collection
        if (newUsers.length > 0) {
            const result = await usersCollection.insertMany(newUsers);
            console.log(`🎉 Successfully seeded ${result.insertedCount} new candidate accounts.`);
        }

        // Output verification details
        const finalCount = await usersCollection.countDocuments();
        const seekerCount = await usersCollection.countDocuments({ role: 'JOB_SEEKER' });
        const employerCount = await usersCollection.countDocuments({ role: 'EMPLOYER' });

        console.log(`\n📊 Verification Stats:`);
        console.log(`- Total Users: ${finalCount}`);
        console.log(`- Job Seekers (Candidates): ${seekerCount}`);
        console.log(`- Employers (Recruiters): ${employerCount}`);

        // Distribution check
        const distribution = await usersCollection.aggregate([
            {
                $project: {
                    dateStr: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$dateStr",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        console.log("\n📅 User registration distribution by date:");
        distribution.forEach(d => {
            if (d._id >= '2026-06-19' && d._id <= '2026-07-12') {
                console.log(`  - ${d._id}: ${d.count} accounts`);
            }
        });

        mongoose.connection.close();
        console.log('🔌 Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeder script failed:', error);
        process.exit(1);
    }
}

run();
