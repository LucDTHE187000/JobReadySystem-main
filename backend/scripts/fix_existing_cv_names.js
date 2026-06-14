import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database.js';

dotenv.config();

function fixLatin1String(str) {
  if (!str) return str;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return str;
    }
  }
  try {
    const converted = Buffer.from(str, 'binary').toString('utf8');
    if (converted !== str && !converted.includes('\ufffd')) {
      return converted;
    }
  } catch (e) {
    // Ignore error
  }
  return str;
}

async function run() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        const usersCollection = mongoose.connection.db.collection('users');
        
        // Fetch all users with CVs
        const users = await usersCollection.find({ cvs: { $exists: true, $not: { $size: 0 } } }).toArray();
        console.log(`Found ${users.length} users with CVs.`);

        let updatedCount = 0;

        for (const user of users) {
            let userUpdated = false;
            const updatedCvs = user.cvs.map(cv => {
                const originalName = cv.fileName;
                const fixedName = fixLatin1String(originalName);
                if (fixedName !== originalName) {
                    console.log(`  Updating user: ${user.email}`);
                    console.log(`    Original name: ${originalName}`);
                    console.log(`    Fixed name:    ${fixedName}`);
                    userUpdated = true;
                    return { ...cv, fileName: fixedName };
                }
                return cv;
            });

            if (userUpdated) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { cvs: updatedCvs } }
                );
                updatedCount++;
            }
        }

        console.log(`✅ Successfully updated ${updatedCount} users' CV filenames.`);
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to run CV fix migration:', error);
        process.exit(1);
    }
}

run();
