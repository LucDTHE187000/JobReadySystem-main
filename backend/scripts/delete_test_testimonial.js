import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in env!");
  process.exit(1);
}

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
  },
  { collection: "blogs" }
);

const BlogModel = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function run() {
  try {
    console.log("🔌 Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected.");

    // Tìm và xóa các blog test có title là "director" hoặc nội dung "dsfadsf"
    const result = await BlogModel.deleteMany({
      $or: [
        { title: /director/i },
        { description: /dsfadsf/i }
      ]
    });

    console.log(`🧹 Deleted ${result.deletedCount} test testimonials from DB.`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Connection closed.");
  }
}

run();
