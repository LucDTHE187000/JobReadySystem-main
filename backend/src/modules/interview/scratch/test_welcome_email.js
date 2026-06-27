import { sendWelcomeEmail } from "../../../utils/email.util.js";
import dotenv from "dotenv";
dotenv.config();

async function run() {
    console.log("Testing sendWelcomeEmail (Referred = false)...");
    const res1 = await sendWelcomeEmail("testseeker@yopmail.com", "Nguyễn Văn Test", false);
    console.log("Result 1:", res1);

    console.log("\nTesting sendWelcomeEmail (Referred = true)...");
    const res2 = await sendWelcomeEmail("testseeker_ref@yopmail.com", "Trần Thị Referral", true);
    console.log("Result 2:", res2);
}

run();
