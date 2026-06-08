import "./config/env.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";

import { connectDatabase } from "./config/database.js";
import { swaggerSpec } from "./config/swagger.js";
import groqService from "./config/groq.js";
import geminiService from "./config/gemini.service.js";

import { authRouter } from "./modules/auth/auth.router.js";
import { cvRouter } from "./modules/cv/cv.router.js";
import { userRouter } from "./modules/users/user.router.js";
import jobRouter from "./modules/jobs/job.router.js";
import ApplicationRouter from "./modules/Application/jobApplication.router.js";
import interviewRouter from "./modules/interview/interview.router.js";
import paymentRouter from "./modules/payment/payment.router.js";
import feedbackRouter from "./modules/feedback/feedback.router.js";
import { courseRouter } from "./modules/courses/course.router.js";
import { seedCourses } from "./modules/courses/course.seeder.js";
import { adminRouter } from "./modules/admin/admin.router.js";
import notificationRouter from "./modules/notification/notification.router.js";
import campaignRouter from "./modules/campaign/campaign.router.js";
import blogRouter from "./modules/blog/blog.router.js";
import { contactRouter } from "./modules/contact/contact.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables and configurations
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Inject Groq Service into request
app.use((req, _res, next) => {
  req.groqClient = groqService;
  req.geminiClient = geminiService;
  next();
});

// ===== ROOT ROUTE =====
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "JobSeeker System API is running",
    docs: "/api/docs",
    health: "/api/health"
  });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ===== HEALTH CHECK =====
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ===== SWAGGER =====
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "JobSeeker System API Documentation",
  })
);

// ===== REGISTER ROUTES =====
app.use("/api/auth", authRouter);
app.use("/api/cv", cvRouter);
app.use("/api/users", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applications", ApplicationRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/courses", courseRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/contact", contactRouter);


// ===== ERROR HANDLER =====
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ===== 404 FALLBACK =====
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 4000;
const HOST =
  process.env.HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI environment variable is required");
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET environment variable is required");
      process.exit(1);
    }

    console.log("🔄 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully");
    await seedCourses();

    const server = app.listen(PORT, HOST, () => {
      const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
      const serverUrl = `http://${displayHost}:${PORT}`;

      console.log("\n🚀 ========================================");
      console.log(`✅ Server running at: ${serverUrl}`);
      console.log(`📚 Swagger: ${serverUrl}/api/docs`);
      console.log("🚀 ========================================\n");
    });

    process.on("SIGTERM", () => {
      server.close(() => process.exit(0));
    });

    process.on("SIGINT", () => {
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();
