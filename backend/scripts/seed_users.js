
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../src/modules/users/user.model.js';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

const DEFAULT_PASSWORD = 'Password123!';

async function seedUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        // JOBREADY
        console.log('Creating 30 JOBREADY...');
        const jobSeekers = [];
        for (let i = 1; i <= 30; i++) {
            jobSeekers.push({
                email: `candidate${i}@example.com`,
                password: DEFAULT_PASSWORD,
                name: `Candidate User ${i}`,
                role: 'JOBREADY',
                isVerified: true,
                phone: `09012345${i.toString().padStart(2, '0')}`,
                address: `Address ${i}, City`,
                resume: `https://example.com/resume${i}.pdf`,
                skills: ['JavaScript', 'React', 'Node.js'],
                experience: `${i} years of experience`
            });
        }

        // Employers
        console.log('Creating 30 Employers...');
        const employers = [];
        for (let i = 1; i <= 30; i++) {
            employers.push({
                email: `employer${i}@example.com`,
                password: DEFAULT_PASSWORD,
                name: `Employer User ${i}`,
                role: 'EMPLOYER',
                isVerified: true,
                phone: `09112345${i.toString().padStart(2, '0')}`,
                address: `Company Address ${i}, City`,
                companyName: `Company ${i} Inc.`,
                companyDescription: `We are a leading company in industry ${i}`,
                companyWebsite: `https://company${i}.com`
            });
        }

        // Batch insert
        // Note: UserModel has a pre-save hook to hash password. 
        // insertMany DOES trigger pre('save') if you pass { ordered: false, rawResult: false } options? 
        // NO, insertMany with mongoose bypasses middleware by default unless you loop and save or use specialized plugins.
        // However, the provided UserModel hash logic is in 'pre save'. 
        // To ensure passwords are hashed, we should either loop or manually hash here.
        // BUT! Since we are importing bcrypt util which might not be exposed easily or we don't want to duplicate logic...
        // Actually, let's just loop and create. It's only 60 records, performance is fine.

        // Better approach: Use UserModel.create() which triggers hooks.

        console.log('Saving JOBREADY...');
        for (const user of jobSeekers) {
            try {
                await UserModel.create(user);
            } catch (e) {
                if (e.code === 11000) console.log(`Skipping duplicate: ${user.email}`);
                else console.error(`Error creating ${user.email}:`, e.message);
            }
        }

        console.log('Saving Employers...');
        for (const user of employers) {
            try {
                await UserModel.create(user);
            } catch (e) {
                if (e.code === 11000) console.log(`Skipping duplicate: ${user.email}`);
                else console.error(`Error creating ${user.email}:`, e.message);
            }
        }

        // Admin account
        console.log('Creating Admin account...');
        try {
            await UserModel.create({
                email: 'admin@recruithub.com',
                password: DEFAULT_PASSWORD,
                name: 'Super Admin',
                role: 'ADMIN',
                isVerified: true,
                phone: '0901234500',
            });
        } catch (e) {
            if (e.code === 11000) console.log('Skipping duplicate: admin@recruithub.com');
            else console.error('Error creating admin:', e.message);
        }

        console.log('\n✅ Seeding completed!');
        console.log(
            `\n🔑 Login Credentials created:\n` +
            `   Job Seekers: candidate1@example.com -> candidate30@example.com\n` +
            `   Employers:   employer1@example.com -> employer30@example.com\n` +
            `   Admin:       admin@recruithub.com\n` +
            `   Password:    ${DEFAULT_PASSWORD}\n`
        );

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedUsers();
